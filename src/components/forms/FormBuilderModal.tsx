import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Settings,
  Eye,
  Save,
  Layers,
  Palette,
  CreditCard,
  Radio,
  Sliders,
  Type,
  Phone,
  MapPin,
  List,
  CheckSquare,
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Tag,
  Share2,
  Copy,
  Check,
  Zap,
  Globe,
  ArrowRight,
  MoveUp,
  MoveDown,
  Building2,
} from 'lucide-react';
import { CustomForm, FormField, FormFieldType, Product, QuantityTier } from '../../types';
import { api } from '../../services/api';

interface FormBuilderModalProps {
  initialForm?: CustomForm | null;
  products?: Product[];
  onClose: () => void;
  onSaved: (form: CustomForm) => void;
  onOpenLivePreview?: (form: CustomForm) => void;
}

const FIELD_PALETTE_ITEMS: Array<{
  type: FormFieldType;
  label: string;
  category: 'core' | 'ecommerce' | 'conversion' | 'tracking';
  icon: any;
  defaultData: Partial<FormField>;
}> = [
  // Core Form Fields
  {
    type: 'text',
    label: 'Text Input',
    category: 'core',
    icon: Type,
    defaultData: { label: 'Customer Name', placeholder: 'Enter full name', required: true, step: 1 },
  },
  {
    type: 'phone',
    label: 'Phone / WhatsApp',
    category: 'core',
    icon: Phone,
    defaultData: { label: 'Active WhatsApp Phone Number', placeholder: '0803 123 4567', required: true, step: 1 },
  },
  {
    type: 'state_select',
    label: 'Nigerian State Dropdown',
    category: 'core',
    icon: MapPin,
    defaultData: { label: 'Delivery State', defaultValue: 'Lagos', required: true, step: 1 },
  },
  {
    type: 'address',
    label: 'Delivery Address',
    category: 'core',
    icon: MapPin,
    defaultData: { label: 'Delivery Address & Landmark', placeholder: 'House number, street name, nearest bus stop', required: true, step: 1 },
  },
  {
    type: 'dropdown',
    label: 'Dropdown Select',
    category: 'core',
    icon: List,
    defaultData: { label: 'Preferred Delivery Time', options: ['Morning (9am - 1pm)', 'Afternoon (1pm - 5pm)', 'Anytime'], required: true, step: 1 },
  },

  // High-Converting E-commerce Blocks
  {
    type: 'quantity_tiers',
    label: 'Quantity Pricing Tiers',
    category: 'ecommerce',
    icon: ShoppingBag,
    defaultData: {
      label: 'Select Package (Bulk Discounts)',
      step: 2,
      quantityTiers: [
        { id: 't1', quantity: 1, label: 'Buy 1 Unit (Standard)', fixedPrice: 42000, badge: 'STANDARD' },
        { id: 't2', quantity: 2, label: 'Buy 2 Units (Recommended)', fixedPrice: 80000, badge: '🔥 SAVE ₦4,000', isPopular: true },
        { id: 't3', quantity: 3, label: 'Buy 3 Units (VIP Triple)', fixedPrice: 118000, badge: '💰 SAVE ₦8,000' },
      ],
    },
  },
  {
    type: 'order_bump',
    label: '1-Click Order Bump',
    category: 'ecommerce',
    icon: Zap,
    defaultData: {
      label: 'VIP Order Bump Add-on',
      step: 2,
      orderBump: {
        enabled: true,
        title: 'Add 1-Year VIP Extended Warranty + Extra Heavy Duty Solar Cable',
        description: 'Priority warehouse processing, free parts replacement & damage cover for 12 months.',
        price: 4500,
        originalPrice: 9000,
        highlightText: 'ONE-TIME SPECIAL OFFER: +₦4,500',
      },
    },
  },
  {
    type: 'upsell_modal',
    label: 'Post-Purchase Upsell Modal',
    category: 'ecommerce',
    icon: Sparkles,
    defaultData: {
      label: 'Post-Purchase Upgrade Deal',
      step: 2,
      upsell: {
        enabled: true,
        heading: 'WAIT! Special 1-Time VIP Add-on Offer',
        subheading: 'Add our 20,000mAh Ultra-Slim Fast Charging Wireless Power Bank to your order today for 50% OFF!',
        productId: 'prd-4',
        productName: '20,000mAh Wireless Solar Power Bank',
        price: 14500,
        originalPrice: 29000,
        discountBadge: '50% OFF ONE-TIME OFFER',
        buttonText: 'YES! Add to My Order for ₦14,500',
        skipText: 'No thanks, I will pay full price later',
      },
    },
  },
  {
    type: 'coupon_code',
    label: 'Coupon / Promo Code',
    category: 'ecommerce',
    icon: Tag,
    defaultData: { label: 'Promo Code', placeholder: 'Enter code (e.g. STEKENT10)', step: 2 },
  },
  {
    type: 'payment_method',
    label: 'Payment Options (COD / Transfer)',
    category: 'ecommerce',
    icon: CreditCard,
    defaultData: { label: 'Payment Method', defaultValue: 'COD', step: 2 },
  },

  // Conversion & Urgency Blocks
  {
    type: 'countdown_timer',
    label: 'Urgency Countdown Timer',
    category: 'conversion',
    icon: Clock,
    defaultData: { label: '⚡ Flash Offer: Free Shipping + Free USB Bulb for the next 15 minutes!', step: 1 },
  },
  {
    type: 'trust_badges',
    label: 'Trust & Guarantee Badges',
    category: 'conversion',
    icon: ShieldCheck,
    defaultData: { label: 'Zero Risk Cash on Delivery & 24-48hr Dispatch Guarantee', step: 2 },
  },

  // Tracking & Hidden Fields
  {
    type: 'hidden',
    label: 'Hidden UTM / Pixel Field',
    category: 'tracking',
    icon: Globe,
    defaultData: { label: 'UTM Tracking Field', hiddenKey: 'utm_source', defaultValue: 'facebook_ads', step: 1 },
  },
];

