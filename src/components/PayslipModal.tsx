import React from 'react';
import { X, Printer, CheckCircle2, DollarSign, Download, Building2, User } from 'lucide-react';
import { PayrollRecord } from '../types';

interface PayslipModalProps {
  record: PayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (recordId: string) => void;
  onMarkPaid?: (recordId: string) => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  record,
  isOpen,
  onClose,
  onApprove,
  onMarkPaid,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[14px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#12231C] text-white flex items-center justify-between border-b border-[#1e382d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#146B4E] flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">
                Itemized Staff Payslip
              </h3>
              <p className="text-[11px] text-[#D9CDA9]/80 font-sans">
                {record.repName} • {record.periodName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-[6px] hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs custom-scrollbar bg-white" id="printable-payslip">
          {/* Company Branding & Reference */}
          <div className="flex justify-between items-start pb-4 border-b border-[#E2E5DD]">
            <div>
              <h2 className="font-heading font-bold text-base text-[#12231C]">STEKENTSTORE NIG LTD</h2>
              <p className="text-[11px] text-[#5B675E]">Enterprise Ecommerce Fulfillment & Operations</p>
              <p className="text-[10px] text-[#5B675E] font-mono mt-0.5">Lagos State, Nigeria • HR & Payroll Dept</p>
            </div>
            <div className="text-right">
              <span className={`inline-block text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase ${
                record.status === 'Paid'
                  ? 'bg-[#E3F0E9] text-[#146B4E] border border-[#146B4E]'
                  : record.status === 'Approved'
                  ? 'bg-[#E8EEF7] text-[#2F5FA8] border border-[#2F5FA8]'
                  : 'bg-[#F6ECD8] text-[#B9822A] border border-[#B9822A]'
              }`}>
                {record.status}
              </span>
              <p className="text-[10px] text-[#5B675E] font-mono mt-1">Ref: {record.id}</p>
            </div>
          </div>

          {/* Staff Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD]">
            <div>
              <span className="text-[10px] text-[#5B675E] block uppercase font-heading font-semibold">Staff Member</span>
              <span className="font-bold text-sm text-[#12231C]">{record.repName}</span>
              <span className="text-[10px] text-[#5B675E] block font-mono">Role: Sales Representative</span>
            </div>
            <div>
              <span className="text-[10px] text-[#5B675E] block uppercase font-heading font-semibold">Pay Period</span>
              <span className="font-bold text-sm text-[#12231C]">{record.periodName}</span>
              <span className="text-[10px] text-[#5B675E] block font-mono">Currency: NGN (₦)</span>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div>
            <h4 className="font-heading font-bold text-xs text-[#12231C] mb-2 uppercase tracking-wide">
              1. Earnings & Performance Commissions
            </h4>
            <div className="border border-[#E2E5DD] rounded-[8px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAFBF9] text-[10px] text-[#5B675E] uppercase border-b border-[#E2E5DD]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Volume</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0E8] text-xs">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#12231C]">Base Monthly Retainer</td>
                    <td className="py-2.5 px-3 text-center font-mono">1 mo</td>
                    <td className="py-2.5 px-3 text-right font-mono">₦{record.baseSalary.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#12231C]">
                      ₦{record.baseSalary.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#12231C]">Confirmed Order Bonus</td>
                    <td className="py-2.5 px-3 text-center font-mono">{record.confirmedCount} orders</td>
                    <td className="py-2.5 px-3 text-right font-mono">₦300</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#146B4E]">
                      +₦{record.confirmedBonus.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#12231C]">Delivered Commission (Paid POD)</td>
                    <td className="py-2.5 px-3 text-center font-mono">{record.deliveredCount} delivered</td>
                    <td className="py-2.5 px-3 text-right font-mono">₦1,500</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#146B4E]">
                      +₦{record.deliveredCommission.toLocaleString()}
                    </td>
                  </tr>
                  {record.bonuses > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#12231C]">Discretionary Top-Performer Bonus</td>
                      <td className="py-2.5 px-3 text-center font-mono">—</td>
                      <td className="py-2.5 px-3 text-right font-mono">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#146B4E]">
                        +₦{record.bonuses.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div>
            <h4 className="font-heading font-bold text-xs text-[#12231C] mb-2 uppercase tracking-wide">
              2. Deductions & Return Penalties
            </h4>
            <div className="border border-[#E2E5DD] rounded-[8px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAFBF9] text-[10px] text-[#5B675E] uppercase border-b border-[#E2E5DD]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Count</th>
                    <th className="py-2 px-3 text-right">Penalty Rate</th>
                    <th className="py-2 px-3 text-right">Deduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0E8] text-xs">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#12231C]">Returned / Rejected Post-Confirmation</td>
                    <td className="py-2.5 px-3 text-center font-mono">{record.returnCount} returns</td>
                    <td className="py-2.5 px-3 text-right font-mono">₦500</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#B33A3A]">
                      -₦{record.returnPenalty.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Payable Banner */}
          <div className="p-4 rounded-[10px] bg-[#12231C] text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] text-[#D9CDA9] font-heading font-semibold uppercase tracking-wider block">
                Total Net Disbursement
              </span>
              <span className="text-[10px] text-white/60">Bank Transfer / Cash Payout</span>
            </div>
            <div className="text-right font-mono font-bold text-xl text-[#E3F0E9]">
              ₦{record.netPayable.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAFBF9] border-t border-[#E2E5DD] flex justify-between items-center">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-[6px] border border-[#E2E5DD] bg-white text-xs font-semibold text-[#12231C] hover:bg-[#EEF0E8] flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Payslip</span>
          </button>

          <div className="flex gap-2">
            {record.status === 'Draft' && onApprove && (
              <button
                onClick={() => {
                  onApprove(record.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-[6px] bg-[#2F5FA8] hover:bg-[#254c86] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Approve for Payment
              </button>
            )}

            {record.status === 'Approved' && onMarkPaid && (
              <button
                onClick={() => {
                  onMarkPaid(record.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Mark as Paid (Disbursed)
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[6px] bg-[#12231C] text-white text-xs font-semibold hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
