import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Eye,
  Trash2,
  Copy,
  Check,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  MousePointer,
  Sparkles,
  Zap,
  Code,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  ArrowUpRight,
} from 'lucide-react';
import { CustomForm, Product } from '../types';
import { api } from '../services/api';
import { FormBuilderModal } from '../components/forms/FormBuilderModal';
import { LiveCheckoutPreview } from '../components/forms/LiveCheckoutPreview';

export const FormBuilderPage: React.FC = () => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [previewForm, setPreviewForm] = useState<CustomForm | null>(null);
  const [embedModalForm, setEmbedModalForm] = useState<CustomForm | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchFormsAndProducts = async () => {
    try {
      setLoading(true);
      const [fetchedForms, fetchedProducts] = await Promise.all([
        api.getForms(),
        api.getProducts(),
      ]);
      setForms(fetchedForms || []);
      setProducts(fetchedProducts || []);
    } catch (err: any) {
      console.error('Failed to load forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormsAndProducts();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // KPIs
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionsCount || 0), 0);
  const totalViews = forms.reduce((acc, f) => acc + (f.viewsCount || 0), 0);
  const totalRevenue = forms.reduce((acc, f) => acc + (f.totalRevenue || 0), 0);
  const avgConversionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : '0.0';

  // Filtered forms
  const filteredForms = forms.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteForm = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete form "${name}"?`)) return;
    try {
      await api.deleteForm(id);
      setForms(prev => prev.filter(f => f.id !== id));
      showToast(`Form "${name}" deleted`);
    } catch (err: any) {
      alert(`Delete Error: ${err.message || 'Failed to delete'}`);
    }
  };

  const handleToggleStatus = async (form: CustomForm) => {
    const nextStatus = form.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await api.updateForm(form.id, { status: nextStatus });
      setForms(prev => prev.map(f => (f.id === form.id ? updated : f)));
      showToast(`Form is now ${nextStatus === 'published' ? 'Published' : 'Draft'}`);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDuplicateForm = async (form: CustomForm) => {
    try {
      const duplicatePayload: Partial<CustomForm> = {
        ...form,
        id: undefined,
        name: `${form.name} (Copy)`,
        slug: `${form.slug}-copy-${Date.now().toString().slice(-4)}`,
        viewsCount: 0,
        submissionsCount: 0,
        totalRevenue: 0,
      };
      const created = await api.createForm(duplicatePayload);
      setForms(prev => [created, ...prev]);
      showToast(`Form duplicated as "${created.name}"`);
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleCreateFromTemplate = async (templateType: 'solar' | 'camera' | 'watch') => {
    let templatePayload: Partial<CustomForm>;
    if (templateType === 'solar') {
      templatePayload = {
        name: 'Solar Generator 2-Step Mega Funnel',
        slug: `solar-gen-${Date.now().toString().slice(-4)}`,
        description: 'Multi-step COD checkout with quantity tiers and 1-year warranty bump.',
        stepType: 'multi_step',
        productId: products[0]?.id || 'prd-1',
        status: 'published',
        theme: {
          primaryColor: '#146B4E',
          backgroundColor: '#FFFFFF',
          borderRadius: 'medium',
          buttonStyle: 'shadow_bold',
          buttonText: 'CONFIRM CASH ON DELIVERY ORDER',
          buttonSubtext: '⚡ Free Nationwide Delivery - Pay on Arrival',
          showUrgencyTimer: true,
          timerMinutes: 15,
          showTrustBadges: true,
          showStockCounter: true,
          stockLeft: 9,
          layout: 'card_stepper',
        },
        paymentOptions: { allowCOD: true, allowBankTransfer: true, allowCardPayment: false, allowPartialDeposit: false },
        fields: [
          { id: 'f1', type: 'countdown_timer', label: '⚡ Flash Offer: Free Shipping for the next 15 mins!', step: 1 },
          { id: 'f2', type: 'text', label: 'Full Name', required: true, step: 1 },
          { id: 'f3', type: 'phone', label: 'WhatsApp Phone Number', required: true, step: 1 },
          { id: 'f4', type: 'state_select', label: 'Delivery State', required: true, step: 1, defaultValue: 'Lagos' },
          { id: 'f5', type: 'address', label: 'Delivery Street Address & Landmark', required: true, step: 1 },
          {
            id: 'f6',
            type: 'quantity_tiers',
            label: 'Choose Your Package',
            step: 2,
            quantityTiers: [
              { id: 't1', quantity: 1, label: '1x Solar Generator Unit', fixedPrice: 75000, badge: 'STANDARD' },
              { id: 't2', quantity: 2, label: '2x Units (Family Pack)', fixedPrice: 140000, badge: 'SAVE ₦10,000', isPopular: true },
            ],
          },
          {
            id: 'f7',
            type: 'order_bump',
            label: 'VIP Warranty Bump',
            step: 2,
            orderBump: {
              enabled: true,
              title: 'Add 1-Year VIP Extended Warranty + Fast Charger Cable',
              description: 'Free parts replacement and doorstep pickup for repairs.',
              price: 5500,
              highlightText: 'SPECIAL ADD-ON DEAL',
            },
          },
          { id: 'f8', type: 'payment_method', label: 'Payment Method', step: 2, defaultValue: 'COD' },
        ],
      };
    } else {
      templatePayload = {
        name: 'Mini Wireless Spy Camera 1-Page Express',
        slug: `spycam-fast-${Date.now().toString().slice(-4)}`,
        description: 'Single-page high velocity impulse purchase form.',
        stepType: 'single',
        productId: products[1]?.id || products[0]?.id || 'prd-2',
        status: 'published',
        theme: {
          primaryColor: '#0F172A',
          backgroundColor: '#FFFFFF',
          borderRadius: 'small',
          buttonStyle: 'shadow_bold',
          buttonText: 'SEND MY SPY CAMERA NOW',
          buttonSubtext: '⚡ Zero Risk - Pay Driver Only When Delivered',
          showUrgencyTimer: true,
          timerMinutes: 10,
          showTrustBadges: true,
          showStockCounter: true,
          stockLeft: 14,
          layout: 'single_column',
        },
        paymentOptions: { allowCOD: true, allowBankTransfer: false, allowCardPayment: false, allowPartialDeposit: false },
        fields: [
          { id: 'f1', type: 'text', label: 'Customer Name', required: true, step: 1 },
          { id: 'f2', type: 'phone', label: 'Active Phone Number', required: true, step: 1 },
          { id: 'f3', type: 'state_select', label: 'Delivery State', required: true, step: 1, defaultValue: 'Lagos' },
          { id: 'f4', type: 'address', label: 'Full Delivery Address', required: true, step: 1 },
          {
            id: 'f5',
            type: 'quantity_tiers',
            label: 'Select Quantity',
            step: 1,
            quantityTiers: [
              { id: 't1', quantity: 1, label: '1x Spy Camera', fixedPrice: 28000 },
              { id: 't2', quantity: 2, label: '2x Spy Cameras (Buy 1 Get 2nd at 30% Off)', fixedPrice: 48000, isPopular: true },
            ],
          },
          { id: 'f6', type: 'trust_badges', label: '100% Discreet Packaging', step: 1 },
        ],
      };
    }

    try {
      const created = await api.createForm(templatePayload);
      setForms(prev => [created, ...prev]);
      showToast(`Form created from template: "${created.name}"`);
    } catch (err: any) {
      alert(`Template creation failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Form Builder</h1>
              <p className="text-sm text-slate-500">
                Visual "Elementor + WPForms" competitor with Multi-Step, Order Bumps, Quantity Tiers & Direct COD Checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="dropdown relative group">
            <button className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Use High-Converting Template</span>
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 space-y-1 text-xs">
              <button
                onClick={() => handleCreateFromTemplate('solar')}
                className="w-full text-left p-2 hover:bg-emerald-50 rounded-lg text-slate-800 font-medium flex items-center justify-between"
              >
                <span>Solar Fan / Generator 2-Step</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">COD 2-Step</span>
              </button>
              <button
                onClick={() => handleCreateFromTemplate('camera')}
                className="w-full text-left p-2 hover:bg-emerald-50 rounded-lg text-slate-800 font-medium flex items-center justify-between"
              >
                <span>Mini Spy Camera 1-Page Express</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">1-Page Fast</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingForm(null);
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Form</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Funnel Forms</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{forms.length}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{forms.filter(f => f.status === 'published').length} Published & Live</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Form Submissions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalSubmissions.toLocaleString()}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">From {totalViews.toLocaleString()} Form Views</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <MousePointer className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Conversion Rate</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{avgConversionRate}%</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Industry avg: 4.8%</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Form Revenue Generated</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">₦{totalRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Direct Inbound COD Orders</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search forms by name or slug..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Forms
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'published' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'draft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* FORM CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading custom forms...</div>
      ) : filteredForms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Forms Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first high-converting checkout form or using one of our pre-built e-commerce templates.
          </p>
          <button
            onClick={() => {
              setEditingForm(null);
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map(form => {
            const product = products.find(p => p.id === form.productId);
            const conversionRate =
              form.viewsCount && form.viewsCount > 0
                ? (((form.submissionsCount || 0) / form.viewsCount) * 100).toFixed(1)
                : '0.0';

            const hasBump = form.fields?.some(f => f.type === 'order_bump');
            const hasUpsell = form.fields?.some(f => f.type === 'upsell_modal');
            const hasTiers = form.fields?.some(f => f.type === 'quantity_tiers');

            return (
              <div
                key={form.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top */}
                <div>
                  <div className="p-5 border-b border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                            form.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {form.status === 'published' ? '● Live Published' : 'Draft'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{form.name}</h3>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setPreviewForm(form)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Test Live Funnel"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingForm(form);
                            setIsBuilderOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Open Form Builder"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{form.description}</p>

                    {/* Slug & Product Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <span>/{form.slug}</span>
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-md">
                        {form.stepType === 'multi_step' ? '2-Step Funnel' : '1-Page Direct'}
                      </span>
                      {product && (
                        <span className="bg-blue-50 text-blue-800 font-medium px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          📦 {product.name}
                        </span>
                      )}
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {hasTiers && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Quantity Tiers
                        </span>
                      )}
                      {hasBump && (
                        <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          1-Click Order Bump
                        </span>
                      )}
                      {hasUpsell && (
                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Post-Purchase Upsell
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Funnel Performance Statistics */}
                  <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Submissions</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {form.submissionsCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Conversion</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {conversionRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Revenue</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₦{((form.totalRevenue || 0) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-white flex items-center justify-between text-xs">
                  <button
                    onClick={() => setEmbedModalForm(form)}
                    className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Code className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Get Embed Code</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleStatus(form)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title={form.status === 'published' ? 'Switch to Draft' : 'Publish Form'}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateForm(form)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Duplicate Form"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.id, form.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Form"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM BUILDER FULLSCREEN MODAL */}
      {isBuilderOpen && (
        <FormBuilderModal
          initialForm={editingForm}
          products={products}
          onClose={() => setIsBuilderOpen(false)}
          onSaved={saved => {
            setForms(prev => {
              const idx = prev.findIndex(f => f.id === saved.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = saved;
                return copy;
              }
              return [saved, ...prev];
            });
            showToast(`Form "${saved.name}" saved successfully`);
          }}
          onOpenLivePreview={form => setPreviewForm(form)}
        />
      )}

      {/* LIVE CHECKOUT PREVIEW MODAL */}
      {previewForm && (
        <LiveCheckoutPreview
          form={previewForm}
          products={products}
          onClose={() => setPreviewForm(null)}
          onOrderCreated={(order, logs) => {
            fetchFormsAndProducts();
            showToast(`COD Order #${order.orderNumber} created! Automation engine ran ${logs?.length || 0} workflows.`);
          }}
        />
      )}

      {/* EMBED CODE & SHARE MODAL */}
      {embedModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Embed & Integrate Form</h3>
              </div>
              <button
                onClick={() => setEmbedModalForm(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                HTML Iframe Embed Code (Elementor, WordPress, Custom Site)
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  readOnly
                  value={`<iframe \n  src="${window.location.origin}/forms/${embedModalForm.slug}" \n  width="100%" \n  height="750" \n  style="border:none; max-width:650px; margin:0 auto; display:block;" \n  title="${embedModalForm.name}">\n</iframe>`}
                  className="w-full p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
                />
                <button
                  onClick={() => {
                    const code = `<iframe \n  src="${window.location.origin}/forms/${embedModalForm.slug}" \n  width="100%" \n  height="750" \n  style="border:none; max-width:650px; margin:0 auto; display:block;" \n  title="${embedModalForm.name}">\n</iframe>`;
                    navigator.clipboard.writeText(code);
                    setCopiedSlug(embedModalForm.slug);
                    setTimeout(() => setCopiedSlug(null), 2000);
                  }}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  {copiedSlug === embedModalForm.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Embed</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block">Direct Shareable Link:</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-600 truncate">
                  {window.location.origin}/forms/{embedModalForm.slug}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/forms/${embedModalForm.slug}`);
                    showToast('Link copied to clipboard');
                  }}
                  className="text-emerald-700 font-bold hover:underline ml-2"
                >
                  Copy URL
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setEmbedModalForm(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
