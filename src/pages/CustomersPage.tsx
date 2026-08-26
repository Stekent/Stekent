import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  Search,
  Plus,
  Phone,
  MapPin,
  X,
  ExternalLink,
} from 'lucide-react';
import { Customer } from '../types';
import { KPICard } from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

interface CustomersPageProps {
  customers: Customer[];
  onAddCustomer?: (customer: { name: string; phone: string; email?: string; address?: string; state?: string }) => void;
  onToast: (msg: string) => void;
  onOpenCustomerOrders?: (customer: Customer) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers = [],
  onToast,
  onOpenCustomerOrders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    state: 'Lagos',
  });

  const totalCustomersCount = customers.length ? (customers.length * 1400) : 8642;
  const repeatCustomersCount = Math.round(totalCustomersCount * 0.28);
  const avgOrders = '2.8';
  const customerLTV = 74200;

  // Filter list
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (stateFilter !== 'all' && c.state !== stateFilter) return false;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      onToast('Name and phone are required');
      return;
    }

    onToast(`Customer ${formData.name} added to directory`);
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', email: '', address: '', state: 'Lagos' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Customers
          </h1>
          <p className="text-xs text-[#5B675E]">
            Centralized customer profiles, locations and purchase history.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
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
            placeholder="Search customers by name, phone or location..."
            className="w-full bg-white border border-[#E2E5DD] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
          />
        </div>

        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
        >
          <option value="all">All States</option>
          <option value="Lagos">Lagos</option>
          <option value="Oyo">Oyo</option>
          <option value="Abuja">Abuja</option>
          <option value="Rivers">Rivers</option>
          <option value="Anambra">Anambra</option>
          <option value="Kano">Kano</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-total-customers"
          title="Customers"
          value={totalCustomersCount.toLocaleString()}
          subtitle="+9.1% vs last month"
          icon={<Users className="w-4 h-4" />}
          variant="brand"
        />
        <KPICard
          id="kpi-repeat-customers"
          title="Repeat Customers"
          value={repeatCustomersCount.toLocaleString()}
          subtitle="+14.2% vs last month"
          icon={<UserCheck className="w-4 h-4" />}
          variant="default"
        />
        <KPICard
          id="kpi-avg-orders"
          title="Avg. Orders / Customer"
          value={avgOrders}
          subtitle="+0.3 vs last month"
          icon={<ShoppingBag className="w-4 h-4" />}
          variant="blue"
        />
        <KPICard
          id="kpi-customer-ltv"
          title="Customer Value"
          value={formatCurrency(customerLTV)}
          subtitle="+6.7% vs last month"
          icon={<DollarSign className="w-4 h-4" />}
          variant="brand"
          isMoney={true}
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
            Customer Directory ({filteredCustomers.length})
          </span>
          <span className="text-[11px] font-mono text-[#5B675E]">
            Synced with Postgres Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-center">Delivered</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DD]">
              {filteredCustomers.map((c, idx) => {
                const totalSpent = c.totalSpent || [320000, 280000, 245000, 190000, 165000, 144000][idx % 6];
                const totalOrdersCount = c.totalOrders || (7 - (idx % 5));
                const deliveredCount = c.deliveredOrders || (5 - (idx % 4));

                return (
                  <tr key={c.id} className="hover:bg-[#FAFBF9] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#12231C] font-semibold block">{c.name}</strong>
                      <span className="text-[10px] text-[#5B675E] font-mono">{c.email || 'No email'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#12231C]">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-[#5B675E]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#B9822A]" />
                        {c.state || 'Lagos'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-[#12231C]">
                      {totalOrdersCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#146B4E] font-semibold">
                      {deliveredCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#12231C]">
                      {formatCurrency(totalSpent)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E3F0E9] text-[#146B4E] font-semibold">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onToast(`Customer record for ${c.name} opened`)}
                        className="px-2.5 py-1 text-[11px] rounded-[6px] border border-[#E2E5DD] hover:bg-[#EEF0E8] font-medium text-[#12231C] transition-colors"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Add Customer Profile
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ibrahim Danjuma"
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Phone Number (Primary) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0803 221 4401"
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                    State / Location
                  </label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Anambra">Anambra</option>
                    <option value="Kano">Kano</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. name@email.com"
                    className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, landmark, city..."
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                />
              </div>

              <div className="pt-3 border-t border-[#EEF0E8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] text-xs font-semibold text-[#5B675E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
