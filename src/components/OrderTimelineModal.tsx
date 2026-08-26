import React from 'react';
import { X } from 'lucide-react';
import { Order } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';
import { StatusPill } from './StatusPill';

interface OrderTimelineModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderTimelineModal: React.FC<OrderTimelineModalProps> = ({
  order,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#12231C] font-mono">
                {order.orderNumber}
              </h3>
              <StatusPill status={order.status} size="sm" />
            </div>
            <p className="text-xs text-[#5B675E] mt-0.5">
              Order Timeline & Activity Log
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary Snapshot */}
        <div className="p-4 bg-[#FAFBF9] border-b border-[#EEF0E8] grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#5B675E] text-[10px] block uppercase tracking-wider font-semibold font-heading">Customer:</span>
            <span className="font-medium text-[#12231C]">{order.customer?.name}</span>
            <span className="font-mono text-[#5B675E] block text-[11px]">{order.customer?.phone}</span>
          </div>
          <div className="text-right">
            <span className="text-[#5B675E] text-[10px] block uppercase tracking-wider font-semibold font-heading">Order Total:</span>
            <span className="font-mono font-bold text-[#146B4E] text-sm">
              {formatCurrency(order.totalAmount)}
            </span>
            <span className="text-[10px] text-[#5B675E] block">
              Assigned: {order.assignedRep?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Timeline Events from order_status_history */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] font-heading mb-2">
            Status & Assignment History
          </div>

          {order.statusHistory && order.statusHistory.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EEF0E8]">
              {order.statusHistory.map((entry, idx) => (
                <div key={entry.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#FFFFFF] border-2 border-[#146B4E] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#146B4E]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <StatusPill status={entry.status} size="sm" />
                        <span className="font-medium text-[#12231C]">
                          {entry.changedBy?.name ? `by ${entry.changedBy.name}` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#5B675E]">
                        {formatDate(entry.changedAt)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-xs text-[#12231C] bg-[#EEF0E8]/70 p-2 rounded-[6px] border border-[#E2E5DD]">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[#5B675E] text-xs">
              No status changes recorded yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#EEF0E8] bg-[#FAFBF9] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[6px] border border-[#E2E5DD] bg-[#FFFFFF] hover:bg-[#EEF0E8] text-xs font-semibold text-[#12231C] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
