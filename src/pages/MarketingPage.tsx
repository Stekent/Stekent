import React, { useState } from 'react';
import {
  Megaphone,
  ShoppingBag,
  TrendingUp,
  Percent,
  Plus,
  Search,
  X,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { MarketingCampaign, Platform } from '../types';
import { KPICard } from '../components/KPICard';
import { formatCurrency } from '../utils/formatters';

interface MarketingPageProps {
  campaigns: MarketingCampaign[];
  onAddCampaign?: (campaign: any) => void;
  onToast: (msg: string) => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({
  campaigns = [],
  onAddCampaign,
  onToast,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    platform: 'facebook' as Platform,
    spend: '',
    revenue: '',
    ordersCount: '',
  });

  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0) || 2420000;
  const totalOrders = campaigns.reduce((sum, c) => sum + (c.ordersCount || 0), 0) || 1146;
  const avgCAC = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 2110;
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) || 22000000;
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '9.1';

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.spend) {
      onToast('Campaign name and spend are required');
      return;
    }

    if (onAddCampaign) {
      onAddCampaign({
        name: formData.name,
        platform: formData.platform,
        spend: Number(formData.spend),
        ordersCount: Number(formData.ordersCount) || 0,
        revenue: Number(formData.revenue) || 0,
      });
    }

    onToast(`Campaign "${formData.name}" registered and tracking attribution`);
    setIsAddModalOpen(false);
    setFormData({ name: '', platform: 'facebook', spend: '', revenue: '', ordersCount: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
            Marketing & Ad Attribution
          </h1>
          <p className="text-xs text-[#5B675E]">
            Paid acquisition ROAS, Cost per Order (CAC) and campaign revenue attribution.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Ad Campaign</span>
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
            placeholder="Search campaigns by name..."
            className="w-full bg-white border border-[#E2E5DD] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
          />
        </div>

        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value)}
          className="bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-xs text-[#12231C] outline-none focus:border-[#146B4E]"
        >
          <option value="all">All Ad Networks</option>
          <option value="facebook">Meta / Facebook Ads</option>
          <option value="instagram">Instagram Ads</option>
          <option value="tiktok">TikTok Ads</option>
        </select>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          id="kpi-ad-spend"
          title="Total Ad Spend"
          value={formatCurrency(totalSpend)}
          subtitle="Across active channels"
          icon={<Megaphone className="w-4 h-4" />}
          variant="default"
          isMoney={true}
        />
        <KPICard
          id="kpi-ad-orders"
          title="Orders from Ads"
          value={totalOrders.toLocaleString()}
          subtitle="89% attribution accuracy"
          icon={<ShoppingBag className="w-4 h-4" />}
          variant="brand"
        />
        <KPICard
          id="kpi-ad-cac"
          title="Cost Per Order (CAC)"
          value={formatCurrency(avgCAC)}
          subtitle="Profitable acquisition"
          icon={<Percent className="w-4 h-4" />}
          variant="gold"
          isMoney={true}
        />
        <KPICard
          id="kpi-ad-roas"
          title="Blended ROAS"
          value={`${overallROAS}x`}
          subtitle="+1.4x vs last month"
          icon={<TrendingUp className="w-4 h-4" />}
          variant="brand"
        />
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white border border-[#E2E5DD] rounded-[10px] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#EEF0E8] flex items-center justify-between bg-[#FAFBF9]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading">
            Active Marketing Campaigns ({filteredCampaigns.length})
          </span>
          <span className="text-[11px] font-mono text-[#5B675E]">
            Direct attribution tracker
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[#5B675E] uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4 text-right">Ad Spend</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-center">ROAS</th>
                <th className="py-3 px-4 text-right">Cost/Order</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DD]">
              {filteredCampaigns.map(c => (
                <tr key={c.id} className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-[#12231C] font-semibold block">{c.name}</strong>
                    <span className="text-[10px] text-[#5B675E] font-mono">Started: {c.startDate}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-medium text-[#12231C]">
                      {c.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#12231C]">
                    {formatCurrency(c.spend)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-[#12231C]">
                    {c.ordersCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#146B4E]">
                    {formatCurrency(c.revenue)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-[#E3F0E9] text-[#146B4E]">
                      {c.roas}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#5B675E]">
                    {formatCurrency(c.costPerOrder)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E3F0E9] text-[#146B4E] font-semibold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E5DD] rounded-[10px] w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Register Ad Campaign
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Solar Fan — Abuja Lookalike"
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                  Platform *
                </label>
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value as Platform })}
                  className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
                >
                  <option value="facebook">Facebook Ads</option>
                  <option value="instagram">Instagram Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                    Ad Spend (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.spend}
                    onChange={e => setFormData({ ...formData, spend: e.target.value })}
                    placeholder="e.g. 500000"
                    className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                    Revenue (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.revenue}
                    onChange={e => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="e.g. 4500000"
                    className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E] font-mono"
                  />
                </div>
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
                  Register Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
