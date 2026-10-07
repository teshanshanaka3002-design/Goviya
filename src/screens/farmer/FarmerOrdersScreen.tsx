import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Truck,
  Store,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProduceVisual } from '../../components/ui/ProduceVisual';
import { Avatar } from '../../components/ui/Avatar';
import { Order, OrderStatus } from '../../types';

export const FarmerOrdersScreen: React.FC = () => {
  const {
    orders,
    currentUser,
    users,
    loginAsUser,
    farmerAcceptOrder,
    farmerRejectOrder,
    farmerUpdateOrderStatus,
    farmerConfirmPickupHandover,
    getOrCreateConversation,
    goToSubScreen,
  } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'transit' | 'delivered'>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'all' | 'delivery' | 'pickup'>('all');

  // Modals
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Insufficient harvest volume due to weather/rain');
  const [customPrepNote, setCustomPrepNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Farmer resolution
  const currentFarmerId = currentUser?.role === 'farmer' ? currentUser._id : 'user_farmer_1';
  const currentFarmer = users.find(u => u._id === currentFarmerId) || currentUser;

  // STRICTLY filter orders belonging to this farmer
  const farmerOrders = orders.filter(
    o => o.farmerId === currentFarmerId || (currentFarmer && o.farmerName === currentFarmer.name)
  );

  // Status-specific counts
  const pendingOrders = farmerOrders.filter(o => o.status === 'pending');
  const preparingOrders = farmerOrders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = farmerOrders.filter(o => o.status === 'ready_for_pickup');
  const transitOrders = farmerOrders.filter(o => o.status === 'out_for_delivery');
  const deliveredOrders = farmerOrders.filter(o => o.status === 'delivered');

  // Apply filters
  const filteredOrders = farmerOrders.filter(order => {
    // Status filter
    if (statusFilter === 'pending' && order.status !== 'pending') return false;
    if (statusFilter === 'preparing' && order.status !== 'accepted' && order.status !== 'preparing') return false;
    if (statusFilter === 'ready' && order.status !== 'ready_for_pickup') return false;
    if (statusFilter === 'transit' && order.status !== 'out_for_delivery') return false;
    if (statusFilter === 'delivered' && order.status !== 'delivered') return false;

    // Delivery Type filter
    if (deliveryTypeFilter === 'pickup' && order.deliveryType !== 'pickup') return false;
    if (deliveryTypeFilter === 'delivery' && order.deliveryType === 'pickup') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchBuyer = order.buyerName.toLowerCase().includes(q);
      const matchCrop = order.items.some(i => i.cropName.toLowerCase().includes(q));
      const matchAddress = (order.deliveryAddress || '').toLowerCase().includes(q);
      if (!matchOrderNum && !matchBuyer && !matchCrop && !matchAddress) return false;
    }

    return true;
  });

  const totalRevenue = farmerOrders
    .filter(o => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const activeUpdatingOrder = orders.find(o => o._id === statusUpdatingOrderId);
  const selectedOrder = orders.find(o => o._id === selectedOrderId);

  // Direct Chat Handler
  const handleChatWithBuyer = (order: Order) => {
    const primaryCrop = order.items[0]?.cropName || 'Fresh Harvest';
    const convId = getOrCreateConversation(order.buyerId, order.buyerName, primaryCrop, 'buyer');
    goToSubScreen('chat_detail', { conversationId: convId });
  };

  const farmerProfiles = users.filter(u => u.role === 'farmer');

  return (
    <div className="space-y-4 px-4 pt-2 pb-24 text-left max-w-lg mx-auto animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5C3A] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Buyer Orders</h2>
          <p className="text-xs text-[#6B7280]">
            Track buyer purchases, update harvest progress, and chat with buyers
          </p>
        </div>
        <div className="bg-[#E6F2E8] text-[#1F5C3A] px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{farmerOrders.length} Orders</span>
        </div>
      </div>

      {/* Farmer Switcher Banner */}
      <div className="bg-[#E6F2E8] border border-[#CDE5D2] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={currentFarmer?.name || 'Farmer'} size="sm" role="farmer" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-[#1F5C3A] truncate">
                {currentFarmer?.name}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A] shrink-0" />
            </div>
            <p className="text-[10px] text-[#4B6B56] truncate">
              {currentFarmer?.farmName || 'Direct Producer'} · {currentFarmer?.location?.town || currentFarmer?.location?.district}
            </p>
          </div>
        </div>

        {farmerProfiles.length > 1 && (
          <div className="shrink-0 flex items-center gap-1">
            <span className="text-[9px] font-bold text-[#4B6B56] uppercase hidden sm:inline">Farmer:</span>
            <select
              value={currentFarmerId}
              onChange={e => loginAsUser(e.target.value)}
              className="text-[10px] font-bold text-[#1F5C3A] bg-white border border-[#CDE5D2] rounded-lg px-2 py-1 shadow-2xs cursor-pointer focus:outline-none"
              title="Switch active farmer"
            >
              {farmerProfiles.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.location?.town || f.location?.district})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
            statusFilter === 'all'
              ? 'bg-[#1F5C3A] text-white border-[#1F5C3A]'
              : 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F9FAF8]'
          }`}
        >
          <div className={`text-[9px] uppercase font-bold ${statusFilter === 'all' ? 'text-white/80' : 'text-[#6B7280]'}`}>
            All Orders
          </div>
          <div className="text-lg font-black mt-0.5">{farmerOrders.length}</div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F9FAF8]'
          }`}
        >
          <div className={`text-[9px] uppercase font-bold ${statusFilter === 'pending' ? 'text-white/80' : 'text-[#6B7280]'}`}>
            Pending
          </div>
          <div className="text-lg font-black mt-0.5 text-amber-600">{pendingOrders.length}</div>
        </div>

        <div
          onClick={() => setStatusFilter('preparing')}
          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
            statusFilter === 'preparing'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F9FAF8]'
          }`}
        >
          <div className={`text-[9px] uppercase font-bold ${statusFilter === 'preparing' ? 'text-white/80' : 'text-[#6B7280]'}`}>
            Harvesting
          </div>
          <div className="text-lg font-black mt-0.5 text-blue-600">{preparingOrders.length}</div>
        </div>

        <div className="p-2.5 rounded-xl border bg-white border-[#E5E5E5] text-left">
          <div className="text-[9px] uppercase font-bold text-[#6B7280]">Total LKR</div>
          <div className="text-sm font-black text-[#1F5C3A] mt-1 truncate">
            {totalRevenue > 99999 ? `${(totalRevenue / 1000).toFixed(0)}k` : totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Method Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order #, buyer name, or crop (e.g. Carrots)..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: `All (${farmerOrders.length})` },
            { id: 'pending', label: `Pending (${pendingOrders.length})` },
            { id: 'preparing', label: `Harvesting (${preparingOrders.length})` },
            { id: 'ready', label: `Ready (${readyOrders.length})` },
            { id: 'transit', label: `In Transit (${transitOrders.length})` },
            { id: 'delivered', label: `Delivered (${deliveredOrders.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#1F5C3A] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E5E5] text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Delivery Type Segmented Toggle */}
        <div className="flex bg-[#F0F2EE] p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setDeliveryTypeFilter('all')}
            className={`flex-1 py-1 rounded-lg text-center transition-colors cursor-pointer ${
              deliveryTypeFilter === 'all' ? 'bg-white text-[#1F5C3A] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            All Methods
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTypeFilter('pickup')}
            className={`flex-1 py-1 rounded-lg text-center transition-colors cursor-pointer ${
              deliveryTypeFilter === 'pickup' ? 'bg-white text-[#1F5C3A] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            🏪 Farm Gate Pickup
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTypeFilter('delivery')}
            className={`flex-1 py-1 rounded-lg text-center transition-colors cursor-pointer ${
              deliveryTypeFilter === 'delivery' ? 'bg-white text-[#1F5C3A] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            🚚 Doorstep Fleet
          </button>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-3 pt-1">
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="No buyer orders match the selected filters or search query."
            actionLabel="Reset Filters"
            onAction={() => {
              setStatusFilter('all');
              setDeliveryTypeFilter('all');
              setSearchQuery('');
            }}
          />
        ) : (
          filteredOrders.map(order => {
            const isPickupOrder = order.deliveryType === 'pickup';

            return (
              <Card
                key={order._id}
                variant="default"
                padding="md"
                className="space-y-3 hover:border-[#1F5C3A]/50 transition-colors"
              >
                {/* Header: Order #, Type & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#6B7280] font-bold">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isPickupOrder
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {isPickupOrder ? '🏪 Farm Self-Pickup' : '🚚 Driver Delivery'}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                      Placed: {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <StatusPill status={order.status} />
                </div>

                {/* Buyer Information Block */}
                <div className="p-2.5 bg-[#F6F7F5] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={order.buyerName} size="sm" role="buyer" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                        Buyer: {order.buyerName}
                      </h4>
                      <p className="text-[10px] text-[#6B7280] truncate">
                        {isPickupOrder
                          ? `Collecting at ${order.farmerAddress.split(',')[0] || 'Farm Gate'}`
                          : `Deliver to ${order.deliveryAddress}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${order.buyerPhone}`}
                      className="p-1.5 bg-white border border-[#E5E5E5] hover:bg-[#E6F2E8] text-[#1F5C3A] rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Call Buyer"
                    >
                      <Phone className="w-3 h-3" />
                      <span className="text-[10px] hidden sm:inline">Call</span>
                    </a>
                    {/* PRIMARY ACTION: CHAT WITH BUYER */}
                    <button
                      type="button"
                      onClick={() => handleChatWithBuyer(order)}
                      className="p-1.5 bg-[#1F5C3A] text-white hover:bg-[#16452B] rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      title="Chat with Buyer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-[10px]">Chat</span>
                    </button>
                  </div>
                </div>

                {/* Items & Amount */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map(item => (
                    <div
                      key={item.listingId}
                      className="flex items-center justify-between py-1 border-b border-[#F0F0EE] last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <ProduceVisual type={item.cropName} size="sm" />
                        <div>
                          <span className="font-semibold text-[#1A1A1A]">{item.cropName}</span>
                          <span className="text-[#6B7280] ml-1.5">
                            {item.quantityKg} kg @ LKR {item.pricePerKg}
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-[#1F5C3A]">
                        LKR {(item.pricePerKg * item.quantityKg).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div className="pt-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6B7280]">
                      Total Harvest Value:
                    </span>
                    <span className="text-[#1F5C3A] font-black text-sm">
                      LKR {order.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {isPickupOrder && (
                    <div className="flex justify-between text-[11px] text-[#854D0E] bg-amber-50 p-2 rounded-lg border border-amber-200 font-semibold mt-1">
                      <span>Buyer Pickup PIN:</span>
                      <span className="font-mono text-xs font-black">#{order.pickupPin || '4821'}</span>
                    </div>
                  )}
                </div>

                {/* Live Preparation Note / Milestone Tracker */}
                {order.preparationNote && (
                  <div className="p-2 bg-[#EEF8FA] border border-[#D0EEF5] rounded-xl text-xs space-y-0.5">
                    <div className="text-[10px] font-bold text-[#19768A] flex items-center justify-between">
                      <span>🌱 Active Prep Milestone</span>
                      <span className="text-[#528796]">Live to Buyer</span>
                    </div>
                    <p className="text-[11px] text-[#2C4F58]">
                      {order.preparationNote}
                    </p>
                  </div>
                )}

                {/* ACTION BUTTONS & PROCESS UPDATE */}
                <div className="pt-1 flex items-center gap-2">
                  {/* Chat With Buyer CTA */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#1F5C3A]" />}
                    onClick={() => handleChatWithBuyer(order)}
                  >
                    Chat with Buyer
                  </Button>

                  {/* Dynamic Process Updating Buttons */}
                  {order.status === 'pending' && (
                    <div className="flex gap-1.5 flex-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => setRejectingOrderId(order._id)}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          farmerAcceptOrder(order._id);
                          showToast(`Order ${order.orderNumber} accepted! Scheduled for harvest.`);
                        }}
                      >
                        Accept
                      </Button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        farmerUpdateOrderStatus(
                          order._id,
                          'preparing',
                          'Harvesting fresh produce from field and preparing crates'
                        );
                        setStatusUpdatingOrderId(order._id);
                        showToast('Preparation started! Buyer notified.');
                      }}
                    >
                      Start Harvesting →
                    </Button>
                  )}

                  {order.status === 'preparing' && (
                    <div className="flex gap-1.5 flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-[11px]"
                        onClick={() => setStatusUpdatingOrderId(order._id)}
                      >
                        Update Note
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-[11px]"
                        onClick={() => {
                          farmerUpdateOrderStatus(
                            order._id,
                            'ready_for_pickup',
                            isPickupOrder
                              ? `Packed and ready for buyer pickup at ${order.farmerName}'s farm gate!`
                              : 'Weighed, labeled & packed into crates. Ready for Logistics Driver to collect.'
                          );
                          showToast(
                            isPickupOrder
                              ? 'Marked ready! Buyer notified to pick up at farm.'
                              : 'Marked ready! Available for logistics driver pickup.'
                          );
                        }}
                      >
                        Mark Ready
                      </Button>
                    </div>
                  )}

                  {order.status === 'ready_for_pickup' && (
                    <div className="flex-1">
                      {isPickupOrder ? (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => {
                            farmerConfirmPickupHandover(order._id);
                            showToast(`Harvest handed over to buyer ${order.buyerName}!`);
                          }}
                        >
                          Confirm Handover
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() => {
                            farmerUpdateOrderStatus(
                              order._id,
                              'ready_for_pickup',
                              'Farmer reaffirmed crates ready at dispatch gate'
                            );
                            showToast('Logistics fleet alerted.');
                          }}
                        >
                          Re-Ping Driver
                        </Button>
                      )}
                    </div>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <div className="text-[11px] text-[#19768A] font-semibold text-right flex-1">
                      🚚 En Route with Driver
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="text-[11px] text-[#1F5C3A] font-bold text-right flex-1 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Reject Order BottomSheet */}
      <BottomSheet
        isOpen={!!rejectingOrderId}
        onClose={() => setRejectingOrderId(null)}
        title="Decline Harvest Order"
      >
        <div className="space-y-4 text-left pb-4">
          <p className="text-xs text-[#6B7280]">
            Please select the reason for declining. The buyer will be notified immediately:
          </p>

          <div className="space-y-2">
            {[
              'Insufficient harvest volume due to weather/rain',
              'Requested quantity already reserved for existing batch',
              'Produce requires 3 more days before optimal harvest brix',
              'Logistics corridor currently inaccessible',
            ].map(reason => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs ${
                  rejectReason === reason
                    ? 'border-[#C8452D] bg-[#FDEEEB] text-[#C8452D] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#1A1A1A]'
                }`}
              >
                <input
                  type="radio"
                  name="reject_reason_orders"
                  checked={rejectReason === reason}
                  onChange={() => setRejectReason(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRejectingOrderId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (rejectingOrderId) {
                  farmerRejectOrder(rejectingOrderId, rejectReason);
                  setRejectingOrderId(null);
                  showToast('Order declined.');
                }
              }}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Milestone / Process Update BottomSheet */}
      <BottomSheet
        isOpen={!!statusUpdatingOrderId}
        onClose={() => {
          setStatusUpdatingOrderId(null);
          setCustomPrepNote('');
        }}
        title="Update Harvest Process & Notify Buyer"
        footer={
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              size="md"
              className="flex-1 text-xs"
              onClick={() => {
                if (statusUpdatingOrderId) {
                  const noteToSave = customPrepNote.trim() || 'Harvesting & packing in progress';
                  farmerUpdateOrderStatus(statusUpdatingOrderId, 'preparing', noteToSave);
                  setStatusUpdatingOrderId(null);
                  setCustomPrepNote('');
                  showToast('Live tracking updated for buyer!');
                }
              }}
            >
              Save Progress
            </Button>

            <Button
              variant="primary"
              size="md"
              className="flex-1 text-xs font-bold"
              onClick={() => {
                if (statusUpdatingOrderId) {
                  const isSelfPickup = activeUpdatingOrder?.deliveryType === 'pickup';
                  farmerUpdateOrderStatus(
                    statusUpdatingOrderId,
                    'ready_for_pickup',
                    isSelfPickup
                      ? `Harvest is packed and ready for buyer pickup at the farm gate! Bring Order PIN.`
                      : 'Crates weighed, labeled & stacked at farm dispatch gate. Ready for Logistics Driver collection.'
                  );
                  setStatusUpdatingOrderId(null);
                  setCustomPrepNote('');
                  showToast(
                    isSelfPickup
                      ? 'Marked Ready! Buyer notified for farm gate collection.'
                      : 'Marked Ready! Available to logistics fleet drivers.'
                  );
                }
              }}
            >
              {activeUpdatingOrder?.deliveryType === 'pickup' ? 'Ready for Pickup →' : 'Ready for Driver →'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-left pb-2">
          {/* Active Order Summary Header */}
          {activeUpdatingOrder && (
            <div className="bg-[#F6F7F5] p-2.5 rounded-xl border border-[#E5E5E5] text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-[#1A1A1A]">
                  Order {activeUpdatingOrder.orderNumber} · {activeUpdatingOrder.buyerName}
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  {activeUpdatingOrder.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  activeUpdatingOrder.deliveryType === 'pickup'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {activeUpdatingOrder.deliveryType === 'pickup' ? 'Farm Pickup' : 'Fleet Delivery'}
              </span>
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold text-[#374151] block mb-1.5">
              Select Current Milestone:
            </span>

            {/* Compact 2x2 Grid for Milestones */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'harvesting',
                  emoji: '🌱',
                  title: '1. Harvesting',
                  desc: 'Picking morning yield in field',
                  fullText: 'Harvesting fresh produce from field right now in prime morning quality',
                },
                {
                  id: 'sorting',
                  emoji: '🧼',
                  title: '2. Sorting Grade A',
                  desc: 'Root washing & wholesale sorting',
                  fullText: 'Washing, root trimming, and sorting produce for Grade A quality',
                },
                {
                  id: 'packing',
                  emoji: '📦',
                  title: '3. Crate Packing',
                  desc: 'Packed in ventilated wooden crates',
                  fullText: 'Weighed and packed into ventilated wooden crates with cushioning',
                },
                {
                  id: 'ready',
                  emoji: '⚖️',
                  title: '4. Dispatch Gate',
                  desc: 'Labeled & awaiting collection',
                  fullText: 'Crates stacked and labeled with Order ID. Awaiting collection',
                },
              ].map(step => {
                const isSelected =
                  customPrepNote.toLowerCase().includes(step.title.toLowerCase().slice(3)) ||
                  customPrepNote === step.fullText;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setCustomPrepNote(step.fullText);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#1F5C3A] bg-[#E6F2E8] shadow-xs ring-1 ring-[#1F5C3A]'
                        : 'border-[#E5E5E5] bg-white hover:bg-[#F9FAF8] hover:border-[#1F5C3A]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{step.emoji}</span>
                      {isSelected && (
                        <span className="text-[10px] text-[#1F5C3A] font-extrabold">✓ Active</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#1A1A1A] leading-tight">{step.title}</div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5 leading-snug line-clamp-1">
                      {step.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1A1A1A]">
                Message on Buyer's Live Tracker
              </label>
              <span className="text-[10px] text-[#6B7280]">Live preview</span>
            </div>
            <textarea
              value={customPrepNote}
              onChange={e => setCustomPrepNote(e.target.value)}
              placeholder="e.g. Packing 50kg carrots into 2 crates. Quality looks exceptional today!"
              rows={2}
              className="w-full p-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F5C3A]/20"
            />
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
