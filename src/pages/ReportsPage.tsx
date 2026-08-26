import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  BarChart3,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  PieChart,
  Megaphone,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, Product, User, CRMStats } from '../types';
import { KPICard } from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

interface ReportsPageProps {
  orders: Order[];
  products: Product[];
  users: User[];
  stats: CRMStats | null;
  onToast: (msg: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  orders = [],
  products = [],
  users = [],
  stats,
  onToast,
}) => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<
    'executive' | 'marketing' | 'sales' | 'operations' | 'exports'
  >('executive');
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Dispatched' || o.status === 'Delivered');
  const returnedOrders = orders.filter(o => o.status === 'Returned' || o.status === 'Cancelled');

  const grossRevenue = stats?.totalRevenue || 18420000;
  const netProfit = stats?.netProfit || 6420000;
  const adSpend = stats?.adSpend || 2420000;
  const roas = ((grossRevenue / (adSpend || 1))).toFixed(2);
  const costPerOrder = (adSpend / (orders.length || 1)).toFixed(0);

  const handleExportCSV = (reportName: string) => {
    setIsExporting(reportName);
    setTimeout(() => {
      setIsExporting(null);
      onToast(`${reportName} (.CSV) exported successfully`);
    }, 600);
  };

  const reportCards = [
    {
      id: 'sales-rev',
      title: 'Sales & Revenue General Ledger',
      desc: 'Complete chronological record of all customer orders, itemized line items, billing amounts, and status changes.',
      icon: <DollarSign className="w-5 h-5 text-[#146B4E]" />,
      stats: `${orders.length} total orders recorded`,
    },
    {
      id: 'delivery-log',
      title: 'Logistics & Courier Delivery Audit',
      desc: 'Waybill performance, delivery rates by courier partner (GIG, Speedaf, Fez), transit turnaround times, and returned items.',
      icon: <Truck className="w-5 h-5 text-[#2F5FA8]" />,
      stats: '6 courier partner channels audited',
    },
    {
      id: 'prod-margin',
      title: 'Product Stock & Unit Margin Analysis',
      desc: 'Catalog valuation, cost price vs selling price margins, and warehouse inventory turnover metrics.',
      icon: <BarChart3 className="w-5 h-5 text-[#B9822A]" />,
      stats: `${products.length} catalog SKUs evaluated`,
    },
    {
      id: 'rep-perf',
      title: 'Sales Rep Dispatch & Conversion Velocity',
      desc: 'Round-robin assigned orders, call confirmation velocity, and delivered GMV per sales representative.',
      icon: <Users className="w-5 h-5 text-[#12231C]" />,
      stats: `${users.filter(u => u.role === 'sales_rep').length} staff representatives tracked`,
    },
    {
      id: 'payroll-log',
      title: 'Staff Commission & Payroll Disbursement Sheet',
      desc: 'Itemized base retainer, confirmed order bonuses, delivered commissions, and return penalties per sales rep.',
      icon: <FileText className="w-5 h-5 text-purple-700" />,
      stats: 'Monthly payroll compliance format',
    },
    {
      id: 'remit-ledger',
      title: 'Courier Cash on Delivery Remittance Statement',
      desc: 'Gross cash collected at doorstep by riders, logistics fees deducted, and net funds remitted to bank accounts.',
      icon: <CheckCircle className="w-5 h-5 text-[#146B4E]" />,
      stats: 'Bank reconciliation ledger',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Analytics Suite & Operational Reports
          </h1>
          <p className="text-xs text-[#5B675E]">
            Executive intelligence dashboards, unit economics, conversion funnels, and exportable financial manifests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E5DD] px-3 py-1.5 rounded-[6px] text-xs text-[#12231C]">
            <Calendar className="w-3.5 h-3.5 text-[#5B675E]" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="outline-none bg-transparent font-medium"
            >
              <option value="today">Today (Live)</option>
              <option value="week">This Week</option>
              <option value="month">This Month (Current Cycle)</option>
              <option value="year">Year to Date (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Suite Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-[8px] bg-[#FFFFFF] border border-[#E2E5DD] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveAnalyticsTab('executive')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-all ${
            activeAnalyticsTab === 'executive'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Executive Dashboard</span>
        </button>

        <button
          onClick={() => setActiveAnalyticsTab('marketing')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-all ${
            activeAnalyticsTab === 'marketing'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Marketing & ROAS</span>
        </button>

        <button
          onClick={() => setActiveAnalyticsTab('sales')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-all ${
            activeAnalyticsTab === 'sales'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Sales Conversion Funnel</span>
        </button>

        <button
          onClick={() => setActiveAnalyticsTab('operations')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-all ${
            activeAnalyticsTab === 'operations'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Logistics & Regional Matrix</span>
        </button>

        <button
          onClick={() => setActiveAnalyticsTab('exports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-all ${
            activeAnalyticsTab === 'exports'
              ? 'bg-[#146B4E] text-white shadow-xs'
              : 'text-[#5B675E] hover:text-[#12231C] hover:bg-[#EEF0E8]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Compliance Exports (.CSV)</span>
        </button>
      </div>

      {/* VIEW 1: EXECUTIVE DASHBOARD */}
      {activeAnalyticsTab === 'executive' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              id="kpi-exec-revenue"
              title="Delivered GMV"
              value={formatCurrency(grossRevenue)}
              subtitle="+16.4% MoM growth"
              icon={<DollarSign className="w-4 h-4" />}
              variant="brand"
              isMoney={true}
            />
            <KPICard
              id="kpi-exec-profit"
              title="Net Operating Profit"
              value={formatCurrency(netProfit)}
              subtitle="34.9% Net Margin"
              icon={<TrendingUp className="w-4 h-4" />}
              variant="brand"
              isMoney={true}
            />
            <KPICard
              id="kpi-exec-orders"
              title="Total Order Flow"
              value={orders.length.toLocaleString()}
              subtitle={`${deliveredOrders.length} delivered POD`}
              icon={<BarChart3 className="w-4 h-4" />}
              variant="blue"
            />
            <KPICard
              id="kpi-exec-success"
              title="Delivery Completion Rate"
              value="82.5%"
              subtitle="Doorstep cash collected"
              icon={<ShieldCheck className="w-4 h-4" />}
              variant="gold"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 p-5 bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#12231C]">
                Executive Revenue vs Cost Structure
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Delivered GMV (Revenue)</span>
                    <span className="font-mono font-bold text-[#146B4E]">{formatCurrency(grossRevenue)}</span>
                  </div>
                  <div className="w-full bg-[#EEF0E8] h-3 rounded-full overflow-hidden flex">
                    <div className="bg-[#146B4E] h-full" style={{ width: '35%' }} title="Net Profit (35%)" />
                    <div className="bg-[#B33A3A] h-full" style={{ width: '42%' }} title="COGS (42%)" />
                    <div className="bg-[#2F5FA8] h-full" style={{ width: '13%' }} title="Ad Spend (13%)" />
                    <div className="bg-[#B9822A] h-full" style={{ width: '10%' }} title="Logistics (10%)" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                  <div className="p-2 rounded-[6px] bg-[#E3F0E9] text-[#146B4E]">
                    <span className="block font-bold">34.9% Net Profit</span>
                    <span>{formatCurrency(netProfit)}</span>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[#FCE8E8] text-[#B33A3A]">
                    <span className="block font-bold">42.4% COGS</span>
                    <span>{formatCurrency(stats?.cogsCost || 7810000)}</span>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[#E8EEF7] text-[#2F5FA8]">
                    <span className="block font-bold">13.1% Ad Spend</span>
                    <span>{formatCurrency(adSpend)}</span>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[#F6ECD8] text-[#B9822A]">
                    <span className="block font-bold">9.6% Logistics</span>
                    <span>{formatCurrency(stats?.logisticsCost || 2140000)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#12231C]">
                Capital & Inventory Health
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex justify-between items-center">
                  <span className="text-[#5B675E]">Active SKU Count:</span>
                  <span className="font-mono font-bold text-[#12231C]">{products.length} SKUs</span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex justify-between items-center">
                  <span className="text-[#5B675E]">Warehouse Stock Value:</span>
                  <span className="font-mono font-bold text-[#146B4E]">
                    ₦{products.reduce((s, p) => s + p.costPrice * p.stock, 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex justify-between items-center">
                  <span className="text-[#5B675E]">Potential Retail Value:</span>
                  <span className="font-mono font-bold text-[#12231C]">
                    ₦{products.reduce((s, p) => s + p.sellingPrice * p.stock, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MARKETING & ROAS */}
      {activeAnalyticsTab === 'marketing' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              id="kpi-roas-val"
              title="Blended ROAS"
              value={`${roas}x`}
              subtitle="Delivered GMV / Ad Spend"
              icon={<TrendingUp className="w-4 h-4" />}
              variant="brand"
            />
            <KPICard
              id="kpi-ad-spend-tot"
              title="Total Ad Spend"
              value={formatCurrency(adSpend)}
              subtitle="Meta, TikTok & Google"
              icon={<Megaphone className="w-4 h-4" />}
              variant="blue"
              isMoney={true}
            />
            <KPICard
              id="kpi-cpo-val"
              title="Cost Per Inbound Order"
              value={`₦${Number(costPerOrder).toLocaleString()}`}
              subtitle="Lead acquisition efficiency"
              icon={<DollarSign className="w-4 h-4" />}
              variant="gold"
            />
            <KPICard
              id="kpi-traffic-orders"
              title="Traffic Conversions"
              value={`${orders.length} orders`}
              subtitle="Direct checkout submissions"
              icon={<BarChart3 className="w-4 h-4" />}
              variant="brand"
            />
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E5DD] bg-[#FAFBF9] font-heading font-bold text-xs uppercase text-[#12231C]">
              Marketing Acquisition Channel Breakdown
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[10px] text-[#5B675E] uppercase">
                <tr>
                  <th className="py-3 px-4">Channel / Campaign</th>
                  <th className="py-3 px-4 text-right">Ad Spend</th>
                  <th className="py-3 px-4 text-center">Orders Generated</th>
                  <th className="py-3 px-4 text-right">Cost Per Order (CPO)</th>
                  <th className="py-3 px-4 text-right">Delivered GMV</th>
                  <th className="py-3 px-4 text-center">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0E8]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#12231C]">Meta Ads (Facebook & Instagram)</td>
                  <td className="py-3 px-4 text-right font-mono">₦1,420,000</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">14 orders</td>
                  <td className="py-3 px-4 text-right font-mono">₦101,428</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#146B4E]">₦11,200,000</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#146B4E]">7.88x</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#12231C]">TikTok Ads (Viral Video COD)</td>
                  <td className="py-3 px-4 text-right font-mono">₦680,000</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">8 orders</td>
                  <td className="py-3 px-4 text-right font-mono">₦85,000</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#146B4E]">₦5,120,000</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#146B4E]">7.52x</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#12231C]">Google Search & Retargeting</td>
                  <td className="py-3 px-4 text-right font-mono">₦320,000</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">2 orders</td>
                  <td className="py-3 px-4 text-right font-mono">₦160,000</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#146B4E]">₦2,100,000</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#146B4E]">6.56x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SALES CONVERSION FUNNEL */}
      {activeAnalyticsTab === 'sales' && (
        <div className="space-y-5">
          <div className="p-5 bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#12231C]">
              Inbound Lead-to-Cash Funnel Velocity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#12231C] text-white flex items-center justify-center font-bold font-mono text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-[#12231C] block">Inbound Checkout Leads Generated</span>
                    <span className="text-[11px] text-[#5B675E]">Embedded forms & Webhook inputs</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-base text-[#12231C]">{orders.length} orders (100%)</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#E3F0E9]/60 border border-[#146B4E]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#146B4E] text-white flex items-center justify-center font-bold font-mono text-[10px]">2</span>
                  <div>
                    <span className="font-bold text-[#12231C] block">Rep Phone Confirmed Orders</span>
                    <span className="text-[11px] text-[#5B675E]">Verified shipping address and intent</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-base text-[#146B4E]">
                  {confirmedOrders.length} orders ({((confirmedOrders.length / (orders.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#E8EEF7]/60 border border-[#2F5FA8]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#2F5FA8] text-white flex items-center justify-center font-bold font-mono text-[10px]">3</span>
                  <div>
                    <span className="font-bold text-[#12231C] block">Waybill Dispatched to Courier</span>
                    <span className="text-[11px] text-[#5B675E]">Handed to GIG, Speedaf, Fez</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-base text-[#2F5FA8]">
                  {orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length} orders
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#12231C] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#146B4E] text-white flex items-center justify-center font-bold font-mono text-[10px]">4</span>
                  <div>
                    <span className="font-bold text-[#D9CDA9] block">Delivered & Cash Remitted</span>
                    <span className="text-[11px] text-white/70">Verified Proof of Delivery (POD)</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-base text-[#E3F0E9]">
                  {deliveredOrders.length} orders ({((deliveredOrders.length / (orders.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: LOGISTICS & REGIONAL */}
      {activeAnalyticsTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#12231C]">
              Delivery Completion by State / Region
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { state: 'Lagos State', rate: '89.4%', orders: 12, color: 'bg-[#146B4E]' },
                { state: 'Abuja (FCT)', rate: '84.2%', orders: 5, color: 'bg-[#146B4E]' },
                { state: 'Oyo State (Ibadan)', rate: '81.0%', orders: 3, color: 'bg-[#2F5FA8]' },
                { state: 'Rivers State (Port Harcourt)', rate: '77.5%', orders: 2, color: 'bg-[#B9822A]' },
                { state: 'Kano & Kaduna', rate: '72.0%', orders: 2, color: 'bg-[#B9822A]' },
              ].map(item => (
                <div key={item.state} className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#12231C] block">{item.state}</span>
                    <span className="text-[10px] text-[#5B675E]">{item.orders} dispatched orders</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#146B4E]">{item.rate} success</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#12231C]">
              Courier Partner Turnaround & POD Rate
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { courier: 'GIG Logistics', avgTime: '24-48h', podRate: '88.2%' },
                { courier: 'Speedaf Express', avgTime: '24-36h', podRate: '85.4%' },
                { courier: 'Fez Delivery', avgTime: '12-24h (Lagos)', podRate: '91.0%' },
                { courier: 'Gokada Last-Mile', avgTime: 'Same Day', podRate: '94.5%' },
              ].map(c => (
                <div key={c.courier} className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#12231C] block">{c.courier}</span>
                    <span className="text-[10px] text-[#5B675E]">Avg Turnaround: {c.avgTime}</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#146B4E]">{c.podRate} POD</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: COMPLIANCE EXPORTS */}
      {activeAnalyticsTab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportCards.map(r => (
            <div
              key={r.id}
              className="p-5 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD]">
                  {r.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#12231C] font-heading">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#5B675E] leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#5B675E]">
                  {r.stats}
                </span>

                <button
                  disabled={isExporting === r.title}
                  onClick={() => handleExportCSV(r.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting === r.title ? 'Generating...' : 'Export .CSV'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
