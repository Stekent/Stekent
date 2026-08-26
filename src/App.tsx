import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  User,
  Product,
  Order,
  OrderStatus,
  RoundRobinState,
  CRMStats,
  CreateOrderPayload,
  CreateProductPayload,
  Customer,
  MarketingCampaign,
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OrderDrawer } from './components/OrderDrawer';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { MarketingPage } from './pages/MarketingPage';
import { FinancePage } from './pages/FinancePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { LoginPage } from './pages/LoginPage';
import { PayrollPage } from './pages/PayrollPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { FormBuilderPage } from './pages/FormBuilderPage';
import { AutomationEnginePage } from './pages/AutomationEnginePage';
import { OrderTimelineModal } from './components/OrderTimelineModal';
import { RoundRobinModal } from './components/RoundRobinModal';
import { PublicOrderFormModal } from './components/PublicOrderFormModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roundRobinState, setRoundRobinState] = useState<RoundRobinState | null>(null);
  const [stats, setStats] = useState<CRMStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<Order | null>(null);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [isRoundRobinModalOpen, setIsRoundRobinModalOpen] = useState(false);
  const [isPublicOrderModalOpen, setIsPublicOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all core data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [
        fetchedUsers,
        fetchedProducts,
        fetchedCustomers,
        fetchedOrders,
        fetchedCampaigns,
        fetchedRR,
        fetchedStats,
      ] = await Promise.all([
        api.getUsers(),
        api.getProducts(),
        api.getCustomers(),
        api.getOrders(),
        api.getCampaigns(),
        api.getRoundRobinState(),
        api.getStats(),
      ]);

      setUsers(fetchedUsers);
      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
      setOrders(fetchedOrders);
      setCampaigns(fetchedCampaigns);
      setRoundRobinState(fetchedRR);
      setStats(fetchedStats);

      // Keep drawer in sync if open
      if (drawerOrder) {
        const fresh = fetchedOrders.find(o => o.id === drawerOrder.id);
        if (fresh) setDrawerOrder(fresh);
      }

      // Set default user if not logged in
      if (!currentUser && fetchedUsers.length > 0) {
        const defaultAdmin = fetchedUsers.find(u => u.role === 'admin') || fetchedUsers[0];
        setCurrentUser(defaultAdmin);
      }
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser, drawerOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Order Creation
  const handleCreateOrder = async (payload: CreateOrderPayload) => {
    const res = await api.createOrder(payload, currentUser?.id);
    await loadData(true);
    showToast(`Order ${res.order.orderNumber} created and assigned to ${res.order.assignedRep?.name || 'sales rep'}`);
    return res;
  };

  // Handle Product Creation
  const handleAddProduct = async (payload: CreateProductPayload) => {
    await api.createProduct(payload);
    await loadData(true);
    showToast(`Product ${payload.name} added to catalog`);
  };

  // Handle Campaign Creation
  const handleAddCampaign = async (payload: any) => {
    await api.createCampaign(payload);
    await loadData(true);
  };

  // Handle Manual Order Reassignment (Does NOT affect round robin sequence)
  const handleReassignOrder = async (orderId: string, newRepId: string) => {
    await api.reassignOrder(orderId, newRepId, currentUser?.id);
    await loadData(true);
    showToast('Order reassigned successfully');
  };

  // Handle Status Updates
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    await api.updateOrderStatus(orderId, status, note, currentUser?.id);
    await loadData(true);
  };

  // Reset database seed
  const handleResetSeed = async () => {
    setRefreshing(true);
    try {
      await api.resetSeed();
      await loadData(false);
      showToast('Database reset to initial demo state');
    } catch (err) {
      console.error('Failed to reset seed:', err);
      showToast('Failed to reset seed');
    } finally {
      setRefreshing(false);
    }
  };

  // Page title mapping
  const getHeaderDetails = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Executive Hub',
          subtitle: 'Enterprise ecommerce command center • The Manifest System',
        };
      case 'orders':
        return {
          title: 'Orders Ledger',
          subtitle: 'Active POD deliveries, customer records, and sales rep assignments',
        };
      case 'customers':
        return {
          title: 'Customers Directory',
          subtitle: 'Centralized customer profiles, locations and purchase history',
        };
      case 'products':
        return {
          title: 'Products Catalog',
          subtitle: 'Manage catalog SKUs, unit margins, and inventory thresholds',
        };
      case 'inventory':
        return {
          title: 'Inventory & Stock In',
          subtitle: 'Track warehouse stock levels, reservations and physical movements',
        };
      case 'sales':
        return {
          title: 'Sales CRM & Dispatch Pool',
          subtitle: 'Follow-up queue, call logs, rep conversion and performance leaderboard',
        };
      case 'delivery':
        return {
          title: 'Logistics & Courier Board',
          subtitle: 'Waybills, Proof of Delivery (POD) logs, and COD cash remittance ledger',
        };
      case 'forms':
        return {
          title: 'Form Builder',
          subtitle: 'Visual "Elementor + WPForms" competitor with Multi-Step, Order Bumps, Quantity Tiers & Direct COD Checkout',
        };
      case 'automations':
        return {
          title: 'Automation Engine',
          subtitle: 'Built-in Zapier/Make/n8n Engine: WhatsApp, SMS, Rep Assignment, Webhooks & Google Sheets',
        };
      case 'marketing':
        return {
          title: 'Marketing & Attribution',
          subtitle: 'Paid acquisition ROAS, Cost per Order and campaign revenue',
        };
      case 'finance':
        return {
          title: 'Finance & P&L Statement',
          subtitle: 'Profit & Loss waterfall, COGS, delivery costs, and courier reconciliation',
        };
      case 'payroll':
        return {
          title: 'Staff Payroll & Commissions',
          subtitle: 'Per-order confirmation, delivered commissions, and itemized payslips',
        };
      case 'audit':
        return {
          title: 'Activity & Audit Trail Logs',
          subtitle: 'Immutable system audit trail tracking order state changes and actions',
        };
      case 'reports':
        return {
          title: 'Analytics Suite & Reports',
          subtitle: 'Executive intelligence dashboards and compliance export sheets (.CSV)',
        };
      case 'settings':
        return {
          title: 'Workspace Settings',
          subtitle: 'Configure store parameters, dispatch triggers and external webhooks',
        };
      case 'create-order':
        return {
          title: 'Manual Order Creation',
          subtitle: 'Record customer details, deduct stock, and dispatch via round-robin',
        };
      default:
        return {
          title: 'STEKENTSTORE CRM',
          subtitle: 'The Manifest System',
        };
    }
  };

  const lowStockCount = products.filter(p => p.stock <= (p.reorderLevel || 10)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF0E8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#146B4E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5B675E] font-heading tracking-wider uppercase">
            Loading STEKENTSTORE CRM...
          </p>
        </div>
      </div>
    );
  }

  // If user navigated to login tab
  if (currentTab === 'login') {
    return (
      <LoginPage
        onLoginSuccess={user => {
          setCurrentUser(user);
          setCurrentTab('dashboard');
          showToast(`Signed in as ${user.name}`);
        }}
        availableUsers={users}
      />
    );
  }

  const { title, subtitle } = getHeaderDetails();

  return (
    <div className="flex min-h-screen bg-[#EEF0E8] text-[#12231C] antialiased font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-[8px] bg-[#12231C] border border-[#146B4E] text-[#EEF0E8] text-xs shadow-2xl flex items-center gap-2.5 transition-all">
          <CheckCircle2 className="w-4 h-4 text-[#146B4E] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentTab('login');
        }}
        onSwitchUser={user => {
          setCurrentUser(user);
          showToast(`Switched staff persona to ${user.name}`);
        }}
        allUsers={users}
        ordersCount={orders.length}
        lowStockCount={lowStockCount}
        onOpenRoundRobinModal={() => setIsRoundRobinModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          roundRobinState={roundRobinState}
          orders={orders}
          products={products}
          onOpenCreateOrder={() => setCurrentTab('create-order')}
          onOpenRoundRobinModal={() => setIsRoundRobinModalOpen(true)}
          onOpenPublicOrderForm={() => setIsPublicOrderModalOpen(true)}
          onNavigateTab={tab => setCurrentTab(tab)}
          onRefresh={() => {
            loadData(false);
            showToast('CRM data synchronized');
          }}
          isRefreshing={refreshing}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              orders={orders}
              products={products}
              users={users}
              stats={stats}
              onOpenOrderDrawer={order => setDrawerOrder(order)}
              onNavigate={tab => setCurrentTab(tab)}
              onOpenCreateOrder={() => setCurrentTab('create-order')}
              onToast={showToast}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersPage
              orders={orders}
              allUsers={users}
              currentUser={currentUser}
              stats={stats}
              onReassignOrder={handleReassignOrder}
              onUpdateStatus={handleUpdateStatus}
              onSelectOrderTimeline={order => setSelectedTimelineOrder(order)}
              onOpenOrderDrawer={order => setDrawerOrder(order)}
              onOpenCreateOrder={() => setCurrentTab('create-order')}
              onToast={showToast}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              customers={customers}
              onToast={showToast}
            />
          )}

          {currentTab === 'products' && (
            <ProductsPage
              products={products}
              onAddProduct={handleAddProduct}
              onRefresh={() => loadData(true)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryPage
              products={products}
              onToast={showToast}
            />
          )}

          {currentTab === 'sales' && (
            <SalesPage
              users={users}
              orders={orders}
              currentUser={currentUser}
              roundRobinState={roundRobinState}
              onOpenRoundRobinModal={() => setIsRoundRobinModalOpen(true)}
              onOpenOrderDrawer={order => setDrawerOrder(order)}
              onToast={showToast}
            />
          )}

          {currentTab === 'delivery' && (
            <DeliveryPage
              orders={orders}
              currentUser={currentUser}
              onOpenOrderDrawer={order => setDrawerOrder(order)}
              onToast={showToast}
              onRefreshOrders={() => loadData(true)}
            />
          )}

          {currentTab === 'forms' && (
            <FormBuilderPage />
          )}

          {currentTab === 'automations' && (
            <AutomationEnginePage />
          )}

          {currentTab === 'marketing' && (
            <MarketingPage
              campaigns={campaigns}
              onAddCampaign={handleAddCampaign}
              onToast={showToast}
            />
          )}

          {currentTab === 'finance' && (
            <FinancePage
              stats={stats}
              onToast={showToast}
            />
          )}

          {currentTab === 'payroll' && (
            <PayrollPage
              currentUser={currentUser}
              onToast={showToast}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLogsPage
              onToast={showToast}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              orders={orders}
              products={products}
              users={users}
              stats={stats}
              onToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              onResetSeed={handleResetSeed}
              onToast={showToast}
            />
          )}

          {currentTab === 'create-order' && (
            <CreateOrderPage
              products={products}
              roundRobinState={roundRobinState}
              onCreateOrder={handleCreateOrder}
              onViewOrders={() => setCurrentTab('orders')}
              onRefreshData={() => loadData(true)}
            />
          )}
        </main>
      </div>

      {/* Slide-out Order Details Drawer */}
      <OrderDrawer
        order={drawerOrder}
        isOpen={!!drawerOrder}
        onClose={() => setDrawerOrder(null)}
        allUsers={users}
        onUpdateStatus={handleUpdateStatus}
        onReassignOrder={handleReassignOrder}
        onToast={showToast}
      />

      {/* Modals */}
      {selectedTimelineOrder && (
        <OrderTimelineModal
          order={selectedTimelineOrder}
          onClose={() => setSelectedTimelineOrder(null)}
        />
      )}

      {isRoundRobinModalOpen && (
        <RoundRobinModal
          state={roundRobinState}
          onClose={() => setIsRoundRobinModalOpen(false)}
        />
      )}

      {/* Public Embeddable Order Form Simulator */}
      {isPublicOrderModalOpen && (
        <PublicOrderFormModal
          isOpen={isPublicOrderModalOpen}
          products={products}
          roundRobinState={roundRobinState}
          onSubmitOrder={handleCreateOrder}
          onClose={() => setIsPublicOrderModalOpen(false)}
          onToast={showToast}
        />
      )}
    </div>
  );
}
