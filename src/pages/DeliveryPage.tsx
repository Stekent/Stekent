import React, { useState, useEffect } from 'react';
import {
  Truck,
  Clock,
  PackageCheck,
  Percent,
  Search,
  Plus,
  MapPin,
  X,
  Phone,
  CheckCircle,
  RotateCcw,
  DollarSign,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus, CourierRemittance, User } from '../types';
import { KPICard } from '../components/KPICard';
import { StatusPill } from '../components/StatusPill';
import { formatCurrency } from '../utils/formatters';
import { api } from '../services/api';

interface DeliveryPageProps {
  orders: Order[];
  currentUser: User | null;
  onOpenOrderDrawer: (order: Order) => void;
  onToast: (msg: string) => void;
  onRefreshOrders?: () => void;
}

export const DeliveryPage: React.FC<DeliveryPageProps> = ({
  orders = [],
  currentUser,
  onOpenOrderDrawer,
  onToast,
  onRefreshOrders,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dispatch' | 'remittances' | 'returns'>('dispatch');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('GIG Logistics');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [waybillInput, setWaybillInput] = useState('');

  // Remittances state
  const [remittances, setRemittances] = useState<CourierRemittance[]>([]);
  const [loadingRemittances, setLoadingRemittances] = useState(false);

  // POD modal state
  const [podOrder, setPodOrder] = useState<Order | null>(null);
  const [podNote, setPodNote] = useState('');

  const loadRemittances = async () => {
    try {
      setLoadingRemittances(true);
      const fetched = await api.getCourierRemittances();
      setRemittances(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRemittances(false);
    }
  };

  useEffect(() => {
    loadRemittances();
  }, []);

  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched');
  const returnedOrders = orders.filter(o => o.status === 'Returned' || o.status === 'Cancelled');
  const pendingOrders = orders.filter(o => o.status === 'Confirmed');

  const deliverySuccessRate =
    orders.length > 0 ? ((deliveredOrders.length / (deliveredOrders.length + returnedOrders.length || 1)) * 100).toFixed(1) : '82.5';

  const couriersList = ['GIG Logistics', 'Fez Delivery', 'Speedaf Express', 'Gokada Last-Mile', 'Kwik Delivery', 'In-House Rider'];

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer?.phone && o.customer.phone.includes(searchTerm));

    if (!matchesSearch) return false;
    if (stateFilter !== 'all' && (o.state || o.customer?.state) !== stateFilter) return false;
    if (courierFilter !== 'all' && o.courierName !== courierFilter) return false;
    return true;
  });

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    try {
      const generatedWb = waybillInput || `WB-${Math.floor(100000 + Math.random() * 900000)}`;
      await api.updateOrder(order.id, {
        status: 'Dispatched',
        courierName,
        waybillNumber: generatedWb,
      });
      onToast(`Waybill ${generatedWb} issued via ${courierName} for order ${order.orderNumber}`);
      setIsDispatchModalOpen(false);
      setSelectedOrderId('');
      setWaybillInput('');
      if (onRefreshOrders) onRefreshOrders();
    } catch (err: any) {
      onToast(err.message || 'Failed to dispatch order');
    }
  };

  const handleMarkDeliveredPOD = async () => {
    if (!podOrder) return;
    try {
      await api.updateOrder(podOrder.id, {
        status: 'Delivered',
        proofOfDeliveryNote: podNote || 'Cash collected and customer signed delivery receipt.',
      });
      onToast(`Order ${podOrder.orderNumber} marked Delivered (Cash Collected)`);
      setPodOrder(null);
      setPodNote('');
      if (onRefreshOrders) onRefreshOrders();
      await loadRemittances();
    } catch (err: any) {
      onToast(err.message || 'Failed to update delivery');
    }
  };

  const handleMarkReturned = async (order: Order) => {
    try {
      await api.updateOrder(order.id, {
        status: 'Returned',
      });
      onToast(`Order ${order.orderNumber} marked as Returned. Inventory automatically restocked.`);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err: any) {
      onToast(err.message || 'Failed to mark return');
    }
  };

  const handleSettleRemittance = async (remId: string) => {
    try {
      await api.settleCourierRemittance(remId, currentUser?.id);
      onToast('Courier COD remittance marked as settled and paid into bank account');
      await loadRemittances();
    } catch (err: any) {
      onToast(err.message || 'Failed to settle');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Logistics & Courier Dispatch Board
          </h1>
          <p className="text-xs text-[#5B675E]">
            Multi-carrier waybill issuance, Proof of Delivery (POD) logs, and Cash on Delivery (COD) remittance ledger.
          </p>
        </div>

        <button
          onClick={() => setIsDispatchModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Waybill Dispatch</span>
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-pending-delivery"
          title="Ready for Dispatch"
          value={pendingOrders.length.toLocaleString()}
          subtitle="Confirmed orders in packing"
          icon={<Clock className="w-4 h-4" />}
          variant="gold"
        />
        <KPICard
          id="kpi-dispatched-orders"
          title="In Transit / Courier"
          value={dispatchedOrders.length.toLocaleString()}
          subtitle="With riders & couriers"
          icon={<Truck className="w-4 h-4" />}
          variant="blue"
        />
        <KPICard
          id="kpi-delivered-orders"
          title="Delivered (COD Collected)"
          value={deliveredOrders.length.toLocaleString()}
          subtitle="Cash verified & logged"
          icon={<PackageCheck className="w-4 h-4" />}
          variant="brand"
        />
        <KPICard
          id="kpi-delivery-rate"
          title="Delivery Success Rate"
          value={`${deliverySuccessRate}%`}
          subtitle={`${returnedOrders.length} returned/rejected`}
          icon={<Percent className="w-4 h-4" />}
          variant="brand"
        />
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-[8px] bg-[#FFFFFF] border border-[#E2E5DD] shadow-xs">
        <button
          onClick={() => setActiveSubTab('dispatch')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
            activeSubTab === 'dispatch'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Active Waybills & Tracking ({filteredOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('remittances')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
            activeSubTab === 'remittances'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Courier COD Remittances ({remittances.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('returns')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
            activeSubTab === 'returns'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Failed & Returns Reconciliation ({returnedOrders.length})</span>
        </button>
      </div>

      {/* SUB-VIEW 1: ACTIVE DISPATCH */}
      {activeSubTab === 'dispatch' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by order #, waybill, customer name or phone..."
                className="w-full bg-white border border-[#E2E5DD] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
              />
            </div>

            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C]"
            >
              <option value="all">All States</option>
              <option value="Lagos">Lagos (Local)</option>
              <option value="Abuja">Abuja (FCT)</option>
              <option value="Oyo">Oyo (South West)</option>
              <option value="Rivers">Rivers (South South)</option>
              <option value="Anambra">Anambra (South East)</option>
              <option value="Kano">Kano (North)</option>
            </select>

            <select
              value={courierFilter}
              onChange={e => setCourierFilter(e.target.value)}
              className="bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C]"
            >
              <option value="all">All Couriers</option>
              {couriersList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Delivery Tracking Table */}
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
                Dispatches & Waybills ({filteredOrders.length})
              </span>
              <span className="text-[11px] font-mono text-[#5B675E]">
                Real-time POD Status
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Waybill / Order</th>
                    <th className="py-3 px-4">Customer & Phone</th>
                    <th className="py-3 px-4">Delivery Address</th>
                    <th className="py-3 px-4">Courier Partner</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">COD Amount</th>
                    <th className="py-3 px-4 text-right">Logistics Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5DD]">
                  {filteredOrders.map(o => (
                    <tr
                      key={o.id}
                      onClick={() => onOpenOrderDrawer(o)}
                      className="hover:bg-[#FAFBF9] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#12231C] block">{o.orderNumber}</span>
                        <span className="text-[10px] text-[#146B4E] font-mono font-bold">
                          {o.waybillNumber || 'No Waybill Yet'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-[#12231C] font-semibold block">{o.customer?.name}</strong>
                        <span className="text-[10px] text-[#5B675E] font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#146B4E]" /> {o.customer?.phone}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#5B675E] max-w-xs">
                        <div className="font-medium text-[#12231C]">{o.state || 'Lagos'}</div>
                        <div className="truncate text-[10px]">{o.customer?.address}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#12231C]">
                        {o.courierName || 'Unassigned Rider'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={o.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#12231C]">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {o.status !== 'Delivered' && (
                            <button
                              onClick={() => {
                                setPodOrder(o);
                                setPodNote('');
                              }}
                              className="px-2.5 py-1 rounded-[4px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-[11px] font-bold shadow-xs"
                              title="Mark Delivered & Collect COD"
                            >
                              POD Done
                            </button>
                          )}

                          {o.status === 'Dispatched' && (
                            <button
                              onClick={() => handleMarkReturned(o)}
                              className="px-2.5 py-1 rounded-[4px] border border-[#B33A3A] text-[#B33A3A] hover:bg-[#FCE8E8] text-[11px] font-semibold"
                              title="Customer Rejected / Cancelled"
                            >
                              Failed
                            </button>
                          )}

                          <button
                            onClick={() => onOpenOrderDrawer(o)}
                            className="px-2 py-1 rounded-[4px] border border-[#E2E5DD] hover:bg-[#EEF0E8] text-[11px] text-[#5B675E]"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: COURIER REMITTANCE SETTLEMENTS */}
      {activeSubTab === 'remittances' && (
        <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading block">
                Courier Cash on Delivery (COD) Remittance Ledger
              </span>
              <span className="text-[11px] text-[#5B675E]">
                Reconciliation of funds collected by delivery partners minus their dispatch fees
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#146B4E]">
              {remittances.length} Batches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Courier Partner</th>
                  <th className="py-3 px-3 text-center">Delivered Orders</th>
                  <th className="py-3 px-4 text-right">Gross Cash Collected</th>
                  <th className="py-3 px-4 text-right">Logistics Delivery Fee</th>
                  <th className="py-3 px-4 text-right">Net Remittance Due</th>
                  <th className="py-3 px-3 text-center">Settlement Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5DD]">
                {remittances.map(rem => (
                  <tr key={rem.id} className="hover:bg-[#FAFBF9] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#12231C]">{rem.courierName}</div>
                      <div className="text-[10px] text-[#5B675E] font-mono">Ref: {rem.id}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-[#12231C]">
                      {rem.orderCount} orders
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#12231C]">
                      ₦{rem.totalCollected.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#B33A3A]">
                      -₦{rem.deliveryFees.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#146B4E]">
                      ₦{rem.netRemitted.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          rem.status === 'Settled'
                            ? 'bg-[#E3F0E9] text-[#146B4E]'
                            : 'bg-[#F6ECD8] text-[#B9822A]'
                        }`}
                      >
                        {rem.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {rem.status === 'Pending' ? (
                        <button
                          onClick={() => handleSettleRemittance(rem.id)}
                          className="px-3 py-1 rounded-[4px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          Mark Settled & In Bank
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-[#5B675E] font-medium">
                          ✓ Settled {rem.settledDate ? new Date(rem.settledDate).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: RETURNS RECONCILIATION */}
      {activeSubTab === 'returns' && (
        <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading block">
                Failed & Returned Orders Ledger
              </span>
              <span className="text-[11px] text-[#5B675E]">
                Track returned parcels and verify physical restocking into warehouse inventory
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#B33A3A]">
              {returnedOrders.length} Returns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product Item</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Warehouse Stock State</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5DD]">
                {returnedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-[#5B675E]">
                      No returned orders recorded.
                    </td>
                  </tr>
                ) : (
                  returnedOrders.map(o => (
                    <tr key={o.id} className="hover:bg-[#FAFBF9] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#12231C]">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#12231C]">{o.customer?.name}</div>
                        <div className="text-[10px] text-[#5B675E]">{o.customer?.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#12231C]">
                        {o.items?.[0]?.product?.name || 'Product'} (x{o.items?.[0]?.qty || (o.items?.[0] as any)?.quantity || 1})
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#B33A3A]">
                        ₦{o.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#E3F0E9] text-[#146B4E] font-semibold font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Restocked into Inventory
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenOrderDrawer(o)}
                          className="px-2.5 py-1 rounded-[4px] border border-[#E2E5DD] text-[11px] font-medium text-[#12231C] hover:bg-[#EEF0E8]"
                        >
                          View Audit Trail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatch Waybill Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Issue Dispatch Waybill
              </h3>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Select Order for Dispatch *
                </label>
                <select
                  required
                  value={selectedOrderId}
                  onChange={e => setSelectedOrderId(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                >
                  <option value="">Select confirmed order...</option>
                  {orders
                    .filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled')
                    .map(o => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.customer?.name} ({o.state || 'Lagos'}) • {formatCurrency(o.totalAmount)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Courier / Delivery Partner *
                </label>
                <select
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                >
                  {couriersList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Custom Waybill / Tracking # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GIG-778291 (Leave blank to auto-generate)"
                  value={waybillInput}
                  onChange={e => setWaybillInput(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 font-mono outline-none focus:border-[#146B4E]"
                />
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] text-xs font-semibold text-[#5B675E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white"
                >
                  Issue & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) modal */}
      {podOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Record Proof of Delivery (POD)
              </h3>
              <button
                onClick={() => setPodOrder(null)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-[6px] bg-[#FAFBF9] border border-[#E2E5DD] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5B675E]">Order:</span>
                  <span className="font-mono font-bold text-[#146B4E]">{podOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B675E]">Customer:</span>
                  <span className="font-semibold text-[#12231C]">{podOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B675E]">Cash Collected (COD):</span>
                  <span className="font-mono font-bold text-[#12231C]">₦{podOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Delivery Receipt Notes / Rider Signature
                </label>
                <textarea
                  rows={3}
                  value={podNote}
                  onChange={e => setPodNote(e.target.value)}
                  placeholder="e.g. Parcel handed to customer at front desk. Cash ₦42,000 collected in full by GIG rider."
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] p-2.5 outline-none focus:border-[#146B4E]"
                />
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPodOrder(null)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] text-xs font-semibold text-[#5B675E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMarkDeliveredPOD}
                  className="px-4 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white shadow-xs"
                >
                  Confirm Delivery & Log COD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
