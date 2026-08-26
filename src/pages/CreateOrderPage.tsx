import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Mail,
  Package,
} from 'lucide-react';
import { Product, CreateOrderPayload, RoundRobinState, Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ManifestStub } from '../components/ManifestStub';

interface CreateOrderPageProps {
  products: Product[];
  roundRobinState: RoundRobinState | null;
  onCreateOrder: (payload: CreateOrderPayload) => Promise<{ order: Order; message: string }>;
  onViewOrders: () => void;
  onRefreshData: () => void;
}

export const CreateOrderPage: React.FC<CreateOrderPageProps> = ({
  products,
  roundRobinState,
  onCreateOrder,
  onViewOrders,
  onRefreshData,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [source, setSource] = useState('manual_form');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Set default product if none selected
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      const inStock = products.find(p => p.stockQty > 0) || products[0];
      if (inStock?.id) {
        setSelectedProductId(inStock.id);
      }
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const unitPrice = selectedProduct ? selectedProduct.sellingPrice : 0;
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = selectedProduct ? selectedProduct.stockQty <= 0 : false;
  const isOverStock = selectedProduct ? quantity > selectedProduct.stockQty : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Customer phone number is required.');
      return;
    }
    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (isOverStock) {
      setError(`Cannot create order: only ${selectedProduct?.stockQty} units available in stock.`);
      return;
    }

    setLoading(true);
    try {
      const res = await onCreateOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        productId: selectedProductId,
        quantity,
        source,
      });

      setCreatedOrder(res.order);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setQuantity(1);
    } catch (err: any) {
      setError(err.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedOrder(null);
    onRefreshData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Confirmation Card with Manifest Stub */}
      {createdOrder ? (
        <div className="bg-[#FFFFFF] border border-[#146B4E] rounded-[10px] p-6 space-y-6">
          <div className="flex items-center gap-3 text-[#146B4E]">
            <div className="w-8 h-8 rounded-[6px] bg-[#E3F0E9] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#146B4E]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#12231C] font-heading">
                Order {createdOrder.orderNumber} Created Successfully
              </h2>
              <p className="text-xs text-[#5B675E]">
                Customer profile recorded, stock deducted, and sales rep assigned via Round-Robin.
              </p>
            </div>
          </div>

          {/* Manifest Stub preview of the created order */}
          <div className="max-w-md mx-auto">
            <ManifestStub order={createdOrder} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-[#EEF0E8]">
            <button
              id="btn-create-another-order"
              onClick={handleCreateAnother}
              className="w-full sm:w-auto px-4 py-2 rounded-[6px] border border-[#E2E5DD] bg-[#FFFFFF] hover:bg-[#EEF0E8] text-xs font-semibold text-[#12231C] transition-colors"
            >
              Create another order
            </button>
            <button
              id="btn-view-orders-list"
              onClick={onViewOrders}
              className="w-full sm:w-auto px-4 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
            >
              <span>View ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Round-Robin Next Rep Notice */}
          <div className="p-3.5 rounded-[10px] bg-[#E3F0E9] border border-[#C5DFD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[6px] bg-[#146B4E] text-white shrink-0">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#146B4E] font-heading">
                    Round-Robin Dispatch
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-[#146B4E] text-white">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#12231C] mt-0.5">
                  Submitting will assign this order to{' '}
                  <strong className="font-bold text-[#146B4E] font-mono">
                    {roundRobinState?.nextRep?.name || 'Active Sales Rep'}
                  </strong>{' '}
                  and cycle the dispatch queue.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#5B675E] block font-heading uppercase">
                Last Assigned:
              </span>
              <span className="text-xs font-medium text-[#12231C] font-mono">
                {roundRobinState?.lastAssignedRep?.name || 'None'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-[6px] bg-[#F8E7E5] border border-[#B33A3A]/30 text-[#B33A3A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Customer Details */}
            <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] p-5 space-y-4">
              <div className="border-b border-[#EEF0E8] pb-3 flex items-center gap-2 text-[#12231C]">
                <User className="w-4 h-4 text-[#146B4E]" />
                <h3 className="text-sm font-bold tracking-tight font-heading">
                  1. Customer Details
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                  Customer full name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-order-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Amaka Nnamani"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                  Phone number (Required for POD) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-order-customer-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                  Email address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-order-customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="e.g. amaka@example.com"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                  Delivery address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#5B675E] absolute left-3 top-2.5" />
                  <textarea
                    id="input-order-customer-address"
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="e.g. 15 Allen Avenue, Ikeja, Lagos"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Product & Quantity */}
            <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-[#EEF0E8] pb-3 flex items-center gap-2 text-[#12231C]">
                  <Package className="w-4 h-4 text-[#146B4E]" />
                  <h3 className="text-sm font-bold tracking-tight font-heading">
                    2. Product & Quantity
                  </h3>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Select product *
                  </label>
                  <select
                    id="select-order-product"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] px-3 py-2 text-xs text-[#12231C] outline-none font-sans"
                  >
                    {products.map(prod => (
                      <option
                        key={prod.id}
                        value={prod.id}
                        disabled={prod.stockQty <= 0}
                      >
                        {prod.name} — {formatCurrency(prod.sellingPrice, prod.currency)} ({prod.stockQty} in stock) {prod.stockQty <= 0 ? ' [OUT OF STOCK]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                      Quantity *
                    </label>
                    <input
                      id="input-order-quantity"
                      type="number"
                      min="1"
                      max={selectedProduct ? selectedProduct.stockQty : 999}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] px-3 py-2 text-xs text-[#12231C] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                      Order source
                    </label>
                    <select
                      value={source}
                      onChange={e => setSource(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] px-3 py-2 text-xs text-[#12231C] outline-none"
                    >
                      <option value="manual_form">Manual rep entry</option>
                      <option value="whatsapp_pod">WhatsApp POD</option>
                      <option value="facebook_ad">Facebook campaign</option>
                      <option value="tiktok_ad">TikTok campaign</option>
                    </select>
                  </div>
                </div>

                {/* Stock feedback */}
                {selectedProduct && (
                  <div
                    className={`p-2.5 rounded-[6px] border text-xs flex items-center justify-between ${
                      isOutOfStock
                        ? 'bg-[#F8E7E5] border-[#B33A3A]/30 text-[#B33A3A]'
                        : selectedProduct.stockQty <= selectedProduct.lowStockThreshold
                        ? 'bg-[#F6ECD8] border-[#B9822A]/30 text-[#B9822A]'
                        : 'bg-[#EEF0E8]/50 border-[#E2E5DD] text-[#5B675E]'
                    }`}
                  >
                    <span>Warehouse inventory:</span>
                    <span className="font-mono font-bold">
                      {selectedProduct.stockQty} units remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Order total */}
              <div className="mt-4 p-3 rounded-[6px] bg-[#EEF0E8]/40 border border-[#E2E5DD] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#5B675E]">
                  <span>Unit price:</span>
                  <span className="font-mono">{formatCurrency(unitPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5B675E]">
                  <span>Quantity:</span>
                  <span className="font-mono">× {quantity}</span>
                </div>
                <div className="border-t border-[#E2E5DD] pt-1.5 flex items-center justify-between text-sm font-bold text-[#12231C]">
                  <span className="font-heading">Total payable:</span>
                  <span className="font-mono text-[#146B4E] text-base">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Submission */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-submit-order"
              type="submit"
              disabled={loading || isOutOfStock || isOverStock}
              className="px-5 py-2.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white font-semibold text-xs shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span>Submitting & dispatching...</span>
              ) : (
                <span>Create order</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
