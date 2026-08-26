import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Tag,
  CreditCard,
  Building2,
  Lock,
  Flame,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { CustomForm, FormField, Product } from '../../types';
import { api } from '../../services/api';

interface LiveCheckoutPreviewProps {
  form: CustomForm;
  products?: Product[];
  onClose?: () => void;
  onOrderCreated?: (order: any, logs: any[]) => void;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

export const LiveCheckoutPreview: React.FC<LiveCheckoutPreviewProps> = ({
  form,
  products = [],
  onClose,
  onOrderCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: 'Adewale Adeleke',
    phone: '0803 456 7890',
    altPhone: '',
    state: 'Lagos',
    address: 'Block 4, Flat 2, 1004 Estate, Victoria Island',
    deliveryTime: 'Morning (9:00 AM - 1:00 PM)',
    quantity: 1,
    selectedTierId: '',
    bumpAccepted: false,
    upsellAccepted: false,
    couponCode: '',
    paymentMethod: 'COD',
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'fixed' | 'percentage' } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [timerSeconds, setTimerSeconds] = useState((form.theme?.timerMinutes || 15) * 60);

  const product = products.find(p => p.id === form.productId) || products[0] || {
    id: 'prd-1',
    name: 'Stekent Premium Item',
    sellingPrice: 42000,
    costPrice: 20000,
    sku: 'STEK-01',
    currency: 'NGN',
    stockQty: 100,
    lowStockThreshold: 10,
    reservedQty: 5,
    createdAt: new Date().toISOString(),
  };

  // Find blocks
  const qtyTierField = form.fields?.find(f => f.type === 'quantity_tiers');
  const orderBumpField = form.fields?.find(f => f.type === 'order_bump');
  const upsellField = form.fields?.find(f => f.type === 'upsell_modal');

  // Initialize selected tier
  useEffect(() => {
    if (qtyTierField?.quantityTiers && qtyTierField.quantityTiers.length > 0) {
      const popTier = qtyTierField.quantityTiers.find(t => t.isPopular) || qtyTierField.quantityTiers[0];
      setFormData(prev => ({
        ...prev,
        selectedTierId: popTier.id,
        quantity: popTier.quantity,
      }));
    }
  }, [qtyTierField]);

  // Urgency Timer Countdown
  useEffect(() => {
    if (!form.theme?.showUrgencyTimer) return;
    const interval = setInterval(() => {
      setTimerSeconds(sec => (sec > 0 ? sec - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [form.theme?.showUrgencyTimer]);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  // Price Calculation
  let basePrice = product.sellingPrice;
  let currentQty = formData.quantity || 1;

  if (formData.selectedTierId && qtyTierField?.quantityTiers) {
    const tier = qtyTierField.quantityTiers.find(t => t.id === formData.selectedTierId);
    if (tier && tier.fixedPrice) {
      basePrice = tier.fixedPrice;
      currentQty = tier.quantity;
    } else {
      basePrice = product.sellingPrice * currentQty;
    }
  } else {
    basePrice = product.sellingPrice * currentQty;
  }

  const bumpPrice = formData.bumpAccepted && orderBumpField?.orderBump?.enabled ? (orderBumpField.orderBump.price || 0) : 0;
  const upsellPrice = formData.upsellAccepted && upsellField?.upsell?.enabled ? (upsellField.upsell.price || 0) : 0;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((basePrice * appliedCoupon.discount) / 100);
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }

  const totalPayable = Math.max(0, basePrice + bumpPrice + upsellPrice - discountAmount);

  // Apply Coupon Handler
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponInput.trim()) return;
    const found = form.coupons?.find(c => c.active && c.code.trim().toUpperCase() === couponInput.trim().toUpperCase());
    if (found) {
      setAppliedCoupon({ code: found.code, discount: found.discountValue, type: found.type });
      setFormData(prev => ({ ...prev, couponCode: found.code }));
    } else {
      setCouponError('Invalid or expired promo code');
    }
  };

  // Submit Handler
  const handleSubmitOrder = async (overrideUpsell?: boolean) => {
    // If form has upsell enabled and it wasn't prompted yet, show modal first
    if (upsellField?.upsell?.enabled && !showUpsellModal && overrideUpsell === undefined) {
      setShowUpsellModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        formId: form.id,
        customerName: formData.fullName || 'Stekent Direct Buyer',
        customerPhone: formData.phone || '08030000000',
        customerAddress: formData.address || 'Lagos, Nigeria',
        customerState: formData.state || 'Lagos',
        productId: product.id,
        quantity: currentQty,
        selectedTierId: formData.selectedTierId,
        bumpAccepted: formData.bumpAccepted,
        bumpPrice,
        upsellAccepted: overrideUpsell !== undefined ? overrideUpsell : formData.upsellAccepted,
        upsellPrice: (overrideUpsell || formData.upsellAccepted) ? (upsellField?.upsell?.price || 0) : 0,
        couponCode: appliedCoupon?.code,
        discountAmount,
        paymentMethod: formData.paymentMethod || 'COD',
        utm_source: 'live_preview_funnel',
        utm_campaign: 'high_conversion_checkout',
      };

      const res = await api.submitForm(form.id, payload as any);
      setSubmittedOrder(res.order);
      setExecutionLogs(res.executionLogs || []);
      if (onOrderCreated) {
        onOrderCreated(res.order, res.executionLogs || []);
      }
    } catch (err: any) {
      alert(`Submission Error: ${err.message || 'Could not place order'}`);
    } finally {
      setIsSubmitting(false);
      setShowUpsellModal(false);
    }
  };

  const isMultiStep = form.stepType === 'multi_step';
  const totalSteps = isMultiStep ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative w-full max-w-2xl bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        style={{
          borderRadius:
            form.theme?.borderRadius === 'none'
              ? '0px'
              : form.theme?.borderRadius === 'small'
              ? '8px'
              : form.theme?.borderRadius === 'large'
              ? '24px'
              : '16px',
        }}
      >
        {/* Top Header Bar */}
        <div
          className="px-5 py-3.5 flex items-center justify-between text-white"
          style={{ backgroundColor: form.theme?.primaryColor || '#146B4E' }}
        >
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-semibold text-sm sm:text-base truncate max-w-md">{form.name}</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Urgency Header Banner */}
        {form.theme?.showUrgencyTimer && !submittedOrder && (
          <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm flex items-center justify-center space-x-2 animate-pulse">
            <Clock className="w-4 h-4" />
            <span>⚡ LIMITED SPECIAL OFFER ENDS IN:</span>
            <span className="font-mono bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-xs">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            {form.theme?.showStockCounter && (
              <span className="hidden sm:inline bg-red-600 text-white px-2 py-0.5 rounded text-xs ml-2">
                Only {form.theme.stockLeft || 7} Units Left in Stock!
              </span>
            )}
          </div>
        )}

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {submittedOrder ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Order Successfully Placed
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-3">Thank You, {formData.fullName}!</h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto mt-1">
                  Your Cash on Delivery order <strong className="text-slate-900">#{submittedOrder.orderNumber}</strong> has been logged. Our dispatch team is preparing your package.
                </p>
              </div>

              {/* Order Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm space-y-3 max-w-lg mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Product:</span>
                  <span className="font-medium text-slate-900">{currentQty}x {product.name}</span>
                </div>
                {formData.bumpAccepted && (
                  <div className="flex justify-between text-emerald-700 text-xs border-b border-slate-200 pb-2">
                    <span>+ VIP Warranty & Priority Cable:</span>
                    <span>+₦{bumpPrice.toLocaleString()}</span>
                  </div>
                )}
                {formData.upsellAccepted && (
                  <div className="flex justify-between text-purple-700 text-xs border-b border-slate-200 pb-2">
                    <span>+ VIP Wireless Power Bank Addon:</span>
                    <span>+₦{upsellPrice.toLocaleString()}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 text-xs border-b border-slate-200 pb-2">
                    <span>Promo Code ({appliedCoupon.code}):</span>
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                  <span>Total Amount Due on Delivery:</span>
                  <span className="text-emerald-700">₦{submittedOrder.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
                  <p><strong>Delivery Destination:</strong> {formData.address}, {formData.state}</p>
                  <p><strong>Contact Phone:</strong> {formData.phone}</p>
                  <p><strong>Payment Method:</strong> {formData.paymentMethod === 'COD' ? 'Pay Cash/Transfer on Delivery' : formData.paymentMethod}</p>
                </div>
              </div>

              {/* Automation Engine Feedback Pills */}
              {executionLogs && executionLogs.length > 0 && (
                <div className="bg-slate-900 text-white rounded-xl p-4 text-left max-w-lg mx-auto text-xs space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ Automation Engine Triggered ({executionLogs.length} Workflows)</span>
                  </div>
                  {executionLogs.map(log => (
                    <div key={log.id} className="space-y-1.5">
                      <div className="font-medium text-slate-200">{log.workflowName}</div>
                      <div className="space-y-1 pl-2 border-l-2 border-emerald-500">
                        {log.actionDetails?.map((action: any, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2 text-slate-300 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="font-semibold text-emerald-300">{action.actionName}:</span>
                            <span className="truncate text-slate-400">{action.output}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmittedOrder(null);
                    setCurrentStep(1);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors"
                >
                  Test Another Submission
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE FORM ENTRY */
            <div className="space-y-5">
              {/* Multi-Step Stepper Header */}
              {isMultiStep && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep === 1
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      1
                    </div>
                    <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                      Customer & Address
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-slate-200 mx-3" />

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep === 2
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      2
                    </div>
                    <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                      Package & Payment
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 1: CUSTOMER CONTACT & DELIVERY ADDRESS */}
              {(currentStep === 1 || !isMultiStep) && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-900">
                    <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <strong className="block font-semibold">FREE Nationwide Express Delivery</strong>
                      <span>Pay only when our delivery rider physically brings your package to your doorstep.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Adebayo Johnson"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Active Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 0803 222 3344"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Delivery State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50 focus:bg-white"
                      >
                        {NIGERIAN_STATES.map(st => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Alternative Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.altPhone}
                        onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                        placeholder="e.g. 0812 345 6789"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Street Address & Landmark <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. House 12, Close 5, Opposite First Bank, Wuse 2"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  {isMultiStep && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full py-3.5 px-6 font-bold text-white text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:opacity-95 transition-opacity"
                        style={{ backgroundColor: form.theme?.primaryColor || '#146B4E' }}
                      >
                        <span>CONTINUE TO PACKAGE SELECTION</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: QUANTITY TIERS, ORDER BUMP, COUPON & PAYMENT */}
              {(currentStep === 2 || !isMultiStep) && (
                <div className="space-y-5">
                  {/* QUANTITY TIERS SELECTION */}
                  {qtyTierField?.quantityTiers && qtyTierField.quantityTiers.length > 0 && (
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
                        <span>Choose Your Package (Bulk Savings):</span>
                        <span className="text-emerald-700 font-semibold lowercase">free shipping included</span>
                      </label>

                      <div className="grid grid-cols-1 gap-2.5">
                        {qtyTierField.quantityTiers.map(tier => {
                          const isSelected = formData.selectedTierId === tier.id;
                          return (
                            <div
                              key={tier.id}
                              onClick={() => setFormData({ ...formData, selectedTierId: tier.id, quantity: tier.quantity })}
                              className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                                    <span>{tier.label}</span>
                                    {tier.badge && (
                                      <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                        {tier.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Qty: {tier.quantity} {tier.quantity > 1 ? 'Units' : 'Unit'}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-base font-extrabold text-slate-900">
                                  ₦{(tier.fixedPrice || product.sellingPrice * tier.quantity).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 1-CLICK ORDER BUMP */}
                  {orderBumpField?.orderBump?.enabled && (
                    <div
                      onClick={() => setFormData({ ...formData, bumpAccepted: !formData.bumpAccepted })}
                      className={`relative p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        formData.bumpAccepted
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-500'
                          : 'border-amber-400 bg-amber-50/40 hover:bg-amber-50/80'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.bumpAccepted}
                          onChange={() => {}} // handled by parent div
                          className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                              {orderBumpField.orderBump.highlightText || 'SPECIAL ONE-TIME OFFER'}
                            </span>
                            <span className="text-sm font-bold text-emerald-700">
                              +₦{orderBumpField.orderBump.price.toLocaleString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">
                            {orderBumpField.orderBump.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {orderBumpField.orderBump.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COUPON CODE FIELD */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value)}
                          placeholder="Promo / Coupon Code (e.g. STEKENT10)"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span>Coupon applied: <strong>{appliedCoupon.code}</strong> (-₦{discountAmount.toLocaleString()})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponInput('');
                          }}
                          className="text-slate-500 hover:text-slate-800 underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PAYMENT METHOD CHOICES */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase">
                      Select Payment Method:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {form.paymentOptions?.allowCOD && (
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                          className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-3 ${
                            formData.paymentMethod === 'COD'
                              ? 'border-emerald-600 bg-emerald-50/50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <Truck className="w-5 h-5 text-emerald-700" />
                          <div>
                            <div className="font-bold text-xs text-slate-900">Pay on Delivery (COD)</div>
                            <div className="text-[11px] text-slate-500">Cash or Transfer to Rider</div>
                          </div>
                        </div>
                      )}

                      {form.paymentOptions?.allowBankTransfer && (
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'Bank Transfer' })}
                          className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-3 ${
                            formData.paymentMethod === 'Bank Transfer'
                              ? 'border-emerald-600 bg-emerald-50/50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <Building2 className="w-5 h-5 text-emerald-700" />
                          <div>
                            <div className="font-bold text-xs text-slate-900">Direct Bank Transfer</div>
                            <div className="text-[11px] text-slate-500">Instant Zenith Bank Account</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BANK TRANSFER DETAILS BOX IF SELECTED */}
                  {formData.paymentMethod === 'Bank Transfer' && form.paymentOptions?.bankDetails && (
                    <div className="bg-emerald-950 text-white p-4 rounded-xl text-xs space-y-1.5 border border-emerald-800">
                      <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                        Direct Company Bank Account:
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-300">Bank:</span>
                        <span className="font-bold">{form.paymentOptions.bankDetails.bankName || 'Zenith Bank PLC'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Account Number:</span>
                        <span className="font-mono font-bold text-emerald-300 text-sm tracking-wider">
                          {form.paymentOptions.bankDetails.accountNumber || '1018892019'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Account Name:</span>
                        <span className="font-medium">{form.paymentOptions.bankDetails.accountName || 'Stekent Global Direct Ltd'}</span>
                      </div>
                    </div>
                  )}

                  {/* LIVE PRICE BREAKDOWN BOX */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Package ({currentQty} item{currentQty > 1 ? 's' : ''}):</span>
                      <span className="font-medium">₦{basePrice.toLocaleString()}</span>
                    </div>
                    {formData.bumpAccepted && (
                      <div className="flex justify-between text-emerald-400">
                        <span>VIP Warranty Upgrade:</span>
                        <span>+₦{bumpPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Promo Code Discount:</span>
                        <span>-₦{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                      <span>Nationwide Doorstep Shipping:</span>
                      <span className="text-emerald-400 uppercase font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-white pt-1">
                      <span>Total to Pay:</span>
                      <span className="text-emerald-400 text-lg">₦{totalPayable.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* CTA ACTION BUTTON */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitOrder()}
                      className="w-full py-4 px-6 font-extrabold text-white text-base sm:text-lg rounded-xl shadow-xl hover:opacity-95 active:scale-[0.99] transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: form.theme?.primaryColor || '#146B4E' }}
                    >
                      <div className="flex items-center space-x-2">
                        {isSubmitting ? (
                          <span>PROCESSING YOUR ORDER...</span>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            <span>{form.theme?.buttonText || 'CONFIRM CASH ON DELIVERY ORDER'}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[11px] font-normal text-white/90">
                        {form.theme?.buttonSubtext || '⚡ Pay When Delivery Rider Brings Your Package'}
                      </span>
                    </button>

                    {isMultiStep && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Contact & Address Details</span>
                      </button>
                    )}
                  </div>

                  {/* TRUST BADGES */}
                  {form.theme?.showTrustBadges && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-600 font-medium">
                      <div className="flex flex-col items-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1" />
                        <span>100% Genuine Quality</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Truck className="w-4 h-4 text-emerald-700 mb-1" />
                        <span>24 - 48hr Swift Dispatch</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 mb-1" />
                        <span>Zero Risk COD Guarantee</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* POST-PURCHASE UPSELL MODAL OVERLAY */}
        {showUpsellModal && upsellField?.upsell?.enabled && (
          <div className="absolute inset-0 bg-slate-950/85 z-50 p-6 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-md text-center space-y-4 shadow-2xl border-4 border-purple-500">
              <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full">
                {upsellField.upsell.discountBadge || '50% OFF ONE-TIME VIP OFFER'}
              </span>

              <h3 className="text-xl font-bold text-slate-900">
                {upsellField.upsell.heading || 'Wait! Special Add-on Deal'}
              </h3>

              <p className="text-xs text-slate-600">
                {upsellField.upsell.subheading || 'Add this matching accessory to your package today for huge savings!'}
              </p>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>{upsellField.upsell.productName}</span>
                <div className="text-right">
                  <span className="line-through text-slate-400 text-xs mr-2">
                    ₦{upsellField.upsell.originalPrice?.toLocaleString()}
                  </span>
                  <span className="text-purple-700 text-base">
                    ₦{upsellField.upsell.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitOrder(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
                >
                  {upsellField.upsell.buttonText || `YES! Add to My Order (+₦${upsellField.upsell.price.toLocaleString()})`}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitOrder(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  {upsellField.upsell.skipText || 'No thanks, I will complete without this deal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
