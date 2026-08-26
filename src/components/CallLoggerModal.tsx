import React, { useState } from 'react';
import { X, Phone, PhoneCall, Calendar, MessageSquare, CheckCircle2, Clock, Send } from 'lucide-react';
import { Order, User, CallOutcome } from '../types';

interface CallLoggerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogCall: (orderId: string, repId: string, outcome: CallOutcome, note?: string, scheduledFollowUp?: string | null) => Promise<any>;
  onToast: (msg: string) => void;
}

const CALL_OUTCOMES: Array<{ outcome: CallOutcome; label: string; color: string; desc: string }> = [
  {
    outcome: 'Answered & Confirmed',
    label: 'Answered & Confirmed',
    color: 'bg-[#E3F0E9] text-[#146B4E] border-[#146B4E]',
    desc: 'Customer verified order details. Move to Confirmed status.',
  },
  {
    outcome: 'Customer Requested Call Back',
    label: 'Customer Requested Call Back',
    color: 'bg-[#F6ECD8] text-[#B9822A] border-[#B9822A]',
    desc: 'Customer is driving/busy. Schedule a follow-up time.',
  },
  {
    outcome: 'Phone Switched Off',
    label: 'Phone Switched Off',
    color: 'bg-[#FCE8E8] text-[#B33A3A] border-[#B33A3A]',
    desc: 'No connection. Queue for afternoon/evening redial.',
  },
  {
    outcome: 'Ringing No Answer',
    label: 'Ringing No Answer',
    color: 'bg-[#FCE8E8] text-[#B33A3A] border-[#B33A3A]',
    desc: 'Ranged out without answer after 30+ seconds.',
  },
  {
    outcome: 'Price Dispute / Cancelled',
    label: 'Price Dispute / Cancelled',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    desc: 'Customer refused price or changed mind. Mark Cancelled.',
  },
  {
    outcome: 'Duplicate Order',
    label: 'Duplicate Order',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    desc: 'Customer placed same order multiple times.',
  },
];

export const CallLoggerModal: React.FC<CallLoggerModalProps> = ({
  order,
  isOpen,
  onClose,
  currentUser,
  onLogCall,
  onToast,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>('Answered & Confirmed');
  const [note, setNote] = useState<string>('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState<boolean>(false);
  const [followUpTime, setFollowUpTime] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSaveCall = async () => {
    setSubmitting(true);
    try {
      const repId = currentUser?.id || order.assignedRepId || 'usr-rep-1';
      await onLogCall(
        order.id,
        repId,
        selectedOutcome,
        note,
        scheduleFollowUp ? followUpTime || new Date(Date.now() + 4 * 3600000).toISOString() : null
      );
      onToast(`Call attempt recorded: ${selectedOutcome}`);
      onClose();
    } catch (err: any) {
      onToast(err.message || 'Failed to record call');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = (order.customer?.phone || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;
    const productName = order.items?.[0]?.product?.name || 'Your Order';
    const text = encodeURIComponent(
      `Hello ${order.customer?.name || 'Customer'}, this is ${currentUser?.name || 'Stekentstore Sales'}. Regarding your order ${order.orderNumber} for ${productName} (₦${Number(order.totalAmount).toLocaleString()}). Are you ready for delivery?`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[14px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#12231C] text-white flex items-center justify-between border-b border-[#1e382d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#146B4E] flex items-center justify-center text-white">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">
                Log Customer Call • {order.orderNumber}
              </h3>
              <p className="text-[11px] text-[#D9CDA9]/80">
                {order.customer?.name} ({order.customer?.phone}) • {order.state}
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Direct Actions Toolbar */}
          <div className="p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#5B675E] block">Dial Customer Phone:</span>
              <a
                href={`tel:${order.customer?.phone}`}
                className="font-mono font-bold text-sm text-[#146B4E] hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {order.customer?.phone}
              </a>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="px-3 py-1.5 rounded-[6px] bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </button>
          </div>

          {/* Outcome Selector */}
          <div>
            <label className="block text-xs font-bold text-[#12231C] mb-1.5 font-heading">
              Select Call Outcome
            </label>
            <div className="space-y-1.5">
              {CALL_OUTCOMES.map(item => (
                <div
                  key={item.outcome}
                  onClick={() => {
                    setSelectedOutcome(item.outcome);
                    if (item.outcome === 'Customer Requested Call Back') {
                      setScheduleFollowUp(true);
                    }
                  }}
                  className={`p-2.5 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                    selectedOutcome === item.outcome
                      ? 'border-[#146B4E] bg-[#E3F0E9]/50 ring-1 ring-[#146B4E]'
                      : 'border-[#E2E5DD] bg-white hover:border-[#146B4E]/40'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#12231C] flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedOutcome === item.outcome ? 'bg-[#146B4E]' : 'bg-gray-300'}`} />
                      {item.label}
                    </div>
                    <span className="text-[10px] text-[#5B675E] ml-3.5 block">{item.desc}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${item.color}`}>
                    {item.outcome === 'Answered & Confirmed' ? 'Auto-Confirm' : item.outcome.slice(0, 15)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold text-[#12231C] mb-1 font-heading">
              Call Notes / Customer Comments
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Customer requested delivery on Saturday morning. Confirmed Landmark: Opposite St. Mary Church."
              className="w-full p-2.5 rounded-[6px] border border-[#E2E5DD] bg-white text-xs focus:outline-none focus:border-[#146B4E]"
            />
          </div>

          {/* Schedule Follow-up toggle */}
          <div className="p-3 rounded-[8px] bg-[#EEF0E8]/60 border border-[#E2E5DD] space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#12231C]">
                <input
                  type="checkbox"
                  checked={scheduleFollowUp}
                  onChange={e => setScheduleFollowUp(e.target.checked)}
                  className="rounded text-[#146B4E] focus:ring-[#146B4E]"
                />
                <span>Schedule Automatic Follow-Up Reminder</span>
              </label>
              <Calendar className="w-3.5 h-3.5 text-[#5B675E]" />
            </div>

            {scheduleFollowUp && (
              <div className="pt-1">
                <span className="text-[10px] text-[#5B675E] block mb-1">Follow-up Date & Time</span>
                <input
                  type="datetime-local"
                  value={followUpTime}
                  onChange={e => setFollowUpTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[#E2E5DD] bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFBF9] border-t border-[#E2E5DD] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] border border-[#E2E5DD] bg-white text-xs font-semibold text-[#12231C] hover:bg-[#EEF0E8]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSaveCall}
            className="px-5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Call Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
