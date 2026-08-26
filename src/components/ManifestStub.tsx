import React from 'react';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatShortDate, getRepInitials } from '../utils/formatters';

interface ManifestStubProps {
  id?: string;
  order: Order;
  onClick?: () => void;
  onReassign?: () => void;
  onStatusClick?: () => void;
}

export const ManifestStub: React.FC<ManifestStubProps> = ({
  id,
  order,
  onClick,
  onReassign,
  onStatusClick,
}) => {
  const getStampColor = (status: OrderStatus | string) => {
    switch (status) {
      case 'New':
        return 'text-[#5B675E] border-[#5B675E]';
      case 'Confirmed':
        return 'text-[#2F5FA8] border-[#2F5FA8]';
      case 'Dispatched':
        return 'text-[#B9822A] border-[#B9822A]';
      case 'Delivered':
        return 'text-[#146B4E] border-[#146B4E]';
      case 'Cancelled':
        return 'text-[#B33A3A] border-[#B33A3A]';
      default:
        return 'text-[#5B675E] border-[#5B675E]';
    }
  };

  const firstItem = order.items?.[0];
  const itemCount = order.items?.length || 0;

  return (
    <div
      id={id}
      onClick={onClick}
      className="group relative bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] overflow-hidden flex flex-col md:flex-row transition-all hover:border-[#146B4E]/40 cursor-pointer"
    >
      {/* Left / Main Stub Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Header row: Order # & Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-[#5B675E] tracking-tight">
              {order.orderNumber}
            </span>
            <span className="font-mono text-[11px] text-[#5B675E]">
              {formatShortDate(order.createdAt)}
            </span>
          </div>

          {/* Core Large Mono Amount */}
          <div className="mb-2">
            <div className="font-mono text-xl font-bold text-[#12231C] tracking-tight">
              {formatCurrency(order.totalAmount)}
            </div>
            <div className="text-xs text-[#5B675E] mt-0.5">
              {firstItem ? (
                <span>
                  {firstItem.qty}x {firstItem.product?.name || 'Item'}
                  {itemCount > 1 && ` (+${itemCount - 1} more)`}
                </span>
              ) : (
                'General Order'
              )}
            </div>
          </div>
        </div>

        {/* Customer & Rep Footer */}
        <div className="pt-2 border-t border-[#EEF0E8] flex items-center justify-between text-xs text-[#12231C]">
          <div className="truncate max-w-[160px]">
            <span className="font-medium text-[#12231C]">{order.customer?.name || 'Customer'}</span>
            <span className="font-mono text-[11px] text-[#5B675E] block truncate">
              {order.customer?.phone}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[#5B675E] tracking-wider block">
              Assigned Rep
            </span>
            <span className="font-medium text-[#12231C] text-xs">
              {order.assignedRep?.name || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashed Kraft Perforation Line */}
      <div className="hidden md:block w-px border-r-2 border-dashed border-[#D9CDA9] my-2" />
      <div className="block md:hidden h-px border-b-2 border-dashed border-[#D9CDA9] mx-4" />

      {/* Right / Stamp Corner (Signature Manifest Element) */}
      <div
        className="w-full md:w-32 bg-[#FAFBF9] p-3 flex flex-col items-center justify-center relative overflow-hidden"
        onClick={e => {
          if (onStatusClick) {
            e.stopPropagation();
            onStatusClick();
          }
        }}
      >
        {/* Physical Dispatch Stamp (Rotated -6deg, dotted circular border, mono text) */}
        <div
          className={`transform -rotate-6 border-2 border-dotted rounded-full p-2.5 w-20 h-20 flex flex-col items-center justify-center text-center shadow-xs transition-transform group-hover:scale-105 ${getStampColor(
            order.status
          )}`}
        >
          <span className="font-mono text-[9px] uppercase tracking-widest leading-none font-semibold">
            DISPATCH
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider my-0.5 leading-tight">
            {order.status}
          </span>
          <span className="font-mono text-[8px] opacity-75">
            WAYBILL
          </span>
        </div>
      </div>
    </div>
  );
};
