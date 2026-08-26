import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  DollarSign,
  X,
  Check,
} from 'lucide-react';
import { Product, CreateProductPayload } from '../types';
import { KPICard } from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

interface ProductsPageProps {
  products: Product[];
  onAddProduct: (payload: CreateProductPayload) => Promise<void>;
  onRefresh: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products = [],
  onAddProduct,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'in_stock'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    currency: 'NGN',
    stockQty: '',
    lowStockThreshold: '10',
  });

  // Calculations for KPIs
  const totalProducts = products.length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stockQty || 0), 0);
  const lowStockProducts = products.filter(p => (p.stockQty || 0) <= (p.lowStockThreshold || 0));
  const lowStockCount = lowStockProducts.length;
  const totalValuation = products.reduce((acc, p) => acc + (p.stockQty || 0) * (p.costPrice || 0), 0);

  // Filtered list
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === 'low_stock') {
      return product.stockQty <= product.lowStockThreshold;
    }
    if (stockFilter === 'in_stock') {
      return product.stockQty > product.lowStockThreshold;
    }
    return true;
  });

  // Calculate live margin for modal
  const cost = parseFloat(formData.costPrice) || 0;
  const sell = parseFloat(formData.sellingPrice) || 0;
  const unitProfit = sell - cost;
  const marginPct = sell > 0 ? ((unitProfit / sell) * 100).toFixed(1) : '0.0';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.sku || !formData.costPrice || !formData.sellingPrice) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        currency: formData.currency,
        stockQty: parseInt(formData.stockQty, 10) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
      });

      // Reset form
      setFormData({
        name: '',
        sku: '',
        costPrice: '',
        sellingPrice: '',
        currency: 'NGN',
        stockQty: '',
        lowStockThreshold: '10',
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-total-products"
          title="Catalog SKUs"
          value={totalProducts}
          subtitle="Registered catalog items"
          icon={<Package className="w-4 h-4" />}
          variant="default"
        />
        <KPICard
          id="kpi-total-stock-units"
          title="Warehouse Stock"
          value={`${totalUnits.toLocaleString()} units`}
          subtitle="Physical inventory on hand"
          icon={<Boxes className="w-4 h-4" />}
          variant="blue"
        />
        <KPICard
          id="kpi-low-stock-alert"
          title="Low Stock Alert"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'Requires immediate restock' : 'All stock levels healthy'}
          icon={<AlertTriangle className="w-4 h-4" />}
          variant={lowStockCount > 0 ? 'gold' : 'brand'}
        />
        <KPICard
          id="kpi-inventory-valuation"
          title="Stock Valuation"
          value={formatCurrency(totalValuation)}
          subtitle="Valuation at cost price"
          icon={<DollarSign className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] overflow-hidden">
        {/* Actions Bar */}
        <div className="p-3.5 border-b border-[#E2E5DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF9]">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-products"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Pills */}
            <div className="flex items-center bg-[#EEF0E8] p-0.5 rounded-[6px] border border-[#E2E5DD]">
              <button
                id="filter-products-all"
                onClick={() => setStockFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-[4px] font-medium transition-all ${
                  stockFilter === 'all'
                    ? 'bg-[#FFFFFF] text-[#12231C] shadow-xs'
                    : 'text-[#5B675E] hover:text-[#12231C]'
                }`}
              >
                All ({totalProducts})
              </button>
              <button
                id="filter-products-low"
                onClick={() => setStockFilter('low_stock')}
                className={`px-2.5 py-1 text-xs rounded-[4px] font-medium transition-all ${
                  stockFilter === 'low_stock'
                    ? 'bg-[#FFFFFF] text-[#B9822A] shadow-xs font-semibold'
                    : 'text-[#5B675E] hover:text-[#12231C]'
                }`}
              >
                Low Stock ({lowStockCount})
              </button>
              <button
                id="filter-products-in-stock"
                onClick={() => setStockFilter('in_stock')}
                className={`px-2.5 py-1 text-xs rounded-[4px] font-medium transition-all ${
                  stockFilter === 'in_stock'
                    ? 'bg-[#FFFFFF] text-[#146B4E] shadow-xs font-semibold'
                    : 'text-[#5B675E] hover:text-[#12231C]'
                }`}
              >
                In Stock ({totalProducts - lowStockCount})
              </button>
            </div>

            {/* Add Product Button */}
            <button
              id="btn-open-add-product"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add product</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[11px] font-sans font-semibold">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Unit Margin</th>
                <th className="py-3 px-4">Warehouse Stock</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DD] text-[#12231C] font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#5B675E]">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isLow = product.stockQty <= product.lowStockThreshold;
                  const isZero = product.stockQty === 0;
                  const profit = product.sellingPrice - product.costPrice;
                  const marginPercent = ((profit / product.sellingPrice) * 100).toFixed(1);

                  return (
                    <tr
                      key={product.id}
                      id={`product-row-${product.id}`}
                      className="hover:bg-[#EEF0E8]/50 transition-colors"
                    >
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-bold text-[#12231C]">
                        {product.sku}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-medium text-[#12231C]">
                        {product.name}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-mono text-[#5B675E]">
                        {formatCurrency(product.costPrice, product.currency)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono text-[#12231C] font-semibold">
                        {formatCurrency(product.sellingPrice, product.currency)}
                      </td>

                      {/* Unit Margin */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="text-[#146B4E] font-medium">
                          +{marginPercent}%
                        </span>
                        <span className="text-[10px] text-[#5B675E] block">
                          (+{formatCurrency(profit, product.currency)})
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 w-32">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-mono font-bold ${isZero ? 'text-[#B33A3A]' : isLow ? 'text-[#B9822A]' : 'text-[#12231C]'}`}>
                              {product.stockQty} units
                            </span>
                            <span className="text-[#5B675E] text-[10px] font-mono">
                              min {product.lowStockThreshold}
                            </span>
                          </div>
                          <div className="w-full bg-[#EEF0E8] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isZero ? 'bg-[#B33A3A]' : isLow ? 'bg-[#B9822A]' : 'bg-[#146B4E]'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (product.stockQty / (product.lowStockThreshold * 3)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#F8E7E5] text-[#B33A3A] border border-[#ECCAC7]">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#F6ECD8] text-[#B9822A] border border-[#EADBBD]">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#E3F0E9] text-[#146B4E] border border-[#C5DFD0]">
                            <Check className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#12231C] font-heading">
                  Add New Product
                </h3>
                <p className="text-xs text-[#5B675E]">
                  Register SKU to database catalog & set stock levels
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-[6px] bg-[#F8E7E5] border border-[#B33A3A]/30 text-[#B33A3A] text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Product Title *
                  </label>
                  <input
                    id="input-product-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Slimming Sauna Vest"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 focus:border-[#146B4E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    SKU Identifier *
                  </label>
                  <input
                    id="input-product-sku"
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SAUNA-VEST-01"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 focus:border-[#146B4E] outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] focus:border-[#146B4E] outline-none"
                  >
                    <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Cost Price (₦) *
                  </label>
                  <input
                    id="input-product-cost"
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="e.g. 6500"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 focus:border-[#146B4E] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Selling Price (₦) *
                  </label>
                  <input
                    id="input-product-selling"
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="e.g. 18500"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 focus:border-[#146B4E] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Profit Preview */}
              <div className="p-2.5 rounded-[6px] bg-[#EEF0E8]/50 border border-[#E2E5DD] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[#5B675E] text-[10px] block">Profit per unit:</span>
                  <span className={`font-bold ${unitProfit >= 0 ? 'text-[#146B4E]' : 'text-[#B33A3A]'}`}>
                    {formatCurrency(unitProfit, formData.currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#5B675E] text-[10px] block">Gross Margin:</span>
                  <span className={`font-bold ${parseFloat(marginPct) >= 30 ? 'text-[#146B4E]' : 'text-[#B9822A]'}`}>
                    {marginPct}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Initial Stock Qty *
                  </label>
                  <input
                    id="input-product-stock-qty"
                    type="number"
                    required
                    min="0"
                    value={formData.stockQty}
                    onChange={e => setFormData({ ...formData, stockQty: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 focus:border-[#146B4E] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                    Low Stock Threshold
                  </label>
                  <input
                    id="input-product-low-stock-threshold"
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full bg-[#FFFFFF] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 focus:border-[#146B4E] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[6px] border border-[#E2E5DD] text-xs font-medium text-[#5B675E] hover:bg-[#EEF0E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-add-product"
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : 'Save product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
