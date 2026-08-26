import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Link2,
  Database,
  RotateCcw,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface SettingsPageProps {
  onResetSeed: () => void;
  onToast: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetSeed,
  onToast,
}) => {
  const [storeName, setStoreName] = useState('Stekentstore Nigeria');
  const [currency, setCurrency] = useState('NGN (₦)');
  const [timezone, setTimezone] = useState('Africa/Lagos (GMT+1)');

  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoRoundRobin, setAutoRoundRobin] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://stekentstorecrm.app/api/webhooks/orders');

  const handleCopyWebhook = () => {
    navigator.clipboard?.writeText(webhookUrl);
    onToast('Webhook endpoint copied to clipboard');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onToast('Workspace configuration updated');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#12231C] font-heading tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs text-[#5B675E]">
          Configure your ecommerce store parameters, dispatch triggers and external webhooks.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Store Profile */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#146B4E]" /> Store Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                Store / Entity Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-white border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 outline-none focus:border-[#146B4E]"
              >
                <option value="NGN (₦)">NGN (₦) — Nigerian Naira</option>
                <option value="GHS (GH₵)">GHS (GH₵) — Ghanaian Cedi</option>
                <option value="USD ($)">USD ($) — US Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B675E] mb-1">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value={timezone}
                className="w-full bg-[#FAFBF9] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 text-[#5B675E]"
              />
            </div>
          </div>
        </div>

        {/* Automation Triggers */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#2F5FA8]" /> Dispatch & Notification Automations
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] cursor-pointer">
              <div>
                <strong className="text-xs text-[#12231C] block">WhatsApp Customer Confirmation Alert</strong>
                <span className="text-[11px] text-[#5B675E]">Automatically generate WhatsApp direct link with order recap</span>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={e => setWhatsappNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#146B4E]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] cursor-pointer">
              <div>
                <strong className="text-xs text-[#12231C] block">Automated Continuous Round-Robin</strong>
                <span className="text-[11px] text-[#5B675E]">Auto-assign inbound orders to the next available sales rep</span>
              </div>
              <input
                type="checkbox"
                checked={autoRoundRobin}
                onChange={e => setAutoRoundRobin(e.target.checked)}
                className="w-4 h-4 accent-[#146B4E]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[8px] bg-[#FAFBF9] border border-[#E2E5DD] cursor-pointer">
              <div>
                <strong className="text-xs text-[#12231C] block">SMS Waybill Tracking Updates</strong>
                <span className="text-[11px] text-[#5B675E]">Send SMS to customers when courier rider takes package</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#146B4E]"
              />
            </label>
          </div>
        </div>

        {/* Webhooks Intake */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E2E5DD] shadow-xs space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231C] font-heading flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-[#B9822A]" /> Inbound Form Webhook
          </h3>

          <p className="text-[#5B675E] text-xs">
            Connect external landing page forms (Elementor, ClickFunnels, Leadpages) directly into this CRM:
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 bg-[#FAFBF9] border border-[#E2E5DD] rounded-[6px] px-3 py-1.5 font-mono text-xs text-[#12231C]"
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-3 py-1.5 rounded-[6px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] font-semibold text-xs text-[#12231C] flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </form>

      {/* Danger Zone: Seed Reset */}
      <div className="p-5 rounded-[10px] bg-[#F8E7E5]/30 border border-[#F0BCB8] space-y-3 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#B33A3A] font-heading flex items-center gap-1.5">
          <Database className="w-4 h-4 text-[#B33A3A]" /> Database Demo Reset
        </h3>
        <p className="text-[#5B675E] text-xs">
          Reset all orders, inventory counts, round-robin queues and sales metrics back to the initial demo state.
        </p>

        <button
          onClick={onResetSeed}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-[#B33A3A] hover:bg-[#F8E7E5] text-[#B33A3A] text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Database</span>
        </button>
      </div>
    </div>
  );
};
