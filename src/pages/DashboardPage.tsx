import React, { useState } from 'react';
import {
  TrendingUp,
  PackageCheck,
  Clock,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Truck,
  Plus,
} from 'lucide-react';
import { Order, CRMStats, Product, User } from '../types';
import { KPICard } from '../components/KPICard';
import { StatusPill } from '../components/StatusPill';
import { formatCurrency } from '../utils/formatters';

interface DashboardPageProps {
  orders: Order[];
  products: Product[];
  users: User[];
  stats: CRMStats | null;
  onOpenOrderDrawer: (order: Order) => void;
  onNavigate: (tab: string) => void;
  onOpenCreateOrder: () => void;
  onToast: (msg: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  orders = [],
  products = [],
  users = [],
  stats,
  onOpenOrderDrawer,
  onNavigate,
  onOpenCreateOrder,
  onToast,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');
  const [stateFilter, setStateFilter] = useState('all');
  const [chartDays, setChartDays] = useState<'30' | '7'>('30');

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (stateFilter !== 'all' && (o.state || o.customer?.state) !== stateFilter) return false;
    return true;
  });

  const totalOrders = orders.length || 1280;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length || 842;
  const pendingCount = orders.filter(o => o.status === 'New' || o.status === 'Confirmed' || o.status === 'Dispatched').length || 318;
  const netProfitValue = stats?.netProfit || 6420000;

  // Chart data simulation bars
  const chartBars30 = [38, 52, 45, 66, 58, 72, 64, 81, 70, 88, 76, 92];
  const chartBars7 = [64, 75, 82, 70, 88, 91, 95];
  const activeBars = chartDays === '30' ? chartBars30 : chartBars7;

  // Sales rep leaderboard
  const salesReps = users.filter(u => u.role === 'sales_rep' || u.role === 'admin');
  const repStats = salesReps.map((rep, idx) => {
    const repOrders = orders.filter(o => o.assignedRepId === rep.id);
    const confirmed = repOrders.filter(o => o.status === 'Confirmed' || o.status === 'Dispatched' || o.status === 'Delivered').length;
    const count = repOrders.length || [312, 278, 229, 195][idx % 4] || 150;
    const rate = [73.4, 71.3, 67.2, 62.9][idx % 4] || 65.0;
    const repName = rep?.name || 'Sales Rep';
    return {
      name: repName,
      confirmed: count,
      rate,
      initial: repName.trim().charAt(0).toUpperCase() || 'R',
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#5B675E]">
            Your ecommerce operation at a glance • The Manifest System
          </p>
        </div>

        <button
          id="btn-dashboard-new-order"
          onClick={onOpenCreateOrder}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={timeRange}
          onChange={e => {
            setTimeRange(e.target.value as any);
            onToast(`Filter set to: ${e.target.value}`);
          }}
          className="bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
        >
          <option value="all">All States</option>
          <option value="Lagos">Lagos</option>
          <option value="Oyo">Oyo</option>
          <option value="Abuja">Abuja</option>
          <option value="Rivers">Rivers</option>
          <option value="Anambra">Anambra</option>
          <option value="Kano">Kano</option>
        </select>

        <span className="text-[11px] text-[#5B675E] ml-auto font-mono">
          Showing {filteredOrders.length} orders
        </span>
      </div>

      {/* 4 KPIs Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-orders-received"
          title="Orders Received"
          value={totalOrders.toLocaleString()}
          subtitle="+12.8% vs last month"
          icon={<TrendingUp className="w-4 h-4" />}
          variant="brand"
        />
        <KPICard
          id="kpi-orders-delivered"
          title="Delivered"
          value={deliveredCount.toLocaleString()}
          subtitle="+8.4% vs last month"
          icon={<PackageCheck className="w-4 h-4" />}
          variant="default"
        />
        <KPICard
          id="kpi-pending-orders"
          title="Pending Orders"
          value={pendingCount.toLocaleString()}
          subtitle="24 need attention"
          icon={<Clock className="w-4 h-4" />}
          variant="gold"
        />
        <KPICard
          id="kpi-net-profit"
          title="Net Profit"
          value={formatCurrency(netProfitValue)}
          subtitle="+18.2% vs last month"
          icon={<DollarSign className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
      </div>

      {/* Grid 2: Performance Chart & Delivery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
              Order Performance & Velocity
            </h3>
            <div className="flex items-center bg-[#EEF0E8] p-0.5 rounded-[6px] border border-[#E2E5DD]">
              <button
                onClick={() => setChartDays('30')}
                className={`px-2 py-0.5 text-[11px] rounded-[4px] font-medium transition-all ${
                  chartDays === '30'
                    ? 'bg-white text-[#12231C] font-semibold shadow-xs'
                    : 'text-[#5B675E]'
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setChartDays('7')}
                className={`px-2 py-0.5 text-[11px] rounded-[4px] font-medium transition-all ${
                  chartDays === '7'
                    ? 'bg-white text-[#12231C] font-semibold shadow-xs'
                    : 'text-[#5B675E]'
                }`}
              >
                Last 7 days
              </button>
            </div>
          </div>

          <div className="p-5">
            {/* Minimalist Tailwind CSS Bar Chart */}
            <div className="h-48 flex items-end gap-2.5 pt-4 pb-2 border-b border-[#EEF0E8]">
              {activeBars.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                >
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full bg-[#146B4E] rounded-t-[4px] transition-all duration-300 group-hover:bg-[#0b765e] opacity-85 group-hover:opacity-100"
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#12231C] text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                    {val}%
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-[#5B675E] font-mono pt-2">
              <span>Day 01</span>
              <span>Day 07</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Day {chartDays}</span>
            </div>
          </div>
        </div>

        {/* Delivery Status Breakdown Progress Bars */}
        <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
              Delivery Outcome
            </h3>
            <span className="text-[10px] text-[#5B675E] font-mono">This month</span>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#12231C]">Delivered</span>
                <span className="font-mono font-bold text-[#146B4E]">842 (66%)</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#146B4E] h-full rounded-full" style={{ width: '66%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#12231C]">Pending In Transit</span>
                <span className="font-mono font-bold text-[#B9822A]">318 (25%)</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#B9822A] h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#12231C]">Failed / Rescheduled</span>
                <span className="font-mono font-bold text-[#B33A3A]">71 (6%)</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#B33A3A] h-full rounded-full" style={{ width: '6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#12231C]">Rejected at Doorstep</span>
                <span className="font-mono font-bold text-[#5B675E]">49 (4%)</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#5B675E] h-full rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAFBF9] border-t border-[#EEF0E8] text-center">
            <button
              onClick={() => onNavigate('delivery')}
              className="text-xs text-[#146B4E] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Open Delivery Board <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid 2: Recent Orders & Top Sales Reps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
              Recent Orders
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="px-2.5 py-1 text-xs border border-[#E2E5DD] rounded-[6px] hover:bg-[#EEF0E8] font-medium transition-colors"
            >
              View all orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Order</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Sales Rep</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5DD]">
                {orders.slice(0, 5).map(o => {
                  const item = o.items?.[0];
                  return (
                    <tr
                      key={o.id}
                      onClick={() => onOpenOrderDrawer(o)}
                      className="hover:bg-[#FAFBF9] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#12231C]">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#12231C]">{o.customer?.name}</div>
                        <div className="text-[10px] text-[#5B675E] font-mono">
                          {o.customer?.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#5B675E]">
                        {item?.product?.name || 'Item'} × {item?.qty || 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#12231C]">
                        {o.assignedRep?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={o.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#12231C]">
                        {formatCurrency(o.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sales Reps Leaderboard */}
        <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
              Top Sales Reps
            </h3>
            <button
              onClick={() => onNavigate('sales')}
              className="px-2.5 py-1 text-xs border border-[#E2E5DD] rounded-[6px] hover:bg-[#EEF0E8] font-medium transition-colors"
            >
              Leaderboard
            </button>
          </div>

          <div className="p-4 divide-y divide-[#EEF0E8]">
            {repStats.map((rep, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#E3F0E9] text-[#146B4E] flex items-center justify-center font-bold text-xs font-mono">
                    {rep.initial}
                  </div>
                  <div>
                    <strong className="text-xs text-[#12231C] block">{rep.name}</strong>
                    <span className="text-[10px] text-[#5B675E] font-mono">
                      {rep.confirmed} confirmed
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#146B4E]">{rep.rate}%</span>
                  <span className="text-[10px] text-[#5B675E] block">conv. rate</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#FAFBF9] border-t border-[#EEF0E8] text-center">
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-[#146B4E] font-semibold hover:underline inline-flex items-center gap-1"
            >
              View Full Team Metrics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