export const FormBuilderModal: React.FC<FormBuilderModalProps> = ({
  initialForm,
  products = [],
  onClose,
  onSaved,
  onOpenLivePreview,
}) => {
  const [form, setForm] = useState<CustomForm>(() => {
    if (initialForm) return JSON.parse(JSON.stringify(initialForm));
    return {
      id: '',
      name: 'High-Converting Checkout Funnel',
      slug: `order-funnel-${Date.now().toString().slice(-4)}`,
      description: 'Optimized 2-step Cash on Delivery form with order bump and pricing tiers.',
      stepType: 'multi_step',
      status: 'published',
      productId: products[0]?.id || 'prd-1',
      viewsCount: 0,
      submissionsCount: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: {
        primaryColor: '#146B4E',
        backgroundColor: '#FFFFFF',
        borderRadius: 'medium',
        buttonStyle: 'shadow_bold',
        buttonText: 'CONFIRM CASH ON DELIVERY ORDER',
        buttonSubtext: '⚡ Pay When Delivery Rider Brings Your Package',
        showUrgencyTimer: true,
        timerMinutes: 15,
        showTrustBadges: true,
        showStockCounter: true,
        stockLeft: 12,
        layout: 'card_stepper',
      },
      coupons: [
        { code: 'STEKENT10', type: 'percentage', discountValue: 10, minOrderAmount: 30000, active: true },
        { code: 'VIP3000', type: 'fixed', discountValue: 3000, minOrderAmount: 40000, active: true },
      ],
      paymentOptions: {
        allowCOD: true,
        allowBankTransfer: true,
        allowCardPayment: false,
        allowPartialDeposit: false,
        bankDetails: {
          bankName: 'Zenith Bank PLC',
          accountNumber: '1018892019',
          accountName: 'Stekent Global Direct Ltd',
        },
      },
      tracking: {
        facebookPixelId: 'FB-998822104',
        tiktokPixelId: 'TT-77441199',
        googleAnalyticsId: 'G-STEKENT88',
      },
      webhookUrl: 'https://webhook.site/stekent-orders-sync',
      fields: [
        { id: 'f1', type: 'countdown_timer', label: '⚡ Flash Offer: Free Shipping + Free USB Bulb for the next 15 mins!', step: 1 },
        { id: 'f2', type: 'text', label: 'Full Name', placeholder: 'e.g. Adebayo Johnson', required: true, step: 1 },
        { id: 'f3', type: 'phone', label: 'WhatsApp Phone Number', placeholder: 'e.g. 0803 222 3344', required: true, step: 1 },
        { id: 'f4', type: 'state_select', label: 'Delivery State', required: true, step: 1, defaultValue: 'Lagos' },
        { id: 'f5', type: 'address', label: 'Full Delivery Address & Landmark', placeholder: 'House number, street, landmark', required: true, step: 1 },
        {
          id: 'f6',
          type: 'quantity_tiers',
          label: 'Choose Your Package (Special Bulk Discount)',
          step: 2,
          quantityTiers: [
            { id: 't1', quantity: 1, label: 'Buy 1 Unit (Standard Pack)', fixedPrice: 42000, badge: 'STANDARD PACK' },
            { id: 't2', quantity: 2, label: 'Buy 2 Units (Family Set)', fixedPrice: 80000, badge: '🔥 SAVE ₦4,000 + FREE BULB', isPopular: true },
            { id: 't3', quantity: 3, label: 'Buy 3 Units (VIP Triple)', fixedPrice: 118000, badge: '💰 SAVE ₦8,000' },
          ],
        },
        {
          id: 'f7',
          type: 'order_bump',
          label: 'VIP Warranty Add-on',
          step: 2,
          orderBump: {
            enabled: true,
            title: 'Add 1-Year VIP Extended Warranty + Extra Heavy Duty Solar Cable',
            description: 'Priority same-day warehouse dispatch, accidental damage coverage, and free replacement parts for 12 months.',
            price: 4500,
            originalPrice: 9000,
            highlightText: 'ONE-TIME SPECIAL ADD-ON: ONLY ₦4,500',
          },
        },
        { id: 'f8', type: 'coupon_code', label: 'Promo / Discount Code', step: 2 },
        { id: 'f9', type: 'payment_method', label: 'Payment Method', step: 2, defaultValue: 'COD' },
        { id: 'f10', type: 'trust_badges', label: 'Guaranteed Safe Delivery', step: 2 },
      ],
    };
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(form.fields[0]?.id || null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'field' | 'theme' | 'payment' | 'tracking' | 'embed'>('field');
  const [previewStep, setPreviewStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const selectedField = form.fields.find(f => f.id === selectedFieldId);

  // Field manipulation helpers
  const handleAddField = (item: typeof FIELD_PALETTE_ITEMS[0]) => {
    const newField: FormField = {
      id: `fld-${Date.now()}`,
      type: item.type,
      label: item.defaultData.label || item.label,
      placeholder: item.defaultData.placeholder,
      required: item.defaultData.required || false,
      step: form.stepType === 'multi_step' ? previewStep : 1,
      defaultValue: item.defaultData.defaultValue,
      options: item.defaultData.options,
      hiddenKey: item.defaultData.hiddenKey,
      quantityTiers: item.defaultData.quantityTiers ? JSON.parse(JSON.stringify(item.defaultData.quantityTiers)) : undefined,
      orderBump: item.defaultData.orderBump ? JSON.parse(JSON.stringify(item.defaultData.orderBump)) : undefined,
      upsell: item.defaultData.upsell ? JSON.parse(JSON.stringify(item.defaultData.upsell)) : undefined,
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newField.id);
    setActiveInspectorTab('field');
  };

  const handleUpdateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => (f.id === selectedFieldId ? { ...f, ...updates } : f)),
    }));
  };

  const handleDeleteField = (id: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id),
    }));
    if (selectedFieldId === id) {
      setSelectedFieldId(form.fields.find(f => f.id !== id)?.id || null);
    }
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.fields.length) return;
    const newFields = [...form.fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(newIndex, 0, moved);
    setForm(prev => ({ ...prev, fields: newFields }));
  };

  const handleSaveForm = async () => {
    setIsSaving(true);
    try {
      let saved: CustomForm;
      if (form.id) {
        saved = await api.updateForm(form.id, form);
      } else {
        saved = await api.createForm(form);
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      alert(`Save Error: ${err.message || 'Could not save form'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Embed Code generator
  const embedCode = `<iframe 
  src="${window.location.origin}/forms/${form.slug || 'checkout'}" 
  width="100%" 
  height="750" 
  style="border:none; max-width:650px; margin:0 auto; display:block;"
  title="${form.name}">
</iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex flex-col">
      {/* TOP BUILDER BAR */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="font-bold text-base bg-transparent border-b border-slate-700 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none px-1 text-white"
              />
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                /{form.slug}
              </span>
            </div>
            <p className="text-xs text-slate-400">Elementor & WPForms Drag-and-Drop Funnel Builder</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Step Type Toggle */}
          <div className="bg-slate-800 p-1 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setForm({ ...form, stepType: 'single' })}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                form.stepType === 'single' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1-Page Fast
            </button>
            <button
              onClick={() => setForm({ ...form, stepType: 'multi_step' })}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                form.stepType === 'multi_step' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              2-Step Stepper
            </button>
          </div>

          {onOpenLivePreview && (
            <button
              onClick={() => onOpenLivePreview(form)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Test Live Funnel</span>
            </button>
          )}

          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Form'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE: LEFT (BLOCKS) | CENTER (CANVAS) | RIGHT (INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PALETTE: COMPONENT BLOCKS */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300">
          <div className="p-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Blocks</h4>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
            {/* E-Commerce Blocks */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>E-Commerce & Offers</span>
              </div>
              <div className="space-y-1.5">
                {FIELD_PALETTE_ITEMS.filter(item => item.category === 'ecommerce').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddField(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-emerald-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-xs">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Fields */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
                <Type className="w-3.5 h-3.5" />
                <span>Contact & Address</span>
              </div>
              <div className="space-y-1.5">
                {FIELD_PALETTE_ITEMS.filter(item => item.category === 'core').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddField(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-emerald-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                        <span className="font-medium text-xs">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversion & Urgency */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Urgency & Badges</span>
              </div>
              <div className="space-y-1.5">
                {FIELD_PALETTE_ITEMS.filter(item => item.category === 'conversion').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddField(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-amber-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-amber-400" />
                        <span className="font-medium text-xs">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tracking Fields */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Tracking & Pixels</span>
              </div>
              <div className="space-y-1.5">
                {FIELD_PALETTE_ITEMS.filter(item => item.category === 'tracking').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddField(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-purple-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-xs">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE CANVAS: VISUAL BUILDER CANVAS */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex flex-col items-center">
          {/* Multi-Step Switcher in Canvas */}
          {form.stepType === 'multi_step' && (
            <div className="mb-4 bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={() => setPreviewStep(1)}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-2 ${
                  previewStep === 1 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Step 1: Contact & Address</span>
                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                  {form.fields.filter(f => (f.step || 1) === 1).length}
                </span>
              </button>
              <button
                onClick={() => setPreviewStep(2)}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-2 ${
                  previewStep === 2 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Step 2: Package, Bump & Payment</span>
                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                  {form.fields.filter(f => (f.step || 1) === 2).length}
                </span>
              </button>
            </div>
          )}

          {/* Form Container Canvas */}
          <div
            className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
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
            {/* Form Top Banner */}
            <div
              className="px-5 py-4 text-white flex items-center justify-between"
              style={{ backgroundColor: form.theme?.primaryColor || '#146B4E' }}
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">{form.name}</h3>
              </div>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded uppercase font-semibold">
                {form.stepType === 'multi_step' ? `Step ${previewStep} of 2` : 'Direct Fast Checkout'}
              </span>
            </div>

            {/* Urgency Bar */}
            {form.theme?.showUrgencyTimer && (
              <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4" />
                  <span>SPECIAL OFFER RESERVED FOR: {form.theme.timerMinutes || 15}:00 MINS</span>
                </div>
                {form.theme?.showStockCounter && (
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px]">
                    {form.theme.stockLeft || 12} Left in Stock
                  </span>
                )}
              </div>
            )}

            {/* Canvas Field List */}
            <div className="p-5 sm:p-6 space-y-4">
              {form.fields
                .filter(f => (form.stepType === 'multi_step' ? (f.step || 1) === previewStep : true))
                .map((field, idx) => {
                  const isSelected = field.id === selectedFieldId;
                  return (
                    <div
                      key={field.id}
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        setActiveInspectorTab('field');
                      }}
                      className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {/* Floating Block Actions */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center space-x-1 bg-white/95 shadow-md border border-slate-200 rounded-lg p-1 z-10">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveField(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveField(idx, 'down');
                          }}
                          disabled={idx === form.fields.length - 1}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                          }}
                          className="p-1 hover:bg-red-50 text-red-600 rounded"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Render Visual Blocks in Canvas */}
                      {field.type === 'countdown_timer' && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center text-xs font-bold text-amber-900 flex items-center justify-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>{field.label}</span>
                        </div>
                      )}

                      {(field.type === 'text' || field.type === 'phone' || field.type === 'address') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            readOnly
                            placeholder={field.placeholder || `Enter ${field.label}`}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 cursor-pointer"
                          />
                        </div>
                      )}

                      {field.type === 'state_select' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <select disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50">
                            <option>{field.defaultValue || 'Lagos'}</option>
                          </select>
                        </div>
                      )}

                      {field.type === 'dropdown' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            {field.label}
                          </label>
                          <select disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50">
                            {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                              <option key={i}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {field.type === 'quantity_tiers' && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-800 uppercase">
                            {field.label}
                          </label>
                          <div className="space-y-2">
                            {(field.quantityTiers || []).map(tier => (
                              <div
                                key={tier.id}
                                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                                  tier.isPopular ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-4 h-4 rounded-full border-2 ${tier.isPopular ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`} />
                                  <span className="font-bold">{tier.label}</span>
                                  {tier.badge && (
                                    <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                      {tier.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="font-extrabold">₦{(tier.fixedPrice || 42000).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {field.type === 'order_bump' && field.orderBump && (
                        <div className="p-3.5 border-2 border-dashed border-amber-400 bg-amber-50/50 rounded-xl space-y-1">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" readOnly checked className="rounded text-emerald-600" />
                            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded">
                              {field.orderBump.highlightText || 'ONE-TIME SPECIAL ADD-ON'}
                            </span>
                            <span className="font-bold text-xs text-emerald-800">
                              +₦{field.orderBump.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900">{field.orderBump.title}</div>
                          <p className="text-[11px] text-slate-600">{field.orderBump.description}</p>
                        </div>
                      )}

                      {field.type === 'upsell_modal' && field.upsell && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 text-purple-700 font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>Post-Purchase Upsell Trigger: {field.upsell.productName}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{field.upsell.heading}</p>
                          <div className="font-extrabold text-purple-800">Deal Price: ₦{field.upsell.price.toLocaleString()}</div>
                        </div>
                      )}

                      {field.type === 'coupon_code' && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-slate-700">Promo Code Input Block</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">[STEKENT10, VIP3000]</span>
                        </div>
                      )}

                      {field.type === 'payment_method' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase">{field.label}</label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 border-2 border-emerald-600 bg-emerald-50 rounded-lg font-bold text-emerald-800 flex items-center space-x-2">
                              <Radio className="w-3.5 h-3.5" />
                              <span>Cash on Delivery</span>
                            </div>
                            <div className="p-2.5 border border-slate-200 rounded-lg text-slate-600 flex items-center space-x-2">
                              <Radio className="w-3.5 h-3.5" />
                              <span>Bank Transfer</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {field.type === 'trust_badges' && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
                          <div className="flex flex-col items-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
                            <span>100% Genuine</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Sparkles className="w-4 h-4 text-emerald-600 mb-0.5" />
                            <span>Swift Dispatch</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <CreditCard className="w-4 h-4 text-emerald-600 mb-0.5" />
                            <span>Pay on Delivery</span>
                          </div>
                        </div>
                      )}

                      {field.type === 'hidden' && (
                        <div className="p-2 bg-slate-100 border border-dashed border-slate-300 rounded text-[11px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Hidden Field: {field.hiddenKey}</span>
                          <span>Value: {field.defaultValue || '(URL Parameter)'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Form Bottom CTA Preview */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-4 px-6 font-extrabold text-white text-sm sm:text-base rounded-xl shadow-xl flex flex-col items-center justify-center space-y-0.5"
                  style={{ backgroundColor: form.theme?.primaryColor || '#146B4E' }}
                >
                  <span>{form.theme?.buttonText || 'CONFIRM CASH ON DELIVERY ORDER'}</span>
                  <span className="text-[11px] font-normal text-white/90">
                    {form.theme?.buttonSubtext || '⚡ Pay When Delivery Rider Brings Your Package'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL: SETTINGS, THEMES, TRACKING, PAYMENTS */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-slate-300">
          {/* Inspector Tabs */}
          <div className="flex border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveInspectorTab('field')}
              className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-colors ${
                activeInspectorTab === 'field' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Block
            </button>
            <button
              onClick={() => setActiveInspectorTab('theme')}
              className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-colors ${
                activeInspectorTab === 'theme' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Theme
            </button>
            <button
              onClick={() => setActiveInspectorTab('payment')}
              className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-colors ${
                activeInspectorTab === 'payment' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Payment
            </button>
            <button
              onClick={() => setActiveInspectorTab('tracking')}
              className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-colors ${
                activeInspectorTab === 'tracking' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Pixels
            </button>
            <button
              onClick={() => setActiveInspectorTab('embed')}
              className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-colors ${
                activeInspectorTab === 'embed' ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Embed
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* TAB 1: BLOCK INSPECTOR */}
            {activeInspectorTab === 'field' && (
              <div className="space-y-4">
                {selectedField ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                        Block: {selectedField.type.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => handleDeleteField(selectedField.id)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Block Label</label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={e => handleUpdateSelectedField({ label: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {form.stepType === 'multi_step' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Step Assignment</label>
                        <select
                          value={selectedField.step || 1}
                          onChange={e => handleUpdateSelectedField({ step: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                        >
                          <option value={1}>Step 1: Contact & Address</option>
                          <option value={2}>Step 2: Package, Bump & Payment</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-400 mb-1">Placeholder Text</label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={e => handleUpdateSelectedField({ placeholder: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="req-chk"
                        checked={selectedField.required || false}
                        onChange={e => handleUpdateSelectedField({ required: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="req-chk" className="text-slate-300 font-medium">
                        Required Field
                      </label>
                    </div>

                    {/* Quantity Tiers Editor */}
                    {selectedField.type === 'quantity_tiers' && selectedField.quantityTiers && (
                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400">Quantity Tiers</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextQty = selectedField.quantityTiers!.length + 1;
                              const newTier: QuantityTier = {
                                id: `tier-${Date.now()}`,
                                quantity: nextQty,
                                label: `Buy ${nextQty} Units`,
                                fixedPrice: 40000 * nextQty,
                              };
                              handleUpdateSelectedField({
                                quantityTiers: [...selectedField.quantityTiers!, newTier],
                              });
                            }}
                            className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Tier</span>
                          </button>
                        </div>

                        {selectedField.quantityTiers.map((tier, idx) => (
                          <div key={tier.id} className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-300">Tier #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateSelectedField({
                                    quantityTiers: selectedField.quantityTiers!.filter(t => t.id !== tier.id),
                                  });
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={tier.label}
                              onChange={e => {
                                const copy = [...selectedField.quantityTiers!];
                                copy[idx].label = e.target.value;
                                handleUpdateSelectedField({ quantityTiers: copy });
                              }}
                              placeholder="Tier label e.g. Buy 2 Units"
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400">Fixed Price (₦)</label>
                                <input
                                  type="number"
                                  value={tier.fixedPrice || 0}
                                  onChange={e => {
                                    const copy = [...selectedField.quantityTiers!];
                                    copy[idx].fixedPrice = Number(e.target.value);
                                    handleUpdateSelectedField({ quantityTiers: copy });
                                  }}
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400">Badge (Optional)</label>
                                <input
                                  type="text"
                                  value={tier.badge || ''}
                                  onChange={e => {
                                    const copy = [...selectedField.quantityTiers!];
                                    copy[idx].badge = e.target.value;
                                    handleUpdateSelectedField({ quantityTiers: copy });
                                  }}
                                  placeholder="SAVE ₦4,000"
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Bump Config */}
                    {selectedField.type === 'order_bump' && selectedField.orderBump && (
                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        <span className="font-bold text-amber-400">Order Bump Settings</span>
                        <div>
                          <label className="block text-slate-400 mb-1">Headline</label>
                          <input
                            type="text"
                            value={selectedField.orderBump.title}
                            onChange={e => {
                              handleUpdateSelectedField({
                                orderBump: { ...selectedField.orderBump!, title: e.target.value },
                              });
                            }}
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Offer Price (₦)</label>
                          <input
                            type="number"
                            value={selectedField.orderBump.price}
                            onChange={e => {
                              handleUpdateSelectedField({
                                orderBump: { ...selectedField.orderBump!, price: Number(e.target.value) },
                              });
                            }}
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={selectedField.orderBump.description}
                            onChange={e => {
                              handleUpdateSelectedField({
                                orderBump: { ...selectedField.orderBump!, description: e.target.value },
                              });
                            }}
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 text-center py-6">Select a block on the canvas to configure its properties.</p>
                )}
              </div>
            )}

            {/* TAB 2: THEME & STYLING */}
            {activeInspectorTab === 'theme' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Primary Accent Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={form.theme?.primaryColor || '#146B4E'}
                      onChange={e =>
                        setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })
                      }
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.theme?.primaryColor || '#146B4E'}
                      onChange={e =>
                        setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })
                      }
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={form.theme?.buttonText || 'CONFIRM CASH ON DELIVERY ORDER'}
                    onChange={e =>
                      setForm({ ...form, theme: { ...form.theme, buttonText: e.target.value } })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">CTA Button Subtext</label>
                  <input
                    type="text"
                    value={form.theme?.buttonSubtext || '⚡ Pay When Delivery Rider Brings Your Package'}
                    onChange={e =>
                      setForm({ ...form, theme: { ...form.theme, buttonSubtext: e.target.value } })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Corner Radius</label>
                  <select
                    value={form.theme?.borderRadius || 'medium'}
                    onChange={e =>
                      setForm({ ...form, theme: { ...form.theme, borderRadius: e.target.value as any } })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="none">Square (0px)</option>
                    <option value="small">Small (8px)</option>
                    <option value="medium">Medium (16px)</option>
                    <option value="large">Pill / Curved (24px)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Show Urgency Countdown Timer</span>
                    <input
                      type="checkbox"
                      checked={form.theme?.showUrgencyTimer || false}
                      onChange={e =>
                        setForm({
                          ...form,
                          theme: { ...form.theme, showUrgencyTimer: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Show Stock Counter Pill</span>
                    <input
                      type="checkbox"
                      checked={form.theme?.showStockCounter || false}
                      onChange={e =>
                        setForm({
                          ...form,
                          theme: { ...form.theme, showStockCounter: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Show Trust Badges</span>
                    <input
                      type="checkbox"
                      checked={form.theme?.showTrustBadges || false}
                      onChange={e =>
                        setForm({
                          ...form,
                          theme: { ...form.theme, showTrustBadges: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENT & BANK DETAILS */}
            {activeInspectorTab === 'payment' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-medium">Accept Cash on Delivery (COD)</span>
                    <input
                      type="checkbox"
                      checked={form.paymentOptions?.allowCOD || false}
                      onChange={e =>
                        setForm({
                          ...form,
                          paymentOptions: { ...form.paymentOptions, allowCOD: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-medium">Accept Direct Bank Transfer</span>
                    <input
                      type="checkbox"
                      checked={form.paymentOptions?.allowBankTransfer || false}
                      onChange={e =>
                        setForm({
                          ...form,
                          paymentOptions: { ...form.paymentOptions, allowBankTransfer: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                  </div>
                </div>

                {form.paymentOptions?.allowBankTransfer && (
                  <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-2.5">
                    <span className="font-bold text-emerald-400 block">Bank Account Details</span>
                    <div>
                      <label className="block text-slate-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={form.paymentOptions?.bankDetails?.bankName || 'Zenith Bank PLC'}
                        onChange={e =>
                          setForm({
                            ...form,
                            paymentOptions: {
                              ...form.paymentOptions,
                              bankDetails: {
                                bankName: e.target.value,
                                accountNumber: form.paymentOptions?.bankDetails?.accountNumber || '1018892019',
                                accountName: form.paymentOptions?.bankDetails?.accountName || 'Stekent Direct Ltd',
                              },
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Account Number (10 Digits)</label>
                      <input
                        type="text"
                        value={form.paymentOptions?.bankDetails?.accountNumber || '1018892019'}
                        onChange={e =>
                          setForm({
                            ...form,
                            paymentOptions: {
                              ...form.paymentOptions,
                              bankDetails: {
                                bankName: form.paymentOptions?.bankDetails?.bankName || 'Zenith Bank PLC',
                                accountNumber: e.target.value,
                                accountName: form.paymentOptions?.bankDetails?.accountName || 'Stekent Direct Ltd',
                              },
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={form.paymentOptions?.bankDetails?.accountName || 'Stekent Global Direct Ltd'}
                        onChange={e =>
                          setForm({
                            ...form,
                            paymentOptions: {
                              ...form.paymentOptions,
                              bankDetails: {
                                bankName: form.paymentOptions?.bankDetails?.bankName || 'Zenith Bank PLC',
                                accountNumber: form.paymentOptions?.bankDetails?.accountNumber || '1018892019',
                                accountName: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TRACKING & PIXELS */}
            {activeInspectorTab === 'tracking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={form.tracking?.facebookPixelId || ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        tracking: { ...form.tracking, facebookPixelId: e.target.value },
                      })
                    }
                    placeholder="e.g. 998822104"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">TikTok Pixel ID</label>
                  <input
                    type="text"
                    value={form.tracking?.tiktokPixelId || ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        tracking: { ...form.tracking, tiktokPixelId: e.target.value },
                      })
                    }
                    placeholder="e.g. TT-77441199"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={form.tracking?.googleAnalyticsId || ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        tracking: { ...form.tracking, googleAnalyticsId: e.target.value },
                      })
                    }
                    placeholder="e.g. G-STEKENT88"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Outbound Webhook URL</label>
                  <input
                    type="text"
                    value={form.webhookUrl || ''}
                    onChange={e => setForm({ ...form, webhookUrl: e.target.value })}
                    placeholder="https://webhook.site/..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: EMBED & INTEGRATION */}
            {activeInspectorTab === 'embed' && (
              <div className="space-y-4">
                <div>
                  <span className="font-bold text-slate-200 block mb-1">HTML Iframe Embed Code</span>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Paste this embed code directly into WordPress, Elementor, ClickFunnels, Shopify or custom landing pages.
                  </p>
                  <div className="relative">
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                      {embedCode}
                    </pre>
                    <button
                      onClick={handleCopyEmbed}
                      className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center space-x-1"
                    >
                      {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmbed ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="font-bold text-emerald-400 block">Direct Checkout URL:</span>
                  <span className="font-mono text-slate-300 break-all text-[11px]">
                    {window.location.origin}/forms/{form.slug}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
