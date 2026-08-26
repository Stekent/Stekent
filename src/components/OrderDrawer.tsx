import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  Package,
  UserCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RotateCw,
} from 'lucide-react';
import { Order, OrderStatus, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusPill } from './StatusPill';

interface OrderDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onReassignOrder: (orderId: string, newRepId: string) => Promise<void>;
  onToast: (msg: string) => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  order,
  isOpen,
  onClose,
  allUsers,
  onUpdateStatus,
  onReassignOrder,
  onToast,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [reassignRepId, setReassignRepId] = useState('');
  const [customNote, setCustomNote] = useState('');

  if (!order || !isOpen) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(
        order.id,
        newStatus,
        customNote ? customNote.trim() : `Status changed to ${newStatus}`
      );
      setCustomNote('');
      onToast(`Order ${order.orderNumber} updated to ${newStatus}`);
    } catch (err: any) {
      onToast(`Error updating status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReassign = async () => {
    if (!reassignRepId) return;
    setIsUpdating(true);
    try {
      await onReassignOrder(order.id, reassignRepId);
      const rep = allUsers.find(u => u.id === reassignRepId);
      onToast(`Order reassigned to ${rep?.name || 'new rep'}`);
      setReassignRepId('');
    } catch (err: any) {
      onToast(`Error reassigning: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const items = order.items || [];
  const primaryItem = items[0];

  return (
    <>
      {/* Background Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#12231C]/40 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* Drawer Container */}
      <aside
        id="order-drawer"
        className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#FFFFFF] border-l border-[#E2E5DD] shadow-2xl z-50 flex flex-col transition-transform duration-200 ease-out"
      >
        {/* Drawer Head */}
        <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[#12231C] px-2 py-1 rounded bg-[#EEF0E8] border border-[#E2E5DD]">
              {order.orderNumber}
            </span>
            <StatusPill status={order.status} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#12231C]">
          {/* Customer Overview */}
          <div className="p-3.5 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#12231C] font-heading">
                  {order.customer?.name || 'Customer'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-[#5B675E] text-xs">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#146B4E]" />
                    {order.customer?.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B9822A]" />
                    {order.state || order.customer?.state || 'Lagos'}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${order.customer?.phone}`}
                className="px-2.5 py-1 rounded-[6px] bg-[#E3F0E9] hover:bg-[#cbe3d4] text-[#146B4E] font-semibold text-[11px] flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>

            {order.customer?.address && (
              <p className="text-[11px] text-[#5B675E] border-t border-[#EEF0E8] pt-2">
                <strong className="text-[#12231C]">Address:</strong> {order.customer.address}
              </p>
            )}
          </div>

          {/* Product & Assignment Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[8px] border border-[#E2E5DD] bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] flex items-center gap-1">
                <Package className="w-3 h-3 text-[#146B4E]" /> Product Item
              </span>
              <p className="font-semibold text-sm text-[#12231C]">
                {primaryItem?.product?.name || 'Catalogue Item'}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-[#5B675E]">Qty: {primaryItem?.qty || 1}</span>
                <strong className="font-mono text-[#146B4E]">
                  {formatCurrency(order.totalAmount)}
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-[8px] border border-[#E2E5DD] bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#2F5FA8]" /> Sales Rep
              </span>
              <p className="font-semibold text-sm text-[#12231C]">
                {order.assignedRep?.name || 'Unassigned'}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-[#5B675E]">Delivery:</span>
                <span className="text-[#B9822A] font-medium font-mono">
                  {order.status === 'Delivered' ? 'Completed' : 'In Transit'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Action Buttons */}
          <div className="p-3.5 rounded-[8px] border border-[#E2E5DD] bg-[#FAFBF9] space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] font-heading block">
              Update Status Workflow
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                disabled={isUpdating || order.status === 'Confirmed'}
                onClick={() => handleStatusChange('Confirmed')}
                className={`px-2.5 py-1.5 rounded-[6px] border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  order.status === 'Confirmed'
                    ? 'bg-[#E3F0E9] border-[#146B4E] text-[#146B4E]'
                    : 'bg-white border-[#E2E5DD] text-[#12231C] hover:bg-[#EEF0E8]'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </button>
              <button
                disabled={isUpdating || order.status === 'Dispatched'}
                onClick={() => handleStatusChange('Dispatched')}
                className={`px-2.5 py-1.5 rounded-[6px] border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  order.status === 'Dispatched'
                    ? 'bg-[#EAF2FF] border-[#2F5FA8] text-[#2F5FA8]'
                    : 'bg-white border-[#E2E5DD] text-[#12231C] hover:bg-[#EEF0E8]'
                }`}
              >
                <Truck className="w-3 h-3" /> Dispatched
              </button>
              <button
                disabled={isUpdating || order.status === 'Delivered'}
                onClick={() => handleStatusChange('Delivered')}
                className={`px-2.5 py-1.5 rounded-[6px] border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  order.status === 'Delivered'
                    ? 'bg-[#E3F0E9] border-[#146B4E] text-[#146B4E]'
                    : 'bg-white border-[#E2E5DD] text-[#146B4E] hover:bg-[#E3F0E9]'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Delivered
              </button>
              <button
                disabled={isUpdating || order.status === 'Failed'}
                onClick={() => handleStatusChange('Failed')}
                className={`px-2.5 py-1.5 rounded-[6px] border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  order.status === 'Failed'
                    ? 'bg-[#F8E7E5] border-[#B33A3A] text-[#B33A3A]'
                    : 'bg-white border-[#E2E5DD] text-[#B33A3A] hover:bg-[#F8E7E5]'
                }`}
              >
                <AlertCircle className="w-3 h-3" /> Failed
              </button>
            </div>

            {/* Optional Note & Reassign */}
            <div className="pt-2 border-t border-[#EEF0E8] flex gap-2">
              <input
                type="text"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="Optional remark for timeline..."
                className="flex-1 bg-white border border-[#E2E5DD] rounded-[6px] px-2.5 py-1 text-xs outline-none focus:border-[#146B4E]"
              />
              <button
                onClick={() => handleStatusChange(order.status)}
                disabled={!customNote || isUpdating}
                className="px-2.5 py-1 bg-[#146B4E] text-white rounded-[6px] text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Add Note
              </button>
            </div>
          </div>

          {/* Reassign Sales Rep Form */}
          <div className="p-3.5 rounded-[8px] border border-[#E2E5DD] bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] font-heading block">
              Manual Reassign Sales Rep
            </span>
            <div className="flex items-center gap-2">
              <select
                value={reassignRepId}
                onChange={e => setReassignRepId(e.target.value)}
                className="flex-1 bg-white border border-[#E2E5DD] rounded-[6px] px-2.5 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
              >
                <option value="">Select new sales rep...</option>
                {allUsers
                  .filter(u => u.role === 'sales_rep' || u.role === 'admin')
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
              <button
                disabled={!reassignRepId || isUpdating}
                onClick={handleReassign}
                className="px-3 py-1.5 bg-[#12231C] hover:bg-[#1e382d] text-white rounded-[6px] text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Reassign
              </button>
            </div>
            <p className="text-[10px] text-[#5B675E]">
              Note: Manual reassignment does not affect the continuous round-robin counter.
            </p>
          </div>

          {/* Chronological Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B675E] font-heading mb-3 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Order Timeline & Logs
            </h3>
            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EEF0E8]">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#FFFFFF] border-2 border-[#146B4E]" />
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-[#12231C] font-semibold">{h.status}</strong>
                        <span className="text-[10px] font-mono text-[#5B675E]">
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5B675E] mt-0.5">{h.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#FFFFFF] border-2 border-[#146B4E]" />
                  <div>
                    <strong className="text-[#12231C]">Order received</strong>
                    <span className="text-[10px] font-mono text-[#5B675E] block">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-[#EEF0E8] bg-[#FAFBF9] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#5B675E]">
            Source: {order.source || 'Direct'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[6px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] text-xs font-semibold text-[#12231C] transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
};
