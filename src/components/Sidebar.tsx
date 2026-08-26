import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Users,
  Package,
  Boxes,
  UserCheck,
  Truck,
  Megaphone,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Layers,
  Store,
  CreditCard,
  Zap,
  ShieldCheck,
  Receipt,
  MessageSquare,
} from 'lucide-react';
import { User } from '../types';
import { getRepInitials } from '../utils/formatters';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  ordersCount: number;
  lowStockCount: number;
  onOpenRoundRobinModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers,
  ordersCount,
  lowStockCount,
}) => {
  const [showUserSwitcher, setShowUserSwitcher] = React.useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[#146B4E] text-[#E3F0E9] border-[#146B4E]';
      case 'sales_rep':
        return 'bg-[#2F5FA8]/30 text-[#E8EEF7] border-[#2F5FA8]/50';
      case 'inventory_manager':
        return 'bg-[#B9822A]/30 text-[#F6ECD8] border-[#B9822A]/50';
      default:
        return 'bg-white/10 text-white/80 border-white/20';
    }
  };

  const navItemClass = (tabName: string) => `
    w-full flex items-center justify-between px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all
    ${
      currentTab === tabName
        ? 'bg-[#146B4E] text-white font-semibold shadow-xs'
        : 'text-[#EEF0E8]/75 hover:text-white hover:bg-[#1e382d]'
    }
  `;

  return (
    <aside
      id="sidebar"
      className="w-64 shrink-0 bg-[#12231C] text-[#EEF0E8] border-r border-[#1e382d] flex flex-col justify-between h-screen sticky top-0 z-30 select-none"
    >
      {/* Top Workspace Selector */}
      <div className="p-3.5 border-b border-[#1e382d]">
        <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#0c1914] border border-[#1e382d]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-[6px] bg-[#146B4E] flex items-center justify-center text-white font-heading font-bold shadow-xs shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white font-heading truncate">
                  STEKENTSTORE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#146B4E]" />
              </div>
              <span className="text-[10px] text-[#D9CDA9]/80 font-mono block truncate">
                Lagos, Nigeria • Enterprise CRM
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#D9CDA9]/60 shrink-0" />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto custom-scrollbar">
        {/* OVERVIEW */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/60 font-heading">
            Overview
          </div>

          <button
            id="nav-btn-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={navItemClass('dashboard')}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Executive Hub</span>
            </div>
          </button>
        </div>

        {/* COMMERCE & INVENTORY */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/60 font-heading">
            Commerce & Stock
          </div>

          <button
            id="nav-btn-orders"
            onClick={() => setCurrentTab('orders')}
            className={navItemClass('orders')}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Orders Ledger</span>
            </div>
            {ordersCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                  currentTab === 'orders'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#1e382d] text-[#D9CDA9]'
                }`}
              >
                {ordersCount}
              </span>
            )}
          </button>

          <button
            id="nav-btn-customers"
            onClick={() => setCurrentTab('customers')}
            className={navItemClass('customers')}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Customers CRM</span>
            </div>
          </button>

          <button
            id="nav-btn-products"
            onClick={() => setCurrentTab('products')}
            className={navItemClass('products')}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span>Products Catalog</span>
            </div>
          </button>

          <button
            id="nav-btn-inventory"
            onClick={() => setCurrentTab('inventory')}
            className={navItemClass('inventory')}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-3.5 h-3.5 shrink-0" />
              <span>Inventory & Stock</span>
            </div>
            {lowStockCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#B33A3A] text-white">
                {lowStockCount} Low
              </span>
            )}
          </button>
        </div>

        {/* SALES & OPERATIONS */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/60 font-heading">
            Sales & Operations
          </div>

          <button
            id="nav-btn-sales"
            onClick={() => setCurrentTab('sales')}
            className={navItemClass('sales')}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Sales CRM</span>
            </div>
            <span className="text-[9px] font-mono text-[#146B4E] font-bold bg-[#E3F0E9] px-1 rounded">
              RR Pool
            </span>
          </button>

          <button
            id="nav-btn-delivery"
            onClick={() => setCurrentTab('delivery')}
            className={navItemClass('delivery')}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>Logistics & Courier</span>
            </div>
          </button>
        </div>

        {/* FINANCE & PAYROLL */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/60 font-heading">
            Finance & Payroll
          </div>

          <button
            id="nav-btn-finance"
            onClick={() => setCurrentTab('finance')}
            className={navItemClass('finance')}
          >
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>Finance & P&L</span>
            </div>
          </button>

          <button
            id="nav-btn-payroll"
            onClick={() => setCurrentTab('payroll')}
            className={navItemClass('payroll')}
          >
            <div className="flex items-center gap-2.5">
              <Receipt className="w-3.5 h-3.5 shrink-0" />
              <span>Payroll & Comm.</span>
            </div>
            <span className="text-[9px] font-mono text-[#D9CDA9] font-bold bg-[#1e382d] px-1 rounded">
              Auto
            </span>
          </button>

        {/* MARKETING & FUNNELS */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/60 font-heading">
            Funnel & Automation
          </div>

          <button
            id="nav-btn-forms"
            onClick={() => setCurrentTab('forms')}
            className={navItemClass('forms')}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Form Builder</span>
            </div>
            <span className="text-[9px] font-mono text-[#146B4E] font-bold bg-[#E3F0E9] px-1 rounded">
              Builder
            </span>
          </button>

          <button
            id="nav-btn-automations"
            onClick={() => setCurrentTab('automations')}
            className={navItemClass('automations')}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Automation Engine</span>
            </div>
            <span className="text-[9px] font-mono text-[#D9CDA9] font-bold bg-[#1e382d] px-1 rounded">
              Engine
            </span>
          </button>

          <button
            id="nav-btn-marketing"
            onClick={() => setCurrentTab('marketing')}
            className={navItemClass('marketing')}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>Ad Spend & ROAS</span>
            </div>
          </button>
        </div>
        </div>

        {/* AUDIT & SYSTEM */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/60 font-heading">
            Audit & System
          </div>

          <button
            id="nav-btn-reports"
            onClick={() => setCurrentTab('reports')}
            className={navItemClass('reports')}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Analytics & Reports</span>
            </div>
          </button>

          <button
            id="nav-btn-audit"
            onClick={() => setCurrentTab('audit')}
            className={navItemClass('audit')}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Audit Trail Logs</span>
            </div>
          </button>

          <button
            id="nav-btn-settings"
            onClick={() => setCurrentTab('settings')}
            className={navItemClass('settings')}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>System Settings</span>
            </div>
          </button>
        </div>

        {/* Action Button: Create Order */}
        <div className="pt-1">
          <button
            id="nav-btn-create-order"
            onClick={() => setCurrentTab('create-order')}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[6px] text-xs font-semibold transition-all ${
              currentTab === 'create-order'
                ? 'bg-white text-[#12231C] shadow-sm'
                : 'bg-[#146B4E] hover:bg-[#0f553e] text-white shadow-xs'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* User Section / Quick Switcher */}
      <div className="p-3 border-t border-[#1e382d] bg-[#0c1914] relative">
        {currentUser ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#D9CDA9]/70 font-heading">
                Staff Identity
              </span>
              <button
                id="btn-toggle-switch-user"
                onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                className="text-[11px] text-[#D9CDA9] hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                Switch
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
                    showUserSwitcher ? 'rotate-90' : ''
                  }`}
                />
              </button>
            </div>

            {/* Current user card */}
            <div className="p-2 rounded-[6px] bg-[#12231C] border border-[#1e382d] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-[4px] bg-[#146B4E] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                  {getRepInitials(currentUser.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {currentUser.name}
                  </div>
                  <span
                    className={`inline-block text-[9px] px-1 py-0.2 rounded font-mono uppercase tracking-wider ${getRoleBadge(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                id="btn-logout-sidebar"
                onClick={onLogout}
                title="Sign out"
                className="p-1 text-[#D9CDA9] hover:text-[#B33A3A] rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Switch Dropdown */}
            {showUserSwitcher && (
              <div className="absolute bottom-full left-3 right-3 mb-2 p-1.5 bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] shadow-lg space-y-1 z-50 text-[#12231C]">
                <div className="text-[10px] font-semibold uppercase px-2 py-1 text-[#5B675E] font-heading border-b border-[#EEF0E8]">
                  Select Staff Persona
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      id={`switch-user-${user.id}`}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowUserSwitcher(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-xs flex items-center justify-between transition-colors ${
                        user.id === currentUser.id
                          ? 'bg-[#E3F0E9] text-[#146B4E] font-semibold'
                          : 'text-[#12231C] hover:bg-[#EEF0E8]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-[#12231C]">{user.name}</div>
                        <div className="text-[10px] text-[#5B675E] capitalize font-mono">
                          {user.role.replace('_', ' ')}
                        </div>
                      </div>
                      {user.id === currentUser.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#146B4E]"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="btn-go-to-login"
            onClick={() => setCurrentTab('login')}
            className="w-full py-2 px-3 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white shadow-xs transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};
