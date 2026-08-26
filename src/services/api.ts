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
  RepPerformance,
  CallLog,
  CallOutcome,
  AuditLog,
  CourierPartner,
  CommissionRules,
  PayrollRecord,
  PayrollPeriod,
  CourierRemittance,
  AutomationTemplate,
  AppNotification,
  WebhookLog,
  CustomForm,
  FormSubmissionPayload,
  AutomationWorkflow,
  AutomationExecutionLog,
} from '../types';

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
    return data.logs;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch customers');
    return data.customers;
  },

  // Rep Performances Leaderboard
  async getRepPerformances(): Promise<RepPerformance[]> {
    const res = await fetch('/api/reps/performance');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch rep performances');
    return data.performances;
  },

  // Marketing Campaigns
  async getCampaigns(): Promise<MarketingCampaign[]> {
    const res = await fetch('/api/campaigns');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch campaigns');
    return data.campaigns;
  },

  async createCampaign(payload: {
    name: string;
    platform: string;
    spend: number;
    ordersCount?: number;
    revenue?: number;
    status?: 'Active' | 'Paused';
  }): Promise<MarketingCampaign> {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
    return data.campaign;
  },

  // Products & Inventory
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data.products;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data.product;
  },

  async adjustStock(productId: string, delta: number, reason: string, userId?: string): Promise<Product> {
    const res = await fetch(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, reason, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to adjust stock');
    return data.product;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
    return data.orders;
  },

  async createOrder(payload: CreateOrderPayload, changedByUserId?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, changedByUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create order');
    return data;
  },

  async reassignOrder(orderId: string, newRepId: string, changedByUserId?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${orderId}/reassign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newRepId, changedByUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reassign order');
    return data;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    changedByUserId?: string
  ): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, changedByUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data;
  },

  async updateOrder(
    orderId: string,
    updates: {
      status?: OrderStatus;
      courierName?: string;
      courier?: CourierPartner;
      waybillNumber?: string;
      shippingFee?: number;
      expectedDeliveryDate?: string;
      proofOfDeliveryNote?: string;
      failureReason?: string;
      changedByUserId?: string;
    }
  ): Promise<{ order: Order }> {
    if (updates.courierName || updates.waybillNumber || updates.courier) {
      await this.assignCourier(
        orderId,
        (updates.courier || updates.courierName || 'GIG Logistics') as CourierPartner,
        updates.waybillNumber || `WB-${Date.now().toString().slice(-6)}`,
        updates.shippingFee,
        updates.expectedDeliveryDate,
        updates.changedByUserId
      );
    }

    if (updates.status === 'Delivered' || updates.status === 'Returned' || updates.status === 'Failed') {
      return this.recordDeliveryOutcome(
        orderId,
        updates.status === 'Delivered' ? 'Delivered' : updates.status === 'Returned' ? 'Returned' : 'Failed',
        updates.proofOfDeliveryNote,
        updates.failureReason,
        updates.changedByUserId
      );
    } else if (updates.status) {
      return this.updateOrderStatus(orderId, updates.status, updates.proofOfDeliveryNote, updates.changedByUserId);
    }

    const res = await fetch(`/api/orders`);
    const data = await res.json();
    const order = data.orders.find((o: Order) => o.id === orderId);
    return { order };
  },

  async assignCourier(
    orderId: string,
    courier: CourierPartner,
    waybillNumber: string,
    shippingFee?: number,
    expectedDeliveryDate?: string,
    changedByUserId?: string
  ): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${orderId}/courier`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courier, waybillNumber, shippingFee, expectedDeliveryDate, changedByUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign courier');
    return data;
  },

  async recordDeliveryOutcome(
    orderId: string,
    status: 'Delivered' | 'Failed' | 'Returned',
    podNotes?: string,
    failureReason?: string,
    changedByUserId?: string
  ): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/delivery-outcome`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, podNotes, failureReason, changedByUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record delivery outcome');
    return data;
  },

  // Calls & Follow-up Queue
  async logCall(
    orderIdOrPayload: string | { orderId: string; repId: string; outcome: CallOutcome; note?: string; scheduledFollowUp?: string | null },
    repId?: string,
    outcome?: CallOutcome,
    note?: string,
    scheduledFollowUpAt?: string | null
  ): Promise<{ call: CallLog; order: Order }> {
    let payload: { orderId: string; repId: string; outcome: CallOutcome; note?: string; scheduledFollowUpAt?: string | null };

    if (typeof orderIdOrPayload === 'object') {
      payload = {
        orderId: orderIdOrPayload.orderId,
        repId: orderIdOrPayload.repId,
        outcome: orderIdOrPayload.outcome,
        note: orderIdOrPayload.note,
        scheduledFollowUpAt: orderIdOrPayload.scheduledFollowUp,
      };
    } else {
      payload = {
        orderId: orderIdOrPayload,
        repId: repId!,
        outcome: outcome!,
        note,
        scheduledFollowUpAt,
      };
    }

    const res = await fetch(`/api/orders/${payload.orderId}/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to log call');
    return data;
  },

  async getCallLogs(orderId?: string): Promise<CallLog[]> {
    const url = orderId ? `/api/call-logs?orderId=${encodeURIComponent(orderId)}` : '/api/call-logs';
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch call logs');
    return data.calls;
  },

  async getFollowUps(repId?: string): Promise<Order[]> {
    const url = repId ? `/api/follow-ups?repId=${encodeURIComponent(repId)}` : '/api/follow-ups';
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch follow-ups');
    return data.followUps;
  },

  // Payroll & Commissions
  async getCommissionRules(): Promise<CommissionRules> {
    const res = await fetch('/api/payroll/rules');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch commission rules');
    return data.rules;
  },

  async updateCommissionRules(rules: Partial<CommissionRules>, adminUserId?: string): Promise<CommissionRules> {
    const res = await fetch('/api/payroll/rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rules, adminUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update commission rules');
    return data.rules;
  },

  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    const res = await fetch('/api/payroll/periods');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch payroll periods');
    return data.periods;
  },

  async getPayrollRecords(periodId?: string): Promise<PayrollRecord[]> {
    const url = periodId ? `/api/payroll/records?periodId=${encodeURIComponent(periodId)}` : '/api/payroll/records';
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch payroll records');
    return data.records;
  },

  async approvePayroll(recordId: string, adminUserId?: string): Promise<PayrollRecord> {
    const res = await fetch(`/api/payroll/records/${recordId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve payroll');
    return data.record;
  },

  async markPayrollPaid(recordId: string, adminUserId?: string): Promise<PayrollRecord> {
    const res = await fetch(`/api/payroll/records/${recordId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark payroll paid');
    return data.record;
  },

  // Courier Remittances
  async getRemittances(): Promise<CourierRemittance[]> {
    const res = await fetch('/api/remittances');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch remittances');
    return data.remittances;
  },

  async getCourierRemittances(): Promise<CourierRemittance[]> {
    return this.getRemittances();
  },

  async reconcileRemittance(id: string, adminUserId?: string): Promise<CourierRemittance> {
    const res = await fetch(`/api/remittances/${id}/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reconcile remittance');
    return data.remittance;
  },

  async settleCourierRemittance(id: string, adminUserId?: string): Promise<CourierRemittance> {
    return this.reconcileRemittance(id, adminUserId);
  },

  // Automations & WhatsApp
  async getAutomationTemplates(): Promise<AutomationTemplate[]> {
    const res = await fetch('/api/automations/templates');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch templates');
    return data.templates;
  },

  async updateAutomationTemplate(id: string, content: string, active?: boolean): Promise<AutomationTemplate> {
    const res = await fetch(`/api/automations/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, active }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update template');
    return data.template;
  },

  async getMessagePreview(templateId: string, orderId: string): Promise<string> {
    const res = await fetch('/api/automations/message-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, orderId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to preview message');
    return data.message;
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return data.notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  // Webhooks
  async triggerWebhookTest(source: 'woocommerce' | 'shopify' | 'custom', payload: any): Promise<any> {
    const endpoint = `/api/webhooks/${source === 'woocommerce' ? 'woocommerce' : source === 'shopify' ? 'shopify' : 'orders'}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Webhook test failed');
    return data;
  },

  async getWebhookLogs(): Promise<WebhookLog[]> {
    const res = await fetch('/api/webhooks/logs');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch webhook logs');
    return data.logs;
  },

  // Form Builder API ("Elementor + WPForms" Competitor)
  async getForms(): Promise<CustomForm[]> {
    const res = await fetch('/api/forms');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch forms');
    return data.forms || [];
  },

  async getForm(id: string): Promise<CustomForm> {
    const res = await fetch(`/api/forms/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch form');
    return data.form;
  },

  async getFormBySlug(slug: string): Promise<CustomForm> {
    const res = await fetch(`/api/forms/slug/${slug}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch form by slug');
    return data.form;
  },

  async createForm(payload: Partial<CustomForm>): Promise<CustomForm> {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create form');
    return data.form;
  },

  async updateForm(id: string, payload: Partial<CustomForm>): Promise<CustomForm> {
    const res = await fetch(`/api/forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update form');
    return data.form;
  },

  async deleteForm(id: string): Promise<void> {
    const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete form');
  },

  async recordFormView(id: string): Promise<void> {
    await fetch(`/api/forms/${id}/view`, { method: 'POST' });
  },

  async submitForm(id: string, payload: FormSubmissionPayload): Promise<{
    success: boolean;
    order: Order;
    customer: Customer;
    form: CustomForm;
    executionLogs: AutomationExecutionLog[];
    message: string;
  }> {
    const res = await fetch(`/api/forms/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Form submission failed');
    return data;
  },

  // Automation Engine API ("Zapier / Make / n8n" Competitor)
  async getWorkflows(): Promise<AutomationWorkflow[]> {
    const res = await fetch('/api/workflows');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch workflows');
    return data.workflows || [];
  },

  async getWorkflow(id: string): Promise<AutomationWorkflow> {
    const res = await fetch(`/api/workflows/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch workflow');
    return data.workflow;
  },

  async createWorkflow(payload: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create workflow');
    return data.workflow;
  },

  async updateWorkflow(id: string, payload: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> {
    const res = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update workflow');
    return data.workflow;
  },

  async toggleWorkflow(id: string): Promise<AutomationWorkflow> {
    const res = await fetch(`/api/workflows/${id}/toggle`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle workflow');
    return data.workflow;
  },

  async deleteWorkflow(id: string): Promise<void> {
    const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete workflow');
  },

  async testWorkflow(id: string, sampleData?: any): Promise<{ log: AutomationExecutionLog; message: string }> {
    const res = await fetch(`/api/workflows/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleData || {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Workflow test run failed');
    return data;
  },

  async getAutomationLogs(): Promise<AutomationExecutionLog[]> {
    const res = await fetch('/api/automation-logs');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch automation logs');
    return data.logs || [];
  },

  // Stats & Round Robin
  async getStats(): Promise<CRMStats> {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data.stats;
  },

  async getRoundRobinState(): Promise<RoundRobinState> {
    const res = await fetch('/api/round-robin');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch round-robin state');
    return data.state;
  },

  async resetSeed(): Promise<void> {
    await fetch('/api/reset-seed', { method: 'POST' });
  },
};
