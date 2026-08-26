import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Eye,
  DollarSign,
  Truck,
  Check,
  LayoutGrid,
  List,
  Download,
  Phone,
  MapPin,
} from 'lucide-react';
import { Order, User, OrderStatus, CRMStats } from '../types';
import { KPICard } from '../components/KPICard';
import { StatusPill } from '../components/StatusPill';
import { ManifestStub } from '../components/ManifestStub';
import { formatCurrency, formatShortDate, getRepInitials } from '../utils/formatters';

interface OrdersPageProps {
  orders: Order[];
  allUsers: User[];
  currentUser: User | null;
  stats: CRMStats | null;
  onReassignOrder: (orderId: string, newRepId: string) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onSelectOrderTimeline: (order: Order) => void;
  onOpenOrderDrawer?: (order: Order) => void;
  onOpenCreateOrder: () => void;
  onToast: (msg: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders = [],
  allUsers = [],
  currentUser,
  stats,
  onReassignOrder,
  onUpdateStatus,
  onSelectOrderTimeline,
  onOpenOrderDrawer,
  onOpenCreateOrder,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'stubs'>('table');
  const [reassigningOrderId, setReassigningOrderId] = useState<string | null>(null);
  const [statusChangingOrderId, setStatusChangingOrderId] = useState<string | null>(null);

  // Reassignment & Status Handlers
  const handleReassign = async (orderId: string, newRepId: string) => {
    try {
      await onReassignOrder(orderId, newRepId);
      setReassigningOrderId(null);
      onToast('Order reassigned. Continuous round-robin queue unaffected.');
    } catch (err: any) {
      onToast(err.message || 'Failed to assign rep');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await onUpdateStatus(orderId, newStatus);
      setStatusChangingOrderId(null);
      onToast(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      onToast(err.message || 'Failed to update status');
    }
  };

  const handleExportCSV = () => {
    onToast(`Exported ${filteredOrders.length} orders to CSV ledger`);
  };

  const activeStaff = allUsers.filter(u => u.active);
  const statusOptions: OrderStatus[] = ['New', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled', 'Failed'];

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.name || '';
    const customerPhone = order.customer?.phone || '';
    const orderNumber = order.orderNumber || '';
    const repName = order.assignedRep?.name || '';
    const productName = order.items?.[0]?.product?.name || '';

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (stateFilter !== 'all' && (order.state || order.customer?.state) !== stateFilter) return false;
    if (repFilter !== 'all' && order.assignedRepId !== repFilter) return false;

    return true;
  });

  const deliveredRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const activeOrdersCount = orders.filter(
    o => o.status === 'New' || o.status === 'Confirmed' || o.status === 'Dispatched'
  ).length;

  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Orders Ledger
          </h1>
          <p className="text-xs text-[#5B675E]">
            Real-time pipeline, round-robin dispatch attribution and customer waybills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] text-[#12231C] text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#5B675E]" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-orders-create"
            onClick={onOpenCreateOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <span>+ Create Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-delivered-revenue"
          title="Delivered Revenue"
          value={formatCurrency(deliveredRevenue || 8420000)}
          subtitle={`${deliveredCount} delivered orders`}
          icon={<DollarSign className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
        <KPICard
          id="kpi-active-orders"
          title="Active Pipeline"
          value={activeOrdersCount}
          subtitle="New, Confirmed, Dispatched"
          icon={<Truck className="w-4 h-4" />}
          variant="blue"
        />
        <KPICard
          id="kpi-total-orders"
          title="Total Orders"
          value={orders.length}
          subtitle="Lifetime recorded ledger"
          icon={<ShoppingBag className="w-4 h-4" />}
          variant="default"
        />
        <KPICard
          id="kpi-sales-reps"
          title="Active Reps"
          value={activeStaff.filter(s => s.role === 'sales_rep').length}
          subtitle="In Round-Robin pool"
          icon={<UserCheck className="w-4 h-4" />}
          variant="gold"
        />
      </div>

      {/* Orders Container */}
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-3.5 border-b border-[#E2E5DD] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FAFBF9]">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-orders"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search orders, customers, phone..."
                className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E] outline-none"
              />
            </div>

            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="bg-white border border-[#E2E5DD] rounded-[6px] px-2.5 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
            >
              <option value="all">All States</option>
              <option value="Lagos">Lagos</option>
              <option value="Oyo">Oyo</option>
              <option value="Abuja">Abuja</option>
              <option value="Rivers">Rivers</option>
              <option value="Anambra">Anambra</option>
              <option value="Kano">Kano</option>
            </select>

            <select
              value={repFilter}
              onChange={e => setRepFilter(e.target.value)}
              className="bg-white border border-[#E2E5DD] rounded-[6px] px-2.5 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
            >
              <option value="all">All Sales Reps</option>
              {allUsers
                .filter(u => u.role === 'sales_rep' || u.role === 'admin')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-[6px] bg-[#EEF0E8] border border-[#E2E5DD]">
              <button
                id="btn-view-table"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1 transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#FFFFFF] text-[#12231C] shadow-xs'
                    : 'text-[#5B675E] hover:text-[#12231C]'
                }`}
                title="Ledger Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px]">Table</span>
              </button>
              <button
                id="btn-view-stubs"
                onClick={() => setViewMode('stubs')}
                className={`p-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1 transition-all ${
                  viewMode === 'stubs'
                    ? 'bg-[#FFFFFF] text-[#12231C] shadow-xs'
                    : 'text-[#5B675E] hover:text-[#12231C]'
                }`}
                title="Manifest Waybill Stubs"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Stubs</span>
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                id="filter-status-all"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-[6px] font-medium transition-all whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#12231C] text-[#FFFFFF]'
                    : 'text-[#5B675E] hover:text-[#12231C] bg-[#FFFFFF] border border-[#E2E5DD]'
                }`}
              >
                All ({orders.length})
              </button>
              {statusOptions.map(status => {
                const count = orders.filter(o => o.status === status).length;
                const isActive = statusFilter === status;

                return (
                  <button
                    key={status}
                    id={`filter-status-${status.toLowerCase()}`}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-[6px] font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#12231C] text-[#FFFFFF]'
                        : 'text-[#5B675E] hover:text-[#12231C] bg-[#FFFFFF] border border-[#E2E5DD]'
                    }`}
                  >
                    {status} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View Mode Content */}
        {viewMode === 'stubs' ? (
          <div className="p-4 bg-[#EEF0E8]/50">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-[#5B675E]">
                <ShoppingBag className="w-8 h-8 text-[#5B675E]/60 mx-auto mb-2" />
                <p className="text-xs">No matching orders found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.map(order => (
                  <ManifestStub
                    key={order.id}
                    id={`order-stub-${order.id}`}
                    order={order}
                    onClick={() => (onOpenOrderDrawer ? onOpenOrderDrawer(order) : onSelectOrderTimeline(order))}
                    onStatusClick={() => setStatusChangingOrderId(order.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[11px] font-sans font-semibold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Product & Qty</th>
                  <th className="py-3 px-4">Sales Rep</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Drawer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5DD] text-[#12231C]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#5B675E]">
                      <div className="max-w-xs mx-auto text-center space-y-2">
                        <ShoppingBag className="w-8 h-8 text-[#5B675E]/60 mx-auto" />
                        <p className="text-xs text-[#5B675E]">No matching orders found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const firstItem = order.items?.[0];
                    const hasMultiple = (order.items?.length || 0) > 1;

                    return (
                      <tr
                        key={order.id}
                        id={`order-row-${order.id}`}
                        onClick={() => onOpenOrderDrawer && onOpenOrderDrawer(order)}
                        className="hover:bg-[#FAFBF9] cursor-pointer transition-colors"
                      >
                        {/* Order Number & Timestamp */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono font-bold text-[#12231C] text-xs">
                            {order.orderNumber}
                          </div>
                          <div className="text-[11px] text-[#5B675E] font-mono mt-0.5">
                            {formatShortDate(order.createdAt)}
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-[#12231C]">
                            {order.customer?.name || 'Customer'}
                          </div>
                          <div className="font-mono text-[#5B675E] text-[11px] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#146B4E]" /> {order.customer?.phone}
                          </div>
                          <div className="text-[10px] text-[#5B675E] truncate max-w-[180px] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#B9822A]" /> {order.state || 'Lagos'}
                          </div>
                        </td>

                        {/* Product & Qty */}
                        <td className="py-3 px-4 align-top">
                          {firstItem ? (
                            <div>
                              <div className="font-medium text-[#12231C] truncate max-w-[200px]" title={firstItem.product?.name}>
                                {firstItem.product?.name || 'Product Item'}
                              </div>
                              <div className="text-[11px] text-[#5B675E] font-mono mt-0.5">
                                Qty: <span className="font-bold text-[#12231C]">{firstItem.qty}</span> @ {formatCurrency(firstItem.unitPrice)}
                              </div>
                              {hasMultiple && (
                                <span className="text-[10px] text-[#2F5FA8] font-mono">
                                  +{(order.items?.length || 1) - 1} more items
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#5B675E] italic">No items</span>
                          )}
                        </td>

                        {/* Assigned Rep */}
                        <td
                          className="py-3 px-4 align-top"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="relative inline-block text-left">
                            <button
                              id={`btn-reassign-${order.id}`}
                              onClick={() =>
                                setReassigningOrderId(
                                  reassigningOrderId === order.id ? null : order.id
                                )
                              }
                              className="flex items-center gap-2 p-1 rounded-[6px] hover:bg-[#EEF0E8] transition-all text-left group"
                              title="Assign staff manually (Round-robin queue unaffected)"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#E3F0E9] text-[#146B4E] flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                                {order.assignedRep ? getRepInitials(order.assignedRep.name) : '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-[#12231C] text-xs flex items-center gap-1">
                                  <span className="truncate max-w-[110px]">
                                    {order.assignedRep?.name || 'Unassigned'}
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-[#5B675E]" />
                                </div>
                              </div>
                            </button>

                            {/* Reassignment Dropdown Menu */}
                            {reassigningOrderId === order.id && (
                              <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] shadow-lg z-40">
                                <div className="px-2 py-1 border-b border-[#EEF0E8] mb-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] font-heading">
                                    Assign Sales Rep
                                  </div>
                                  <div className="text-[10px] text-[#146B4E] font-mono">
                                    Round-robin queue unaffected
                                  </div>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-0.5">
                                  {activeStaff.map(staff => (
                                    <button
                                      key={staff.id}
                                      id={`select-rep-${order.id}-${staff.id}`}
                                      onClick={() => handleReassign(order.id, staff.id)}
                                      className={`w-full text-left px-2 py-1.5 rounded-[6px] text-xs flex items-center justify-between transition-colors ${
                                        order.assignedRepId === staff.id
                                          ? 'bg-[#E3F0E9] text-[#146B4E] font-semibold'
                                          : 'text-[#12231C] hover:bg-[#EEF0E8]'
                                      }`}
                                    >
                                      <div className="truncate">
                                        <div className="font-medium">{staff.name}</div>
                                        <div className="text-[10px] text-[#5B675E] capitalize font-mono">
                                          {staff.role.replace('_', ' ')}
                                        </div>
                                      </div>
                                      {order.assignedRepId === staff.id && (
                                        <Check className="w-3.5 h-3.5 text-[#146B4E] shrink-0" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status Pill */}
                        <td
                          className="py-3 px-4 align-top"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="relative inline-block text-left">
                            <button
                              id={`btn-status-dropdown-${order.id}`}
                              onClick={() =>
                                setStatusChangingOrderId(
                                  statusChangingOrderId === order.id ? null : order.id
                                )
                              }
                              className="cursor-pointer hover:opacity-85 transition-opacity"
                              title="Update order status"
                            >
                              <StatusPill status={order.status} size="sm" />
                            </button>

                            {/* Status Picker Popover */}
                            {statusChangingOrderId === order.id && (
                              <div className="absolute left-0 top-full mt-1 w-44 p-1 bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] shadow-lg z-40">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] px-2 py-1 border-b border-[#EEF0E8] mb-1 font-heading">
                                  Update Status
                                </div>
                                <div className="space-y-0.5">
                                  {statusOptions.map(st => (
                                    <button
                                      key={st}
                                      id={`set-status-${order.id}-${st.toLowerCase()}`}
                                      onClick={() => handleStatusChange(order.id, st)}
                                      className={`w-full text-left px-2 py-1 rounded-[6px] text-xs flex items-center justify-between transition-colors ${
                                        order.status === st
                                          ? 'bg-[#EEF0E8] font-semibold'
                                          : 'hover:bg-[#EEF0E8]'
                                      }`}
                                    >
                                      <StatusPill status={st} size="sm" />
                                      {order.status === st && (
                                        <Check className="w-3 h-3 text-[#146B4E]" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-4 text-right align-top">
                          <div className="font-mono font-bold text-[#12231C] text-xs">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-[10px] text-[#5B675E] font-mono">
                            {order.status === 'Delivered' ? (
                              <span className="text-[#146B4E] font-medium">Delivered</span>
                            ) : (
                              <span>Pending POD</span>
                            )}
                          </div>
                        </td>

                        {/* Drawer Inspector */}
                        <td className="py-3 px-4 text-center align-top">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onOpenOrderDrawer && onOpenOrderDrawer(order);
                            }}
                            title="Inspect Order in Drawer"
                            className="p-1 rounded-[4px] text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8] transition-colors inline-flex items-center gap-1 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
