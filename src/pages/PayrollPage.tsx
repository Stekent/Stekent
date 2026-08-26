import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import { PayrollRecord, PayrollPeriod, CommissionRules, User } from '../types';
import { PayslipModal } from '../components/PayslipModal';

interface PayrollPageProps {
  currentUser: User | null;
  onToast: (msg: string) => void;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ currentUser, onToast }) => {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('pyr-2026-08');
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [rules, setRules] = useState<CommissionRules | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingRules, setIsEditingRules] = useState<boolean>(false);
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);

  // Form states for rules
  const [baseSalary, setBaseSalary] = useState<number>(50000);
  const [perConfirmed, setPerConfirmed] = useState<number>(300);
  const [perDelivered, setPerDelivered] = useState<number>(1500);
  const [returnPenalty, setReturnPenalty] = useState<number>(500);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const [fetchedPeriods, fetchedRules, fetchedRecords] = await Promise.all([
        api.getPayrollPeriods(),
        api.getCommissionRules(),
        api.getPayrollRecords(selectedPeriodId),
      ]);
      setPeriods(fetchedPeriods);
      setRules(fetchedRules);
      setRecords(fetchedRecords);

      if (fetchedRules) {
        setBaseSalary(fetchedRules.baseSalary);
        setPerConfirmed(fetchedRules.perConfirmedBonus);
        setPerDelivered(fetchedRules.perDeliveredCommission);
        setReturnPenalty(fetchedRules.returnPenalty);
      }
    } catch (err: any) {
      console.error('Failed to load payroll data:', err);
      onToast('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriodId]);

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateCommissionRules(
        {
          baseSalary,
          perConfirmedBonus: perConfirmed,
          perDeliveredCommission: perDelivered,
          returnPenalty,
        },
        currentUser?.id
      );
      setRules(updated);
      setIsEditingRules(false);
      onToast('Commission rules updated and applied to future calculation cycles');
      await loadPayrollData();
    } catch (err: any) {
      onToast(err.message || 'Failed to update rules');
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      await api.approvePayroll(recordId, currentUser?.id);
      onToast('Payroll record approved for disbursement');
      await loadPayrollData();
    } catch (err: any) {
      onToast(err.message || 'Failed to approve');
    }
  };

  const handleMarkPaid = async (recordId: string) => {
    try {
      await api.markPayrollPaid(recordId, currentUser?.id);
      onToast('Payroll marked as disbursed and paid');
      await loadPayrollData();
    } catch (err: any) {
      onToast(err.message || 'Failed to mark paid');
    }
  };

  const handleApproveAll = async () => {
    const draftRecords = records.filter(r => r.status === 'Draft');
    for (const r of draftRecords) {
      await api.approvePayroll(r.id, currentUser?.id);
    }
    onToast(`Approved all ${draftRecords.length} payroll records`);
    await loadPayrollData();
  };

  const totalDisbursement = records.reduce((sum, r) => sum + r.netPayable, 0);
  const totalDelivered = records.reduce((sum, r) => sum + r.deliveredCount, 0);
  const totalCommissionOnly = records.reduce((sum, r) => sum + r.deliveredCommission + r.confirmedBonus, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5B675E] mb-1">
            <span className="font-heading font-semibold uppercase tracking-wider">Total Pay Period Payout</span>
            <DollarSign className="w-4 h-4 text-[#146B4E]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#12231C]">
            ₦{totalDisbursement.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#5B675E] mt-1 flex items-center gap-1 font-mono">
            <span>{records.length} sales representatives</span>
          </div>
        </div>

        <div className="p-4 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5B675E] mb-1">
            <span className="font-heading font-semibold uppercase tracking-wider">Variable Commissions</span>
            <TrendingUp className="w-4 h-4 text-[#146B4E]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#146B4E]">
            ₦{totalCommissionOnly.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#5B675E] mt-1 font-mono">
            <span>Confirmed + Delivered bonuses</span>
          </div>
        </div>

        <div className="p-4 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5B675E] mb-1">
            <span className="font-heading font-semibold uppercase tracking-wider">Delivered Volume</span>
            <CheckCircle2 className="w-4 h-4 text-[#2F5FA8]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#12231C]">
            {totalDelivered} units
          </div>
          <div className="text-[11px] text-[#5B675E] mt-1 font-mono">
            <span>Verified successful POD orders</span>
          </div>
        </div>

        <div className="p-4 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5B675E] mb-1">
            <span className="font-heading font-semibold uppercase tracking-wider">Commission Rules Engine</span>
            <Sliders className="w-4 h-4 text-[#B9822A]" />
          </div>
          <div className="text-xs font-mono font-bold text-[#12231C] mt-1 space-y-0.5">
            <div>Delivered: <span className="text-[#146B4E]">₦{rules?.perDeliveredCommission.toLocaleString()}</span> / ord</div>
            <div>Confirmed: <span className="text-[#2F5FA8]">₦{rules?.perConfirmedBonus.toLocaleString()}</span> / ord</div>
          </div>
          <button
            onClick={() => setIsEditingRules(!isEditingRules)}
            className="text-[11px] text-[#146B4E] font-semibold hover:underline mt-1 block"
          >
            {isEditingRules ? 'Close Settings' : 'Configure Rules →'}
          </button>
        </div>
      </div>

      {/* Rules Editor Drawer/Card (Collapsible) */}
      {isEditingRules && (
        <div className="p-5 rounded-[12px] bg-[#FFFFFF] border-2 border-[#146B4E] shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E5DD] mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#146B4E]" />
              <h3 className="font-heading font-bold text-sm text-[#12231C]">
                Configure Store Commission & Retainer Rules
              </h3>
            </div>
            <button
              onClick={() => setIsEditingRules(false)}
              className="text-xs text-[#5B675E] hover:text-[#12231C]"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveRules} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#12231C] mb-1">
                Base Monthly Retainer (₦)
              </label>
              <input
                type="number"
                value={baseSalary}
                onChange={e => setBaseSalary(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white font-mono"
              />
              <span className="text-[10px] text-[#5B675E]">Fixed monthly salary per active rep</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12231C] mb-1">
                Confirmed Order Bonus (₦)
              </label>
              <input
                type="number"
                value={perConfirmed}
                onChange={e => setPerConfirmed(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white font-mono"
              />
              <span className="text-[10px] text-[#5B675E]">Awarded upon customer confirmation</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12231C] mb-1">
                Delivered POD Commission (₦)
              </label>
              <input
                type="number"
                value={perDelivered}
                onChange={e => setPerDelivered(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white font-mono"
              />
              <span className="text-[10px] text-[#5B675E]">Awarded when rider collects cash</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12231C] mb-1">
                Returned / Rejected Penalty (₦)
              </label>
              <input
                type="number"
                value={returnPenalty}
                onChange={e => setReturnPenalty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white font-mono text-[#B33A3A]"
              />
              <span className="text-[10px] text-[#5B675E]">Deduction for returned verified orders</span>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-[#EEF0E8]">
              <button
                type="button"
                onClick={() => setIsEditingRules(false)}
                className="px-4 py-2 rounded-[6px] border border-[#E2E5DD] text-xs font-semibold text-[#12231C] hover:bg-[#EEF0E8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save & Update Payroll Formulas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pay Period Selector & Bulk Approval Header */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E5DD] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#146B4E]" />
            <span className="text-xs font-bold text-[#12231C] font-heading">Payroll Cycle:</span>
          </div>
          <select
            value={selectedPeriodId}
            onChange={e => setSelectedPeriodId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-[6px] border border-[#E2E5DD] bg-[#FAFBF9] font-medium text-[#12231C] focus:outline-none focus:border-[#146B4E]"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {records.some(r => r.status === 'Draft') && (
            <button
              onClick={handleApproveAll}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-[6px] bg-[#2F5FA8] hover:bg-[#254c86] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve All Drafts</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] text-xs font-semibold text-[#12231C] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Payroll Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Staff Payroll Ledger Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E5DD] flex justify-between items-center bg-[#FAFBF9]">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#12231C]">
              Staff Payroll & Performance Ledger
            </h3>
            <p className="text-[11px] text-[#5B675E]">
              Itemized compensation calculation based on verified delivery outcomes and returns
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#146B4E]">
            {records.length} Staff Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[10px] text-[#5B675E] uppercase tracking-wider font-heading">
              <tr>
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-3 text-right">Base Salary</th>
                <th className="py-3 px-3 text-center">Confirmed</th>
                <th className="py-3 px-3 text-right">Conf. Bonus</th>
                <th className="py-3 px-3 text-center">Delivered</th>
                <th className="py-3 px-3 text-right">Del. Comm.</th>
                <th className="py-3 px-3 text-center">Returns</th>
                <th className="py-3 px-3 text-right">Penalties</th>
                <th className="py-3 px-3 text-right">Net Payable</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0E8]">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#12231C]">{record.repName}</div>
                    <div className="text-[10px] text-[#5B675E] font-mono">ID: {record.repId}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-[#12231C]">
                    ₦{record.baseSalary.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-[#2F5FA8]">
                    {record.confirmedCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#2F5FA8]">
                    +₦{record.confirmedBonus.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-[#146B4E]">
                    {record.deliveredCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-[#146B4E]">
                    +₦{record.deliveredCommission.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-[#B33A3A]">
                    {record.returnCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#B33A3A]">
                    -₦{record.returnPenalty.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#12231C]">
                    ₦{record.netPayable.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        record.status === 'Paid'
                          ? 'bg-[#E3F0E9] text-[#146B4E]'
                          : record.status === 'Approved'
                          ? 'bg-[#E8EEF7] text-[#2F5FA8]'
                          : 'bg-[#F6ECD8] text-[#B9822A]'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPayslipRecord(record)}
                        className="px-2.5 py-1 rounded-[4px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] text-[11px] font-semibold text-[#12231C] flex items-center gap-1"
                        title="View & Print Itemized Payslip"
                      >
                        <FileText className="w-3 h-3 text-[#146B4E]" />
                        <span>Payslip</span>
                      </button>

                      {record.status === 'Draft' && (
                        <button
                          onClick={() => handleApprove(record.id)}
                          className="px-2 py-1 rounded-[4px] bg-[#2F5FA8] hover:bg-[#254c86] text-[11px] font-bold text-white shadow-xs"
                        >
                          Approve
                        </button>
                      )}

                      {record.status === 'Approved' && (
                        <button
                          onClick={() => handleMarkPaid(record.id)}
                          className="px-2 py-1 rounded-[4px] bg-[#146B4E] hover:bg-[#0f553e] text-[11px] font-bold text-white shadow-xs"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#FAFBF9] border-t-2 border-[#E2E5DD] font-bold text-xs">
              <tr>
                <td className="py-3 px-4 text-[#12231C] font-heading uppercase">Total Disbursement</td>
                <td className="py-3 px-3 text-right font-mono">
                  ₦{(records.length * (rules?.baseSalary || 50000)).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {records.reduce((s, r) => s + r.confirmedCount, 0)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#2F5FA8]">
                  +₦{records.reduce((s, r) => s + r.confirmedBonus, 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {records.reduce((s, r) => s + r.deliveredCount, 0)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#146B4E]">
                  +₦{records.reduce((s, r) => s + r.deliveredCommission, 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center font-mono text-[#B33A3A]">
                  {records.reduce((s, r) => s + r.returnCount, 0)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#B33A3A]">
                  -₦{records.reduce((s, r) => s + r.returnPenalty, 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-base text-[#146B4E]">
                  ₦{totalDisbursement.toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Itemized Payslip Modal */}
      <PayslipModal
        record={selectedPayslipRecord}
        isOpen={!!selectedPayslipRecord}
        onClose={() => setSelectedPayslipRecord(null)}
        onApprove={handleApprove}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
};
