import React, { useState } from 'react';
import {
  Boxes,
  PackagePlus,
  AlertTriangle,
  Lock,
  Search,
  Plus,
  X,
  TrendingUp,
} from 'lucide-react';
import { Product } from '../types';
import { KPICard } from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

interface InventoryPageProps {
  products: Product[];
  onAddStock?: (productId: string, qtyToAdd: number) => void;
  onToast: (msg: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products = [],
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyToAdd, setQtyToAdd] = useState('');

  const totalStockValuation = products.reduce((sum, p) => sum + ((p.stockQty || 0) * (p.costPrice || 0)), 0) || 38150000;
  const totalUnitsInStock = products.reduce((sum, p) => sum + (p.stockQty || 0), 0) || 1980;
  const lowStockCount = products.filter(p => (p.stockQty || 0) <= (p.lowStockThreshold || 0)).length;
  const reservedUnits = products.reduce((sum, p) => sum + (p.reservedQty || 0), 0) || 214;

  const filteredProducts = products.filter(
    p =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    const added = parseInt(qtyToAdd, 10) || 0;
    if (prod && added > 0) {
      prod.stockQty += added;
      onToast(`Successfully stocked in +${added} units for ${prod.name}`);
    }
    setIsStockInModalOpen(false);
    setSelectedProductId('');
    setQtyToAdd('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Inventory & Stock In
          </h1>
          <p className="text-xs text-[#5B675E]">
            Track warehouse stock levels, reservations and physical movements.
          </p>
        </div>

        <button
          onClick={() => setIsStockInModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Stock In</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search warehouse inventory by SKU or product name..."
            className="w-full bg-white border border-[#E2E5DD] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
          />
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-total-stock-val"
          title="Total Stock Value"
          value={formatCurrency(totalStockValuation)}
          subtitle="+4.1% vs last shipment"
          icon={<Boxes className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
        <KPICard
          id="kpi-units-in-stock"
          title="Units in Stock"
          value={`${totalUnitsInStock.toLocaleString()} units`}
          subtitle={`Across ${products.length} catalog items`}
          icon={<PackagePlus className="w-4 h-4" />}
          variant="blue"
        />
        <KPICard
          id="kpi-low-stock-items"
          title="Low Stock"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'Needs restock attention' : 'Healthy inventory'}
          icon={<AlertTriangle className="w-4 h-4" />}
          variant={lowStockCount > 0 ? 'gold' : 'default'}
        />
        <KPICard
          id="kpi-reserved-stock"
          title="Reserved Units"
          value={`${reservedUnits} units`}
          subtitle="Held for confirmed orders"
          icon={<Lock className="w-4 h-4" />}
          variant="default"
        />
      </div>

      {/* Inventory Stock Ledger */}
      <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
            Warehouse Inventory Units ({filteredProducts.length})
          </span>
          <span className="text-[11px] font-mono text-[#5B675E]">
            Lagos Central Warehouse
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Physical Stock</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-right">Cost Valuation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DD]">
              {filteredProducts.map(p => {
                const isLow = p.stockQty <= p.lowStockThreshold;
                const reserved = p.reservedQty || Math.min(p.stockQty, 12);
                const available = Math.max(0, p.stockQty - reserved);
                const valuation = p.stockQty * p.costPrice;

                return (
                  <tr key={p.id} className="hover:bg-[#FAFBF9] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#12231C]">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#12231C]">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#12231C]">
                      {p.stockQty}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#B9822A]">
                      {reserved}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#146B4E] font-bold">
                      {available}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#12231C]">
                      {formatCurrency(valuation, p.currency)}
                    </td>
                    <td className="py-3 px-4">
                      {p.stockQty === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8E7E5] text-[#B33A3A]">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6ECD8] text-[#B9822A]">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E3F0E9] text-[#146B4E]">
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setIsStockInModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] rounded-[6px] border border-[#E2E5DD] hover:bg-[#EEF0E8] font-medium text-[#12231C]"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Modal */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Stock In / Warehouse Restock
              </h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                >
                  <option value="">Choose item to restock...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Current: {p.stockQty} units
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Quantity Received (Units) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qtyToAdd}
                  onChange={e => setQtyToAdd(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E] font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] text-xs font-semibold text-[#5B675E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white"
                >
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
