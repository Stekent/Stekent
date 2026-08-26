import React, { useState } from 'react';
import {
  PlusCircle,
  RotateCw,
  RefreshCw,
  Search,
  ChevronRight,
  Bell,
  ExternalLink,
  ShoppingBag,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react';
import { RoundRobinState, Order, Product } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  roundRobinState: RoundRobinState | null;
  orders?: Order[];
  products?: Product[];
  onOpenCreateOrder: () => void;
  onOpenRoundRobinModal: () => void;
  onOpenPublicOrderForm?: () => void;
  onNavigateTab?: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  roundRobinState,
  orders = [],
  products = [],
  onOpenCreateOrder,
  onOpenRoundRobinModal,
  onOpenPublicOrderForm,
  onNavigateTab,
  onRefresh,
  isRefreshing,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Attempted');
  const lowStockItems = products.filter(p => p.stock <= (p.reorderLevel || 10));
  const unassignedOrders = orders.filter(o => !o.assignedRepId);

  const notificationCount = pendingOrders.length + lowStockItems.length;

  return (
    <header
      id="app-header"
      className="h-14 border-b border-[#E2E5DD] bg-[#FFFFFF] px-5 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-[#5B675E]">Stekentstore</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#5B675E]" />
        <h2 className="font-bold text-[#12231C] font-heading text-sm">
          {title}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Live Public Checkout Form Launcher */}
        {onOpenPublicOrderForm && (
          <button
            onClick={onOpenPublicOrderForm}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#FAFBF9] border border-[#E2E5DD] hover:border-[#146B4E] text-[11px] font-semibold text-[#12231C] transition-colors"
            title="Open customer-facing embeddable COD order checkout modal"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#146B4E]" />
            <span>Public Checkout Form</span>
            <ExternalLink className="w-3 h-3 text-[#5B675E]" />
          </button>
        )}

        {/* Round Robin status pill */}
        {roundRobinState && (
          <button
            id="header-rr-pill"
            onClick={onOpenRoundRobinModal}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FAFBF9] border border-[#E2E5DD] hover:border-[#146B4E] text-[11px] text-[#12231C] transition-colors group cursor-pointer"
            title="Continuous Round-Robin Dispatcher Status"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#146B4E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#146B4E]"></span>
            </span>
            <span className="text-[#5B675E]">Next rep:</span>
            <span className="font-semibold text-[#146B4E] font-mono">
              {roundRobinState.nextRep?.name || 'Ready in Pool'}
            </span>
            <RotateCw className="w-3 h-3 text-[#5B675E] group-hover:text-[#146B4E] transition-colors ml-0.5" />
          </button>
        )}

        {/* Notifications Center */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Activity Notifications"
            className="p-1.5 rounded-[6px] border border-[#E2E5DD] bg-[#FFFFFF] hover:bg-[#EEF0E8] text-[#5B675E] hover:text-[#12231C] transition-colors relative"
          >
            <Bell className="w-3.5 h-3.5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B33A3A] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E5DD] rounded-[10px] shadow-xl z-50 text-xs text-[#12231C] overflow-hidden animate-in fade-in">
              <div className="p-3 bg-[#FAFBF9] border-b border-[#EEF0E8] flex justify-between items-center font-heading font-bold text-xs">
                <span>System Notifications</span>
                <span className="text-[10px] text-[#146B4E] font-mono">{notificationCount} Pending Items</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#EEF0E8] p-1">
                {pendingOrders.length > 0 && (
                  <div
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('sales');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 hover:bg-[#FAFBF9] cursor-pointer rounded-[6px] transition-colors flex items-start gap-2.5"
                  >
                    <Clock className="w-4 h-4 text-[#B9822A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#12231C]">{pendingOrders.length} Orders Awaiting Call</div>
                      <div className="text-[11px] text-[#5B675E]">Follow-up queue needs rep confirmation</div>
                    </div>
                  </div>
                )}

                {lowStockItems.length > 0 && (
                  <div
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('inventory');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 hover:bg-[#FAFBF9] cursor-pointer rounded-[6px] transition-colors flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#B33A3A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#12231C]">{lowStockItems.length} Low Stock Alerts</div>
                      <div className="text-[11px] text-[#5B675E]">{lowStockItems?.[0]?.name || 'Catalog Item'} is below threshold</div>
                    </div>
                  </div>
                )}

                <div
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('sales');
                    setShowNotifications(false);
                  }}
                  className="p-2.5 hover:bg-[#FAFBF9] cursor-pointer rounded-[6px] transition-colors flex items-start gap-2.5"
                >
                  <ShoppingBag className="w-4 h-4 text-[#146B4E] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#12231C]">Sales CRM & Round-Robin Active</div>
                    <div className="text-[11px] text-[#5B675E]">Continuous lead routing & confirmation pool</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sync / Refresh Button */}
        <button
          id="btn-sync-data"
          onClick={onRefresh}
          title="Synchronize real-time state"
          className="p-1.5 rounded-[6px] border border-[#E2E5DD] bg-[#FFFFFF] hover:bg-[#EEF0E8] text-[#5B675E] hover:text-[#12231C] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Create Order Button */}
        <button
          id="btn-header-create-order"
          onClick={onOpenCreateOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Order</span>
        </button>
      </div>
    </header>
  );
};
