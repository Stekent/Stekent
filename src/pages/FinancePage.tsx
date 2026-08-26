import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Truck,
  CreditCard,
  Building2,
  PieChart,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Users,
} from 'lucide-react';
import { CRMStats } from '../types';
import { KPICard } from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

interface FinancePageProps {
  stats: CRMStats | null;
  onToast: (msg: string) => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({ stats, onToast }) => {
  const [isRemitModalOpen, setIsRemitModalOpen] = useState(false);
  const [remitCourier, setRemitCourier] = useState('GIG Logistics');
  const [remitAmount, setRemitAmount] = useState('');
  const [remitRef, setRemitRef] = useState('');

  const grossRevenue = stats?.totalRevenue || 18420000;
  const cogsCost = stats?.cogsCost || 7810000;
  const logisticsCost = stats?.logisticsCost || 2140000;
  const adSpendCost = stats?.adSpend || 2420000;
  const payrollCommissionCost = 960000; // Total sales rep commission & base retainers
  const netProfit = Math.max(0, grossRevenue - cogsCost - logisticsCost - adSpendCost - payrollCommissionCost);
  const netMargin = ((netProfit / (grossRevenue || 1)) * 100).toFixed(1);

  const expectedCOD = stats?.deliveredRevenue || 8420000;
  const receivedRemittance = 6800000;
  const outstandingCOD = Math.max(0, expectedCOD - receivedRemittance);

  const handleRemitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remitAmount) return;
    onToast(`Bank remittance of ${formatCurrency(Number(remitAmount))} recorded from ${remitCourier}`);
    setIsRemitModalOpen(false);
    setRemitAmount('');
    setRemitRef('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Financial Performance & Remittances
          </h1>
          <p className="text-xs text-[#5B675E]">
            Financial health, Profit & Loss waterfall, sales commissions, and courier COD cash reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] text-xs font-semibold text-[#12231C] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Financial P&L</span>
          </button>
          <button
            onClick={() => setIsRemitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Courier Remittance</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-gross-revenue"
          title="Gross Delivered Revenue"
          value={formatCurrency(grossRevenue)}
          subtitle="Total closed sales"
          icon={<DollarSign className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
        <KPICard
          id="kpi-cogs-cost"
          title="Product Cost (COGS)"
          value={formatCurrency(cogsCost)}
          subtitle={`${((cogsCost / (grossRevenue || 1)) * 100).toFixed(1)}% of revenue`}
          icon={<CreditCard className="w-4 h-4" />}
          variant="default"
          isMoney={true}
        />
        <KPICard
          id="kpi-logistics-cost"
          title="Logistics & Dispatch"
          value={formatCurrency(logisticsCost)}
          subtitle="Waybills & courier fees"
          icon={<Truck className="w-4 h-4" />}
          variant="gold"
          isMoney={true}
        />
        <KPICard
          id="kpi-net-profit-finance"
          title="Net Operating Profit"
          value={formatCurrency(netProfit)}
          subtitle={`${netMargin}% net profit margin`}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
      </div>

      {/* P&L Breakdown & Courier Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Waterfall P&L Breakdown */}
        <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
              Profit & Loss Waterfall Breakdown
            </h3>
            <span className="text-[10px] text-[#5B675E] font-mono">Current Month Period</span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#12231C]">1. Gross Revenue (100%)</span>
                <span className="font-mono font-bold text-[#146B4E]">{formatCurrency(grossRevenue)}</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#146B4E] h-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#5B675E]">2. (-) Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-[#B33A3A]">-{formatCurrency(cogsCost)}</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#B33A3A] h-full"
                  style={{ width: `${((cogsCost / grossRevenue) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#5B675E]">3. (-) Logistics & Courier Waybills</span>
                <span className="font-mono text-[#B9822A]">-{formatCurrency(logisticsCost)}</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#B9822A] h-full"
                  style={{ width: `${((logisticsCost / grossRevenue) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#5B675E]">4. (-) Paid Ad Spend (Meta & Google)</span>
                <span className="font-mono text-[#2F5FA8]">-{formatCurrency(adSpendCost)}</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2F5FA8] h-full"
                  style={{ width: `${((adSpendCost / grossRevenue) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#5B675E]">5. (-) Sales Rep Payroll & Commissions</span>
                <span className="font-mono text-purple-700">-{formatCurrency(payrollCommissionCost)}</span>
              </div>
              <div className="w-full bg-[#EEF0E8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-700 h-full"
                  style={{ width: `${((payrollCommissionCost / grossRevenue) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#EEF0E8]">
              <div className="flex justify-between font-bold text-sm">
                <span className="text-[#12231C] font-heading">Net Operating Profit</span>
                <span className="font-mono text-[#146B4E]">{formatCurrency(netProfit)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#5B675E] mt-1 font-mono">
                <span>Net Margin Percentage</span>
                <span className="font-bold text-[#146B4E]">{netMargin}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courier Remittance Pipeline */}
        <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
                Cash in Transit & Courier Remittance
              </h3>
              <span className="text-[10px] text-[#5B675E] font-mono">Live reconciliation</span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#5B675E] block">Delivered COD Orders (Collected)</span>
                  <span className="text-base font-bold font-mono text-[#12231C]">
                    {formatCurrency(expectedCOD)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E3F0E9] text-[#146B4E] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#5B675E] block">Remitted to Bank Account</span>
                  <span className="text-base font-bold font-mono text-[#146B4E]">
                    {formatCurrency(receivedRemittance)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E3F0E9] text-[#146B4E] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#F6ECD8] border border-[#B9822A]/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#B9822A] font-semibold block">Outstanding with Couriers</span>
                  <span className="text-base font-bold font-mono text-[#12231C]">
                    {formatCurrency(outstandingCOD)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#B9822A]/20 text-[#B9822A] flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FAFBF9] border-t border-[#EEF0E8] flex justify-between items-center text-xs">
            <span className="text-[#5B675E] font-mono text-[11px]">Audit: 4 Active Couriers</span>
            <button
              onClick={() => setIsRemitModalOpen(true)}
              className="px-3 py-1.5 bg-[#146B4E] hover:bg-[#0f553e] text-white font-semibold rounded-[6px]"
            >
              Reconcile New Batch
            </button>
          </div>
        </div>
      </div>

      {/* Itemized P&L Accounting Statement Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E5DD] flex justify-between items-center bg-[#FAFBF9]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#146B4E]" />
            <h3 className="font-heading font-bold text-sm text-[#12231C]">
              Itemized Profit & Loss (P&L) Statement
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#5B675E]">Audited Financial Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[10px] text-[#5B675E] uppercase tracking-wider font-heading">
              <tr>
                <th className="py-3 px-4">Line Item Category</th>
                <th className="py-3 px-4">Operational Ledger Reference</th>
                <th className="py-3 px-4 text-center">% of GMV</th>
                <th className="py-3 px-4 text-right">Debit / Credit (NGN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0E8]">
              <tr className="bg-white">
                <td className="py-3 px-4 font-bold text-[#12231C]">Gross Sales Revenue</td>
                <td className="py-3 px-4 text-[#5B675E]">Verified Delivered & Paid Cash on Delivery Orders</td>
                <td className="py-3 px-4 text-center font-mono font-bold">100.0%</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#146B4E]">
                  +{formatCurrency(grossRevenue)}
                </td>
              </tr>
              <tr className="bg-[#FAFBF9]/50">
                <td className="py-3 px-4 font-medium text-[#12231C]">Cost of Goods Sold (COGS)</td>
                <td className="py-3 px-4 text-[#5B675E]">Direct inventory procurement landed cost</td>
                <td className="py-3 px-4 text-center font-mono text-[#B33A3A]">42.4%</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-[#B33A3A]">
                  -{formatCurrency(cogsCost)}
                </td>
              </tr>
              <tr className="bg-white font-semibold">
                <td className="py-2.5 px-4 text-[#146B4E]">Gross Margin Contribution</td>
                <td className="py-2.5 px-4 text-[#5B675E]">Revenue minus direct product cost</td>
                <td className="py-2.5 px-4 text-center font-mono text-[#146B4E]">57.6%</td>
                <td className="py-2.5 px-4 text-right font-mono text-[#146B4E]">
                  +{formatCurrency(grossRevenue - cogsCost)}
                </td>
              </tr>
              <tr className="bg-[#FAFBF9]/50">
                <td className="py-3 px-4 font-medium text-[#12231C]">Logistics & Courier Delivery</td>
                <td className="py-3 px-4 text-[#5B675E]">GIG, Speedaf, Fez & last-mile rider waybill disbursements</td>
                <td className="py-3 px-4 text-center font-mono text-[#B9822A]">11.6%</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-[#B9822A]">
                  -{formatCurrency(logisticsCost)}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="py-3 px-4 font-medium text-[#12231C]">Advertising & Paid Media</td>
                <td className="py-3 px-4 text-[#5B675E]">Meta Ads (Facebook/Instagram), TikTok & Google Ads</td>
                <td className="py-3 px-4 text-center font-mono text-[#2F5FA8]">13.1%</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-[#2F5FA8]">
                  -{formatCurrency(adSpendCost)}
                </td>
              </tr>
              <tr className="bg-[#FAFBF9]/50">
                <td className="py-3 px-4 font-medium text-[#12231C]">Sales Payroll & Commissions</td>
                <td className="py-3 px-4 text-[#5B675E]">Base retainers + verified delivered POD order bonuses</td>
                <td className="py-3 px-4 text-center font-mono text-purple-700">5.2%</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-purple-700">
                  -{formatCurrency(payrollCommissionCost)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-[#12231C] text-white font-bold text-sm">
              <tr>
                <td className="py-3.5 px-4 font-heading uppercase text-[#D9CDA9]">Net Operating Income (EBITDA)</td>
                <td className="py-3.5 px-4 text-xs font-normal text-white/70">Final profit after all operational expenses</td>
                <td className="py-3.5 px-4 text-center font-mono text-[#E3F0E9]">{netMargin}%</td>
                <td className="py-3.5 px-4 text-right font-mono text-base text-[#E3F0E9]">
                  {formatCurrency(netProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Record Remittance Modal */}
      {isRemitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Record Courier Remittance
              </h3>
              <button
                onClick={() => setIsRemitModalOpen(false)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRemitSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Courier / Logistics Partner *
                </label>
                <select
                  value={remitCourier}
                  onChange={e => setRemitCourier(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                >
                  <option value="GIG Logistics">GIG Logistics</option>
                  <option value="Fez Delivery">Fez Delivery</option>
                  <option value="Speedaf Express">Speedaf Express</option>
                  <option value="Gokada Last-Mile">Gokada Last-Mile</option>
                  <option value="Kwese Deliveries">Kwese Deliveries</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Remitted Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 750000"
                  value={remitAmount}
                  onChange={e => setRemitAmount(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none font-mono focus:border-[#146B4E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Bank Reference / Batch ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. GTB-TRF-9948210"
                  value={remitRef}
                  onChange={e => setRemitRef(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none font-mono focus:border-[#146B4E]"
                />
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRemitModalOpen(false)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] text-xs font-semibold text-[#5B675E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white"
                >
                  Record & Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
