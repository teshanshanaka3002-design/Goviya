const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

initializeApp();
const db = getFirestore();

/**
 * Callable Cloud Function: placeOrder
 * 
 * Secure backend order processing that:
 * 1. Enforces authenticated user (request.auth.uid as buyerId).
 * 2. Reads live product prices and stock directly from Firestore (never trusts client prices/totals).
 * 3. Atomically checks stock, decrements quantity, sets out_of_stock if 0, and creates pending orders.
 * 4. Groups items by farmerId if cart contains multiple farmers' produce (avoiding mixed-farmer orders).
 * 5. Guarantees consistency across all orders in a single Firestore transaction (no partial checkout).
 */
exports.placeOrder = onCall({ cors: true }, async (request) => {
  // 1. Require an authenticated Firebase user
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to place an order.');
  }

  const buyerId = request.auth.uid;
  const data = request.data || {};
  const {
    items,
    deliveryType = 'delivery',
    deliveryAddress = '',
    district = 'Colombo',
    paymentMethod = 'cash_on_delivery',
    notes = '',
    buyerName = '',
    buyerPhone = '',
    deliveryTimeSlot = 'Tomorrow (Morning 8:00 AM - 12:00 PM)',
    cashChangeDetails = '',
    cardDetails = null,
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError('invalid-argument', 'Order must contain at least one item.');
  }

  // Fetch buyer profile for default contact details
  let resolvedBuyerName = buyerName;
  let resolvedBuyerPhone = buyerPhone;
  try {
    const buyerDoc = await db.collection('users').doc(buyerId).get();
    if (buyerDoc.exists) {
      const uData = buyerDoc.data() || {};
      resolvedBuyerName = resolvedBuyerName || uData.name || 'Commercial Buyer';
      resolvedBuyerPhone = resolvedBuyerPhone || uData.phone || '';
    }
  } catch (err) {
    console.warn('Could not fetch buyer user doc:', err);
  }

  // Execute entire order placement and stock deduction in a single Firestore transaction
  const createdOrders = await db.runTransaction(async (transaction) => {
    // 3. Read each listing directly from Firestore
    const listingRefs = items.map((it) => db.collection('listings').doc(it.listingId));
    const listingSnaps = await Promise.all(listingRefs.map((ref) => transaction.get(ref)));

    const listingMap = new Map();

    for (let i = 0; i < items.length; i++) {
      const reqItem = items[i];
      const snap = listingSnaps[i];

      if (!snap.exists) {
        throw new HttpsError('not-found', `Listing "${reqItem.listingId}" is no longer available.`);
      }

      const lData = snap.data();
      const currentStock = Number(lData.quantityKg ?? lData.quantity ?? 0);
      const currentPrice = Number(lData.pricePerKg ?? lData.price ?? 0);
      const status = lData.status || 'active';

      // 4. Verify listing is active
      if (status !== 'active') {
        throw new HttpsError(
          'failed-precondition',
          `Listing "${lData.cropName || reqItem.listingId}" is no longer active.`
        );
      }

      const reqQty = Number(reqItem.quantityKg || 0);
      if (reqQty <= 0) {
        throw new HttpsError(
          'invalid-argument',
          `Requested quantity for "${lData.cropName || reqItem.listingId}" must be greater than zero.`
        );
      }

      // 5. Verify requested quantity is available
      if (reqQty > currentStock) {
        throw new HttpsError(
          'resource-exhausted',
          `Insufficient stock for "${lData.cropName || reqItem.listingId}". Available: ${currentStock}kg, requested: ${reqQty}kg.`
        );
      }

      listingMap.set(reqItem.listingId, {
        ref: listingRefs[i],
        data: lData,
        currentStock,
        currentPrice, // 6. Read the real price from Firestore
        requestedQty: reqQty,
        remainingStock: currentStock - reqQty,
      });
    }

    // 8. Group items by farmerId if multiple farmers exist
    const farmerGroups = new Map();
    for (const [listingId, itemInfo] of listingMap.entries()) {
      const farmerId = itemInfo.data.farmerId || 'unknown_farmer';
      if (!farmerGroups.has(farmerId)) {
        farmerGroups.set(farmerId, []);
      }
      farmerGroups.get(farmerId).push({ listingId, ...itemInfo });
    }

    const ordersToCommit = [];

    for (const [farmerId, farmerItems] of farmerGroups.entries()) {
      // 7. Calculate subtotal and total on the backend
      let subtotal = 0;
      const orderItems = [];
      const firstListing = farmerItems[0].data;

      const farmerName = firstListing.farmerName || 'Farmer';
      const farmerPhone = firstListing.farmerPhone || '';
      const location = firstListing.location || {
        lat: 6.9697,
        lng: 80.7891,
        district: 'Nuwara Eliya',
        town: 'Kandapola',
      };

      for (const fItem of farmerItems) {
        const itemTotal = fItem.currentPrice * fItem.requestedQty;
        subtotal += itemTotal;

        orderItems.push({
          listingId: fItem.listingId,
          cropName: fItem.data.cropName || 'Fresh Produce',
          category: fItem.data.category || 'Vegetables',
          photoUrl: (Array.isArray(fItem.data.photos) && fItem.data.photos[0]) || 'carrots',
          quantityKg: fItem.requestedQty,
          pricePerKg: fItem.currentPrice,
        });

        // 10 & 11. Reduce stock atomically; set out_of_stock when stock reaches 0
        transaction.update(fItem.ref, {
          quantity: fItem.remainingStock,
          quantityKg: fItem.remainingStock,
          status: fItem.remainingStock === 0 ? 'out_of_stock' : fItem.data.status,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      const deliveryFee = deliveryType === 'pickup' ? 0 : 1500;
      const serviceFee = 0;
      const total = subtotal + deliveryFee + serviceFee;

      const orderRef = db.collection('orders').doc();
      const orderNumber = `GOV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;
      const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // 12 & 13. Create orders with status = pending and server timestamps
      const orderPayload = {
        _id: orderRef.id,
        orderNumber,
        buyerId, // 2. Use request.auth.uid as buyerId
        buyerName: resolvedBuyerName,
        buyerPhone: resolvedBuyerPhone,
        farmerId,
        farmerName,
        farmerPhone,
        farmerAddress: `${location.town}, ${location.district}`,
        items: orderItems,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        paymentMethod,
        deliveryType,
        pickupLocation: {
          lat: location.lat,
          lng: location.lng,
          district: location.district,
          town: location.town,
          address: `${farmerName}'s Farm, ${location.town}, ${location.district}`,
          directions: `Located near ${location.town} Agrarian Services Centre. Contact ${farmerPhone} on approach.`,
        },
        pickupPin,
        deliveryAddress: deliveryType === 'pickup' ? `Direct Farm Gate Pickup (${location.town})` : deliveryAddress,
        deliveryDistrict: deliveryType === 'pickup' ? location.district : district,
        deliveryNotes: notes,
        deliveryTimeSlot,
        cashChangeDetails: cashChangeDetails || '',
        cardDetails: cardDetails || null,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        timeline: [
          {
            status: 'pending',
            label: deliveryType === 'pickup' ? 'Order Placed (Farm Self-Pickup)' : 'Order Placed (Doorstep Delivery)',
            timestamp: nowTimeStr,
            note:
              deliveryType === 'pickup'
                ? `Direct farm pickup requested. Farmer ${farmerName} notified to pack harvest at farm gate.`
                : `Doorstep delivery requested. Farmer ${farmerName} notified to prepare crates for driver dispatch. Payment: ${paymentMethod.replace(/_/g, ' ').toUpperCase()}`,
          },
        ],
      };

      transaction.set(orderRef, orderPayload);
      ordersToCommit.push({
        orderId: orderRef.id,
        orderNumber,
        farmerId,
        total,
        order: orderPayload,
      });
    }

    return ordersToCommit;
  });

  // 14. Return created order IDs to the app
  return {
    success: true,
    orderIds: createdOrders.map((o) => o.orderId),
    orders: createdOrders.map((o) => o.order),
  };
});
