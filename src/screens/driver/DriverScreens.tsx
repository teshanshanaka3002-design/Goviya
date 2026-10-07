import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle,
  Navigation,
  Phone,
  DollarSign,
  Clock,
  Calendar,
  ShieldCheck,
  Check,
  Camera,
  Signature,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { SriLankaMap } from '../../components/shared/SriLankaMap';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { Order } from '../../types';

// ===================== 1. DRIVER HOME & DASHBOARD =====================
export const DriverHomeScreen: React.FC = () => {
  const { orders, currentUser, goToSubScreen } = useApp();
  const [isOnline, setIsOnline] = useState(true);

  // Deliveries available for logistics fleet drivers (Excludes self-pickup orders)
  const assignedDeliveries = orders.filter(
    o => o.deliveryType !== 'pickup' && (o.status === 'ready_for_pickup' || o.status === 'out_for_delivery' || o.status === 'preparing')
  );

  const completedToday = orders.filter(o => o.deliveryType !== 'pickup' && o.status === 'delivered');
  const todayEarnings = 4850 + completedToday.length * 1500;

  return (
    <div className="space-y-4 px-4 pt-2 pb-24 text-left">
      {/* Availability Status Card */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E5E5E5]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              isOnline ? 'bg-[#1F5C3A] animate-pulse' : 'bg-[#9CA3AF]'
            }`}
          />
          <div>
            <h4 className="text-xs font-bold text-[#1A1A1A]">
              Fleet Status: {isOnline ? 'Active & Ready for Dispatch' : 'Offline'}
            </h4>
            <p className="text-[10px] text-[#6B7280]">
              Vehicle: {currentUser?.vehiclePlate || 'WP - LG 8824 (Dimas Truck)'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isOnline
              ? 'bg-[#E6F2E8] text-[#1F5C3A]'
              : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="mint" padding="md">
          <div className="text-[10px] uppercase font-bold text-[#4B6B56]">
            Today's Fleet Pay
          </div>
          <div className="text-xl font-black text-[#1F5C3A] mt-0.5">
            LKR {todayEarnings.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#4B6B56] mt-0.5">
            +LKR 800 fuel subsidy included
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="text-[10px] uppercase font-bold text-[#6B7280]">
            Assigned Routes
          </div>
          <div className="text-xl font-black text-[#1A1A1A] mt-0.5">
            {assignedDeliveries.length}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">
            Highland & Western corridors
          </div>
        </Card>
      </div>

      {/* Active Tasks Feed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
            Active Delivery Jobs
          </h3>
          <span className="text-[11px] text-[#2E8C9F] font-semibold">
            {assignedDeliveries.length} pending
          </span>
        </div>

        <div className="space-y-3">
          {assignedDeliveries.length === 0 ? (
            <EmptyState
              title="No active routes assigned"
              description="New orders from farmers preparing harvests will appear here automatically."
            />
          ) : (
            assignedDeliveries.map(delivery => (
              <Card
                key={delivery._id}
                variant="interactive"
                padding="md"
                onClick={() => goToSubScreen('driver_delivery_detail', { orderId: delivery._id })}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6B7280]">
                    {delivery.orderNumber}
                  </span>
                  <StatusPill status={delivery.status} />
                </div>

                {/* Pickup & Drop off */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1F5C3A] mt-1 shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#6B7280] uppercase">Pickup Farm</div>
                      <div className="font-bold text-[#1A1A1A]">{delivery.farmerName}</div>
                      <div className="text-[#6B7280] text-[11px]">{delivery.farmerAddress}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5BB5C9] mt-1 shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#6B7280] uppercase">Drop-Off Destination</div>
                      <div className="font-bold text-[#1A1A1A]">{delivery.buyerName}</div>
                      <div className="text-[#6B7280] text-[11px]">{delivery.deliveryAddress}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">
                    {delivery.items.reduce((acc, i) => acc + i.quantityKg, 0)} kg produce
                  </span>
                  <span className="font-bold text-[#1F5C3A] flex items-center gap-1">
                    <span>Manage Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ===================== 2. DRIVER DELIVERY DETAIL & WORKFLOW =====================
export const DriverDeliveryDetailScreen: React.FC = () => {
  const { navState, orders, driverConfirmPickup, driverConfirmDelivery, goBack } = useApp();
  const [pickupChecked, setPickupChecked] = useState(false);
  const [deliverySigned, setDeliverySigned] = useState(false);
  const [isPickupSheetOpen, setIsPickupSheetOpen] = useState(false);
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = useState(false);

  const order = orders.find(o => o._id === navState.selectedOrderId) || orders[0];
  if (!order) return null;

  const markers = [
    {
      id: 'pickup',
      name: order.farmerName,
      district: 'Central',
      town: order.farmerAddress,
      lat: 6.9697,
      lng: 80.7891,
      type: 'farmer' as const,
    },
    {
      id: 'dropoff',
      name: order.buyerName,
      district: order.deliveryDistrict,
      town: order.deliveryAddress,
      lat: 6.9271,
      lng: 79.8612,
      type: 'buyer' as const,
    },
  ];

  const totalKg = order.items.reduce((acc, i) => acc + i.quantityKg, 0);

  const handleConfirmPickup = () => {
    driverConfirmPickup(order._id);
    setIsPickupSheetOpen(false);
  };

  const handleConfirmDelivery = () => {
    driverConfirmDelivery(order._id);
    setIsDeliverySheetOpen(false);
    goBack();
  };

  return (
    <div className="space-y-4 p-4 pb-24 text-left">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-[#6B7280]">{order.orderNumber}</span>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Trip Navigation & Tasks</h2>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* Route Map Preview */}
      <SriLankaMap
        markers={markers}
        showRoute={true}
        routeTitle={`${order.farmerAddress.split(',')[0]} ➔ ${order.deliveryDistrict}`}
        className="h-56"
      />

      {/* Step 1: Pickup Location Card */}
      <Card variant="default" padding="md" className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#1F5C3A] uppercase tracking-wider">
            Step 1: Farm Pickup
          </span>
          <button
            type="button"
            onClick={() => {
              window.location.href = `tel:${order.farmerPhone}`;
            }}
            className="p-1.5 rounded-lg bg-[#E6F2E8] text-[#1F5C3A] flex items-center gap-1 text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Farmer</span>
          </button>
        </div>
        <h4 className="text-sm font-bold text-[#1A1A1A]">{order.farmerName}</h4>
        <p className="text-xs text-[#6B7280] flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#1F5C3A]" />
          <span>{order.farmerAddress}</span>
        </p>

        {order.status === 'ready_for_pickup' || order.status === 'accepted' ? (
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => setIsPickupSheetOpen(true)}
          >
            Arrived at Farm · Confirm Pickup
          </Button>
        ) : (
          <div className="text-xs font-bold text-[#1F5C3A] bg-[#E6F2E8] p-2 rounded-xl flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>Produce Picked Up & Crates Inspected</span>
          </div>
        )}
      </Card>

      {/* Step 2: Drop-Off Location Card */}
      <Card variant="default" padding="md" className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#2E8C9F] uppercase tracking-wider">
            Step 2: Destination Drop-Off
          </span>
          <button
            type="button"
            onClick={() => {
              window.location.href = `tel:${order.buyerPhone}`;
            }}
            className="p-1.5 rounded-lg bg-[#EEF8FA] text-[#19768A] flex items-center gap-1 text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Buyer</span>
          </button>
        </div>
        <h4 className="text-sm font-bold text-[#1A1A1A]">{order.buyerName}</h4>
        <p className="text-xs text-[#6B7280] flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#2E8C9F]" />
          <span>{order.deliveryAddress}</span>
        </p>
        {order.deliveryNotes && (
          <p className="text-[11px] text-[#B45309] bg-[#FEF8EA] p-2 rounded-xl">
            Note: {order.deliveryNotes}
          </p>
        )}

        {order.status === 'out_for_delivery' && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setIsDeliverySheetOpen(true)}
          >
            Arrived at Destination · Confirm Delivery
          </Button>
        )}
      </Card>

      {/* Cargo Cargo Manifest */}
      <Card variant="default" padding="md">
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
          Cargo Manifest ({totalKg} KG Total)
        </h4>
        <div className="space-y-2">
          {order.items.map(i => (
            <div key={i.listingId} className="flex items-center justify-between text-xs py-1 border-b border-[#F0F0EE]">
              <div className="flex items-center gap-2">
                <ProduceVisual type={i.cropName} size="sm" />
                <div>
                  <div className="font-bold text-[#1A1A1A]">{i.cropName}</div>
                  <div className="text-[10px] text-[#6B7280]">{i.category}</div>
                </div>
              </div>
              <span className="font-bold text-[#1A1A1A]">{i.quantityKg} kg</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pickup BottomSheet Modal */}
      <BottomSheet
        isOpen={isPickupSheetOpen}
        onClose={() => setIsPickupSheetOpen(false)}
        title="Confirm Farm Gate Pickup"
      >
        <div className="space-y-4 text-left pb-4">
          <p className="text-xs text-[#6B7280]">
            Verify cargo weight and crate freshness before leaving {order.farmerName}'s farm:
          </p>

          <label className="flex items-center gap-3 p-3 bg-[#F6F7F5] rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={pickupChecked}
              onChange={e => setPickupChecked(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5C3A] focus:ring-[#1F5C3A]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#1A1A1A] block">
                Inspected {totalKg} kg Produce
              </span>
              <span className="text-[#6B7280]">
                Crates are undamaged, properly ventilated, and harvest grade matches order.
              </span>
            </div>
          </label>

          <div className="p-3 bg-[#E6F2E8] rounded-xl text-xs text-[#1F5C3A] flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Field photo captured & geotagged (Nuwara Eliya)</span>
          </div>

          <Button
            variant="primary"
            fullWidth
            disabled={!pickupChecked}
            onClick={handleConfirmPickup}
          >
            Confirm Pickup & Start Route
          </Button>
        </div>
      </BottomSheet>

      {/* Delivery Confirmation BottomSheet */}
      <BottomSheet
        isOpen={isDeliverySheetOpen}
        onClose={() => setIsDeliverySheetOpen(false)}
        title="Confirm Handover to Buyer"
      >
        <div className="space-y-4 text-left pb-4">
          <p className="text-xs text-[#6B7280]">
            Collect recipient confirmation and collect payment if COD:
          </p>

          <div className="p-3 bg-[#F6F7F5] rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Payment Mode:</span>
              <span className="font-bold text-[#1A1A1A] uppercase">
                {order.paymentMethod.replace('_', ' ')}
              </span>
            </div>
            {order.paymentMethod === 'cash_on_delivery' && (
              <div className="flex justify-between text-[#C8452D] font-bold">
                <span>Collect Cash Amount:</span>
                <span>LKR {order.total.toLocaleString()}</span>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 p-3 bg-[#F6F7F5] rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={deliverySigned}
              onChange={e => setDeliverySigned(e.target.checked)}
              className="w-4 h-4 rounded text-[#1F5C3A] focus:ring-[#1F5C3A]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#1A1A1A] block">
                Buyer Inspected & Accepted Crates
              </span>
              <span className="text-[#6B7280]">
                Recipient signed delivery manifest at {order.deliveryAddress}.
              </span>
            </div>
          </label>

          <Button
            variant="primary"
            fullWidth
            disabled={!deliverySigned}
            onClick={handleConfirmDelivery}
          >
            Confirm Delivery Completed
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};

// ===================== 3. DRIVER EARNINGS SCREEN =====================
export const DriverEarningsScreen: React.FC = () => {
  return (
    <div className="space-y-4 p-4 pb-24 text-left">
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Logistics Earnings</h2>
        <p className="text-xs text-[#6B7280]">
          Weekly payout schedule via Commercial Bank of Ceylon
        </p>
      </div>

      <Card variant="mint" padding="lg" className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#4B6B56]">
          Current Week Payout
        </span>
        <div className="text-2xl font-black text-[#1F5C3A]">
          LKR 28,450.00
        </div>
        <p className="text-xs text-[#4B6B56]">
          Next direct bank transfer: Thursday, Oct 08
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card variant="default" padding="md">
          <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Trips Done</div>
          <div className="text-lg font-bold text-[#1A1A1A]">14 Deliveries</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Fuel Allowance</div>
          <div className="text-lg font-bold text-[#1F5C3A]">LKR 6,200</div>
        </Card>
      </div>

      {/* Breakdown List */}
      <div>
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
          Recent Trip Statements
        </h4>
        <div className="space-y-2">
          {[
            {
              id: 'TRIP-881',
              route: 'Kandapola ➔ Colombo 05',
              date: 'Oct 05, 2026',
              weight: '65 kg',
              payout: 'LKR 2,450',
            },
            {
              id: 'TRIP-879',
              route: 'Galewela ➔ Kandy City',
              date: 'Oct 04, 2026',
              weight: '40 kg',
              payout: 'LKR 1,800',
            },
            {
              id: 'TRIP-875',
              route: 'Chunnakam ➔ Dambulla Hub',
              date: 'Oct 02, 2026',
              weight: '120 kg',
              payout: 'LKR 3,800',
            },
          ].map(trip => (
            <Card key={trip.id} variant="default" padding="sm" className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1A1A1A]">{trip.route}</span>
                <span className="font-extrabold text-[#1F5C3A]">{trip.payout}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#6B7280]">
                <span>{trip.date} · {trip.weight}</span>
                <span className="text-[#1F5C3A] font-medium">Settled</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== 4. DRIVER PROFILE SCREEN =====================
export const DriverProfileScreen: React.FC = () => {
  const { currentUser, logout } = useApp();

  return (
    <div className="p-4 space-y-4 pb-20 text-left">
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#E5E5E5]">
        <Avatar name={currentUser?.name || 'Driver'} size="lg" role="driver" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-[#1A1A1A] truncate">{currentUser?.name}</h3>
            {currentUser?.verified && (
              <ShieldCheck className="w-4 h-4 text-[#2E8C9F] shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#6B7280]">{currentUser?.vehicleType}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold text-[#19768A] bg-[#EEF8FA] px-2 py-0.5 rounded-full">
            Logistics Fleet Partner
          </span>
        </div>
      </div>

      <Card variant="default" padding="md" className="space-y-3">
        <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Vehicle & Credentials
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">Vehicle Registration:</span>
            <span className="font-semibold text-[#1A1A1A]">{currentUser?.vehiclePlate || 'WP - LG 8824'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">Driver Rating:</span>
            <span className="font-semibold text-[#1F5C3A]">4.95 ★ (215 deliveries)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
            <span className="text-[#6B7280]">Home Hub:</span>
            <span className="font-semibold text-[#1A1A1A]">Kadawatha Logistics Interchange</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F0F0EE]">
          <Button variant="destructive" fullWidth size="md" onClick={logout}>
            Log Out of Logistics Fleet
          </Button>
        </div>
      </Card>
    </div>
  );
};
