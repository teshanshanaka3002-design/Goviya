import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Tag,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Plus,
  Check,
  Ban,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { User, Complaint } from '../../types';

// ===================== 1. ADMIN DASHBOARD SCREEN =====================
export const AdminDashboardScreen: React.FC = () => {
  const { platformStats, users, complaints, orders } = useApp();

  const pendingVerificationUsers = users.filter(u => !u.verified);
  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length;
  const readyOrdersCount = orders.filter(o => o.status === 'ready_for_pickup').length;
  const inTransitOrdersCount = orders.filter(o => o.status === 'out_for_delivery').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;

  const totalGrossLkr = platformStats.totalTransactionsLkr + orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-4 p-4 pb-24 text-left animate-fadeIn">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Platform Operations Center</h2>
          <span className="text-[10px] font-bold bg-[#E6F2E8] text-[#1F5C3A] px-2.5 py-1 rounded-full border border-[#CDE5D2] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F5C3A] animate-pulse" />
            Live Sync
          </span>
        </div>
        <p className="text-xs text-[#6B7280]">
          Real-time oversight for Sri Lanka direct agricultural trade & fulfillment
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="mint" padding="md">
          <div className="text-[10px] text-[#4B6B56] uppercase font-bold flex items-center justify-between">
            <span>Total Orders</span>
            <Package className="w-3.5 h-3.5 text-[#1F5C3A]" />
          </div>
          <div className="text-2xl font-black text-[#1F5C3A] mt-1">
            {totalOrdersCount}
          </div>
          <div className="text-[10px] text-[#4B6B56] font-semibold mt-0.5">
            {pendingOrdersCount} pending farmer action
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="text-[10px] text-[#6B7280] uppercase font-bold flex items-center justify-between">
            <span>Gross Volume (LKR)</span>
            <DollarSign className="w-3.5 h-3.5 text-[#6B7280]" />
          </div>
          <div className="text-xl font-black text-[#1A1A1A] mt-1">
            {(totalGrossLkr / 1000000).toFixed(2)}M LKR
          </div>
          <div className="text-[10px] text-[#1F5C3A] font-semibold mt-0.5">
            Islandwide direct trade
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="text-[10px] text-[#6B7280] uppercase font-bold">
            Active Producers
          </div>
          <div className="text-xl font-black text-[#1A1A1A] mt-1">
            {platformStats.totalFarmers.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#1F5C3A] font-semibold">+12% this month</div>
        </Card>

        <Card variant="default" padding="md">
          <div className="text-[10px] text-[#6B7280] uppercase font-bold">
            Pending Audits
          </div>
          <div className="text-xl font-black text-[#C8452D] mt-1">
            {pendingVerificationUsers.length + pendingComplaints.length}
          </div>
          <div className="text-[10px] text-[#C8452D]">Urgent moderation</div>
        </Card>
      </div>

      {/* Real-Time Order Fulfillment Pipeline */}
      <Card variant="default" padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#1F5C3A]" />
            <span>Live Order Fulfillment Pipeline</span>
          </h4>
          <span className="text-[10px] font-mono text-[#6B7280]">
            {totalOrdersCount} active/recorded
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
          <div className="p-2 bg-[#F6F7F5] rounded-xl border border-[#E5E5E5]">
            <div className="text-base font-black text-[#E68A00]">{pendingOrdersCount}</div>
            <div className="text-[9px] font-bold text-[#6B7280] uppercase mt-0.5">Pending</div>
          </div>
          <div className="p-2 bg-[#F6F7F5] rounded-xl border border-[#E5E5E5]">
            <div className="text-base font-black text-[#2E8C9F]">{preparingOrdersCount}</div>
            <div className="text-[9px] font-bold text-[#6B7280] uppercase mt-0.5">Harvesting</div>
          </div>
          <div className="p-2 bg-[#F6F7F5] rounded-xl border border-[#E5E5E5]">
            <div className="text-base font-black text-[#7A52B3]">{readyOrdersCount}</div>
            <div className="text-[9px] font-bold text-[#6B7280] uppercase mt-0.5">Ready</div>
          </div>
          <div className="p-2 bg-[#F6F7F5] rounded-xl border border-[#E5E5E5]">
            <div className="text-base font-black text-[#19768A]">{inTransitOrdersCount}</div>
            <div className="text-[9px] font-bold text-[#6B7280] uppercase mt-0.5">In Transit</div>
          </div>
          <div className="p-2 bg-[#E6F2E8] rounded-xl border border-[#CDE5D2]">
            <div className="text-base font-black text-[#1F5C3A]">{deliveredOrdersCount}</div>
            <div className="text-[9px] font-bold text-[#1F5C3A] uppercase mt-0.5">Delivered</div>
          </div>
        </div>
      </Card>

      {/* Live Marketplace Orders Stream */}
      <Card variant="default" padding="md" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
            Live Platform Orders ({orders.length})
          </h4>
          <span className="text-[10px] text-[#6B7280]">Updated instantly</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
          {orders.length === 0 ? (
            <div className="text-center py-4 text-xs text-[#6B7280]">
              No orders placed yet.
            </div>
          ) : (
            orders.slice(0, 6).map(ord => (
              <div
                key={ord._id}
                className="p-2.5 bg-[#F9FAF8] rounded-xl border border-[#E5E5E5] flex items-center justify-between text-xs"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[10px] text-[#1A1A1A]">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                        ord.deliveryType === 'pickup'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.deliveryType === 'pickup' ? '🏪 Self-Pickup' : '🚚 Delivery'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B5563] truncate mt-0.5">
                    <strong>{ord.buyerName}</strong> ➔ Grower: <strong>{ord.farmerName}</strong>
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                    {ord.items.map(i => `${i.cropName} (${i.quantityKg}kg)`).join(', ')}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-[#1F5C3A] text-xs">
                    LKR {ord.total.toLocaleString()}
                  </div>
                  <div className="mt-1">
                    <StatusPill status={ord.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Monthly Trading Growth Chart */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
            Monthly Produce Trade Volume (Tons)
          </h4>
          <span className="text-[10px] text-[#1F5C3A] font-bold">
            Q2-Q4 2026
          </span>
        </div>
        <div className="flex items-end justify-between h-28 gap-2 bg-[#F6F7F5] p-3 rounded-xl">
          {platformStats.monthlyVolume.map(m => {
            const maxVol = Math.max(...platformStats.monthlyVolume.map(v => v.volumeTons));
            const pct = Math.round((m.volumeTons / maxVol) * 100);

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-bold text-[#1F5C3A]">{m.volumeTons}t</span>
                <div
                  style={{ height: `${pct * 0.7}%` }}
                  className="w-full bg-[#1F5C3A] rounded-t-sm"
                />
                <span className="text-[10px] text-[#6B7280]">{m.month}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ===================== 2. ADMIN USERS & VERIFICATION SCREEN =====================
export const AdminUsersScreen: React.FC = () => {
  const { users, adminVerifyUser } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'farmers' | 'buyers' | 'drivers'>('pending');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => {
    if (activeTab === 'pending') return !u.verified;
    if (activeTab === 'farmers') return u.role === 'farmer';
    if (activeTab === 'buyers') return u.role === 'buyer';
    if (activeTab === 'drivers') return u.role === 'driver';
    return true;
  });

  return (
    <div className="space-y-4 p-4 pb-24 text-left">
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Account Verification & Access</h2>
        <p className="text-xs text-[#6B7280]">
          Verify Agrarian Services certificates and NIC credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E5] text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'pending', label: 'Pending Verify' },
          { id: 'farmers', label: 'Farmers' },
          { id: 'buyers', label: 'Buyers' },
          { id: 'drivers', label: 'Drivers' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-center transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#1F5C3A] text-[#1F5C3A] font-bold'
                : 'border-transparent text-[#6B7280]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-2.5">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No accounts in this category"
            description="All producer and buyer registrations have been audited."
          />
        ) : (
          filteredUsers.map(user => (
            <Card
              key={user._id}
              variant="interactive"
              padding="sm"
              onClick={() => setSelectedUser(user)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="md" role={user.role} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#1A1A1A]">{user.name}</h4>
                    {user.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1F5C3A]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    {user.phone} · {user.location?.district || 'Western'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.verified
                      ? 'bg-[#E6F2E8] text-[#1F5C3A]'
                      : 'bg-[#FEF8EA] text-[#B45309]'
                  }`}
                >
                  {user.verified ? 'Verified' : 'Review Needed'}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* User Verification BottomSheet */}
      <BottomSheet
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Verification Dossier"
      >
        {selectedUser && (
          <div className="space-y-4 text-left pb-4">
            <div className="flex items-center gap-3 p-3 bg-[#F6F7F5] rounded-xl">
              <Avatar name={selectedUser.name} size="lg" role={selectedUser.role} />
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">{selectedUser.name}</h4>
                <p className="text-xs text-[#6B7280]">Role: <strong className="capitalize">{selectedUser.role}</strong></p>
                <p className="text-[11px] text-[#6B7280]">{selectedUser.phone}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
                <span className="text-[#6B7280]">NIC Number:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {selectedUser.nicNumber || '197412803450'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
                <span className="text-[#6B7280]">Location / Farm:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {selectedUser.location?.address || 'Nuwara Eliya'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F0EE]">
                <span className="text-[#6B7280]">Registration Date:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {selectedUser.createdAt.slice(0, 10)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  adminVerifyUser(selectedUser._id, false);
                  setSelectedUser(null);
                }}
              >
                Deactivate / Reject
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  adminVerifyUser(selectedUser._id, true);
                  setSelectedUser(null);
                }}
              >
                Approve & Verify
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

// ===================== 3. ADMIN CATEGORIES MANAGEMENT SCREEN =====================
export const AdminCategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState([
    { name: 'Vegetables', cropsCount: 42, activeVolume: '140 Tons' },
    { name: 'Fruits', cropsCount: 18, activeVolume: '85 Tons' },
    { name: 'Spices & Herbs', cropsCount: 12, activeVolume: '24 Tons' },
    { name: 'Grains & Rice', cropsCount: 8, activeVolume: '95 Tons' },
    { name: 'Tubers', cropsCount: 6, activeVolume: '32 Tons' },
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories(prev => [...prev, { name: newCatName, cropsCount: 0, activeVolume: '0 Tons' }]);
    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 p-4 pb-24 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Crop Categories</h2>
          <p className="text-xs text-[#6B7280]">
            Manage platform taxonomies and produce classifications
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAdding(true)}
        >
          Add Category
        </Button>
      </div>

      <div className="space-y-2.5">
        {categories.map(cat => (
          <Card key={cat.name} variant="default" padding="md" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">{cat.name}</h4>
                <p className="text-[11px] text-[#6B7280]">
                  {cat.cropsCount} crop varieties registered
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#1F5C3A]">{cat.activeVolume}</span>
            </div>
          </Card>
        ))}
      </div>

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Category">
        <form onSubmit={handleAdd} className="space-y-3 pb-4">
          <Input
            label="Category Name"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="e.g. Organic Mushrooms, Medicinal Herbs"
            required
          />
          <Button type="submit" variant="primary" fullWidth size="md">
            Save Category
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
};

// ===================== 4. ADMIN COMPLAINTS & MODERATION SCREEN =====================
export const AdminComplaintsScreen: React.FC = () => {
  const { complaints, adminResolveComplaint } = useApp();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  return (
    <div className="space-y-4 p-4 pb-24 text-left">
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Disputes & Moderation</h2>
        <p className="text-xs text-[#6B7280]">
          Review quality discrepancies, transit delays and reported listings
        </p>
      </div>

      <div className="space-y-3">
        {complaints.map(cmp => (
          <Card
            key={cmp._id}
            variant="interactive"
            padding="md"
            onClick={() => setSelectedComplaint(cmp)}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cmp.severity === 'high'
                      ? 'bg-[#FDEEEB] text-[#C8452D]'
                      : 'bg-[#FEF8EA] text-[#B45309]'
                  }`}
                >
                  {cmp.severity.toUpperCase()} PRIORITY
                </span>
                <span className="text-xs font-bold text-[#1A1A1A]">{cmp.reason}</span>
              </div>
              <StatusPill status={cmp.status} />
            </div>

            <p className="text-xs text-[#6B7280] line-clamp-2">{cmp.details}</p>

            <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Filed by: {cmp.complainantName}</span>
              <span>Target: {cmp.targetName}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Complaint Review BottomSheet */}
      <BottomSheet
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Dispute Investigation"
      >
        {selectedComplaint && (
          <div className="space-y-4 text-left pb-4">
            <div className="p-3 bg-[#F6F7F5] rounded-xl space-y-1 text-xs">
              <div>
                <strong>Reason:</strong> {selectedComplaint.reason}
              </div>
              <div>
                <strong>Complainant:</strong> {selectedComplaint.complainantName}
              </div>
              <div>
                <strong>Reported Party:</strong> {selectedComplaint.targetName}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                Full Incident Statement
              </label>
              <p className="text-xs text-[#4B5563] bg-white p-3 border border-[#E5E5E5] rounded-xl leading-relaxed">
                {selectedComplaint.details}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block mb-1">
                Moderator Resolution Note
              </label>
              <textarea
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="e.g. Warning issued to producer, 15% credit refund dispatched..."
                rows={2}
                className="w-full p-2.5 text-xs bg-white border border-[#E5E5E5] rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  adminResolveComplaint(
                    selectedComplaint._id,
                    'dismissed',
                    resolutionNote || 'Dismissed after review'
                  );
                  setSelectedComplaint(null);
                }}
              >
                Dismiss Dispute
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  adminResolveComplaint(
                    selectedComplaint._id,
                    'resolved',
                    resolutionNote || 'Resolved with compensatory action'
                  );
                  setSelectedComplaint(null);
                }}
              >
                Resolve & Close
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
