import React, { useState } from 'react';
import { X, CheckCircle2, ShoppingBag, Truck, ShieldCheck, Phone, MapPin, User, ArrowRight, ExternalLink } from 'lucide-react';
import { Product, RoundRobinState } from '../types';

interface PublicOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  roundRobinState: RoundRobinState | null;
  onSubmitOrder: (payload: any) => Promise<any>;
  onToast: (msg: string) => void;
}

export const PublicOrderFormModal: React.FC<PublicOrderFormModalProps> = ({
  isOpen,
  onClose,
  products,
  roundRobinState,
  onSubmitOrder,
  onToast,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products?.[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [state, setState] = useState<string>('Lagos');
  const [loading, setLoading] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const selectedProduct = products?.find(p => p.id === selectedProductId) || products?.[0];
  const totalPrice = selectedProduct ? selectedProduct.sellingPrice * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      onToast('Please fill all required customer contact details');
      return;
    }

    setLoading(true);
    try {
      const res = await onSubmitOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerAddress: address,
        customerState: state,
        productId: selectedProduct?.id || selectedProductId,
        quantity,
        source: 'embedded_form',
      });
      setSuccessResult(res.order);
      onToast(`Order created and auto-assigned to ${res.order.assignedRep?.name || 'sales rep'}!`);
    } catch (err: any) {
      onToast(err.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[14px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header banner */}
        <div className="px-6 py-4 bg-[#12231C] text-white flex items-center justify-between border-b border-[#1e382d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#146B4E] flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-white">
                  Public Checkout / Embedded Form
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#146B4E] text-[#E3F0E9] font-bold">
                  LIVE DEMO
                </span>
              </div>
              <p className="text-[11px] text-[#D9CDA9]/80 font-sans">
                Customer-facing COD checkout simulator with instant Round-Robin routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-[6px] hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {successResult ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-[#E3F0E9] text-[#146B4E] flex items-center justify-center mx-auto border-2 border-[#146B4E]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-lg text-[#12231C]">
                  Order Placed Successfully!
                </h4>
                <p className="text-xs text-[#5B675E] mt-1">
                  Your Cash on Delivery order has been registered in the system.
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-[#FAFBF9] border border-[#E2E5DD] max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#EEF0E8]">
                  <span className="text-[#5B675E]">Order Number:</span>
                  <span className="font-mono font-bold text-[#146B4E]">{successResult.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B675E]">Customer:</span>
                  <span className="font-medium text-[#12231C]">{successResult.customer?.name} ({successResult.customer?.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B675E]">Product:</span>
                  <span className="font-medium text-[#12231C]">{selectedProduct?.name} (x{quantity})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B675E]">Amount Due:</span>
                  <span className="font-mono font-bold text-[#12231C]">₦{Number(successResult.totalAmount).toLocaleString()} (COD)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#EEF0E8]">
                  <span className="text-[#5B675E]">Assigned Rep:</span>
                  <span className="font-semibold text-[#146B4E] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#146B4E]"></span>
                    {successResult.assignedRep?.name || 'Pool Staff'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-[6px] border border-[#E2E5DD] bg-white text-xs font-semibold text-[#12231C] hover:bg-[#EEF0E8]"
                >
                  Submit Another Order
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-[6px] bg-[#146B4E] text-white text-xs font-semibold hover:bg-[#0f553e]"
                >
                  Close & View in Ledger
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#12231C] mb-1.5 font-heading">
                  1. Select Product Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {products.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-3 rounded-[8px] border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedProductId === p.id
                          ? 'border-[#146B4E] bg-[#E3F0E9]/40 ring-1 ring-[#146B4E]'
                          : 'border-[#E2E5DD] bg-white hover:border-[#146B4E]/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-[#12231C] leading-snug">{p.name}</span>
                        {selectedProductId === p.id && (
                          <span className="w-2 h-2 rounded-full bg-[#146B4E]"></span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#EEF0E8]/80">
                        <span className="text-[10px] font-mono text-[#5B675E]">SKU: {p.sku}</span>
                        <span className="text-xs font-mono font-bold text-[#146B4E]">
                          ₦{p.sellingPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD]">
                <div>
                  <span className="text-xs font-semibold text-[#12231C] block font-heading">Quantity</span>
                  <span className="text-[11px] text-[#5B675E]">Free delivery nationwide</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-[6px] border border-[#E2E5DD] bg-white font-bold text-xs hover:bg-[#EEF0E8]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-[6px] border border-[#E2E5DD] bg-white font-bold text-xs hover:bg-[#EEF0E8]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-semibold text-[#12231C] font-heading">
                  2. Delivery Address (Payment on Delivery)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#5B675E] block mb-1">Full Name *</span>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-[#5B675E]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tunde Balogun"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white focus:outline-none focus:border-[#146B4E]"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#5B675E] block mb-1">WhatsApp / Phone Number *</span>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-[#5B675E]" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0803 123 4567"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white focus:outline-none focus:border-[#146B4E]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#5B675E] block mb-1">Street Address for Courier Delivery *</span>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-[#5B675E]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 4, Block B, 14 Admiralty Way, Lekki Phase 1"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white focus:outline-none focus:border-[#146B4E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#5B675E] block mb-1">State *</span>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white focus:outline-none focus:border-[#146B4E]"
                    >
                      {['Lagos', 'Abuja', 'Oyo', 'Rivers', 'Anambra', 'Kano', 'Kaduna', 'Enugu', 'Delta', 'Edo', 'Ogun'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5B675E] block mb-1">Email (Optional)</span>
                    <input
                      type="email"
                      placeholder="tunde@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-white focus:outline-none focus:border-[#146B4E]"
                    />
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="p-3 rounded-[8px] bg-[#EEF0E8]/50 border border-[#E2E5DD] flex items-center justify-between text-[11px] text-[#5B675E]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#146B4E]" />
                  <span>Payment on Delivery (COD)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#146B4E]" />
                  <span>24-48h Nationwide Dispatch</span>
                </div>
              </div>

              {/* Next Round-Robin Rep note */}
              <div className="text-[10px] text-[#5B675E] flex items-center justify-between px-1">
                <span>System Engine:</span>
                <span className="font-mono">
                  Will route to: <strong className="text-[#146B4E]">{roundRobinState?.nextRep?.name || 'Next Active Rep'}</strong>
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-[8px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>CONFIRM ORDER & PAY ON DELIVERY (₦{totalPrice.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
