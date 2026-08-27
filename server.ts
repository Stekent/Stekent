import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import { OrderStatus, CourierPartner, CallOutcome } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    db.logAudit('User Login', 'auth', user.id, `User ${user.name} (${user.role}) signed in`, user.id, user.name);

    res.json({
      user,
      token: `tok_${user.id}_${Date.now()}`,
    });
  });

  // Users / Staff
  app.get('/api/users', (req: Request, res: Response) => {
    const users = db.getUsers();
    res.json({ users });
  });

  // Audit Logs
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const logs = db.getAuditLogs();
    res.json({ logs });
  });

  // Reps Performance Leaderboard
  app.get('/api/reps/performance', (req: Request, res: Response) => {
    const performances = db.getRepPerformances();
    res.json({ performances });
  });

  // Customers
  app.get('/api/customers', (req: Request, res: Response) => {
    const customers = db.getCustomers();
    res.json({ customers });
  });

  // Marketing Campaigns
  app.get('/api/campaigns', (req: Request, res: Response) => {
    const campaigns = db.getCampaigns();
    res.json({ campaigns });
  });

  app.post('/api/campaigns', (req: Request, res: Response) => {
    try {
      const { name, platform, spend, ordersCount, revenue, status } = req.body;
      if (!name || spend === undefined) {
        return res.status(400).json({ error: 'Campaign name and spend are required' });
      }

      const campaign = db.createCampaign({
        name,
        platform: platform || 'facebook',
        spend: Number(spend),
        ordersCount: Number(ordersCount) || 0,
        revenue: Number(revenue) || 0,
        status: status || 'Active',
      });

      res.status(201).json({ campaign });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create campaign' });
    }
  });

  // Products: List
  app.get('/api/products', (req: Request, res: Response) => {
    const products = db.getProducts();
    res.json({ products });
  });

  // Products: Create
  app.post('/api/products', (req: Request, res: Response) => {
    try {
      const { name, sku, costPrice, sellingPrice, currency, stockQty, lowStockThreshold } = req.body;

      if (!name || !sku || costPrice === undefined || sellingPrice === undefined) {
        return res.status(400).json({ error: 'Name, SKU, cost price, and selling price are required' });
      }

      const product = db.createProduct({
        name,
        sku,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        currency: currency || 'NGN',
        stockQty: Number(stockQty) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 10,
      });

      res.status(201).json({ product });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create product' });
    }
  });

  // Products: Adjust Stock
  app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { delta, reason, userId } = req.body;

      if (delta === undefined || !reason) {
        return res.status(400).json({ error: 'delta and reason are required' });
      }

      const product = db.updateProductStock(id, Number(delta), reason, userId);
      res.json({ product, message: `Stock for ${product.name} updated to ${product.stockQty}` });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update stock' });
    }
  });

  // Orders: List
  app.get('/api/orders', (req: Request, res: Response) => {
    const orders = db.getOrders();
    res.json({ orders });
  });

  // Orders: Create & Round-Robin Assign
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerState,
        productId,
        quantity,
        source,
        campaignId,
        assignedRepId,
        deliveryCourier,
        shippingFee,
        changedByUserId,
      } = req.body;

      if (!customerName || !customerPhone) {
        return res.status(400).json({ error: 'Customer name and phone are required' });
      }

      if (!productId) {
        return res.status(400).json({ error: 'Product selection is required' });
      }

      const order = db.createOrder({
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerState,
        productId,
        quantity: Number(quantity) || 1,
        source: source || 'manual_form',
        campaignId,
        assignedRepId,
        deliveryCourier,
        shippingFee: Number(shippingFee) || 2500,
        changedByUserId,
      });

      res.status(201).json({
        order,
        message: `Order ${order.orderNumber} successfully created and assigned to ${order.assignedRep?.name || 'rep'}`,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create order' });
    }
  });

  // Orders: Manual Reassignment (Does NOT affect round-robin counter)
  app.patch('/api/orders/:id/reassign', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newRepId, changedByUserId } = req.body;

      if (!newRepId) {
        return res.status(400).json({ error: 'newRepId is required' });
      }

      const updatedOrder = db.manuallyReassignOrder(id, newRepId, changedByUserId);
      res.json({
        order: updatedOrder,
        message: `Order manually reassigned to ${updatedOrder.assignedRep?.name}. Round-robin queue counter remains unchanged.`,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reassign order' });
    }
  });

  // Orders: Status Update
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, note, changedByUserId } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }

      const updatedOrder = db.updateOrderStatus(id, status as OrderStatus, note, changedByUserId);

      // Trigger matching workflow automation trigger (e.g. order_confirmed, order_dispatched, order_delivered, order_failed, order_returned)
      let triggerEvent: any = null;
      if (status === 'Confirmed') triggerEvent = 'order_confirmed';
      else if (status === 'Dispatched') triggerEvent = 'order_dispatched';
      else if (status === 'Delivered') triggerEvent = 'order_delivered';
      else if (status === 'Delivery Failed') triggerEvent = 'order_failed';
      else if (status === 'Returned') triggerEvent = 'order_returned';

      if (triggerEvent) {
        const customer = db.getCustomerById(updatedOrder.customerId);
        const assignedRep = updatedOrder.assignedRepId ? db.getUserById(updatedOrder.assignedRepId) : null;
        db.triggerAutomationWorkflows(triggerEvent, {
          order: updatedOrder,
          customer,
          assignedRep,
        });
      }

      res.json({ order: updatedOrder });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update order status' });
    }
  });

  // Orders: Assign Courier & Waybill
  app.patch('/api/orders/:id/courier', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { courier, waybillNumber, shippingFee, expectedDeliveryDate, changedByUserId } = req.body;

      if (!courier || !waybillNumber) {
        return res.status(400).json({ error: 'courier and waybillNumber are required' });
      }

      const updatedOrder = db.assignCourierDispatch({
        orderId: id,
        courier: courier as CourierPartner,
        waybillNumber,
        shippingFee: Number(shippingFee) || 2500,
        expectedDeliveryDate,
        changedByUserId,
      });

      res.json({ order: updatedOrder, message: `Dispatched via ${courier} (Waybill: ${waybillNumber})` });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to assign courier' });
    }
  });

  // Orders: Record Delivery Outcome / POD / Failure
  app.patch('/api/orders/:id/delivery-outcome', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, podNotes, failureReason, changedByUserId } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }

      const updatedOrder = db.recordDeliveryOutcome({
        orderId: id,
        status,
        podNotes,
        failureReason,
        changedByUserId,
      });

      res.json({ order: updatedOrder });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to record delivery outcome' });
    }
  });

  // Call Logs: Log Call Attempt
  app.post('/api/orders/:id/calls', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { repId, outcome, note, scheduledFollowUpAt } = req.body;

      if (!repId || !outcome) {
        return res.status(400).json({ error: 'repId and outcome are required' });
      }

      const call = db.logCallAttempt({
        orderId: id,
        repId,
        outcome: outcome as CallOutcome,
        note,
        scheduledFollowUpAt,
      });

      const updatedOrder = db.getOrderById(id);

      // Trigger call_logged automation workflows
      if (updatedOrder) {
        const customer = db.getCustomerById(updatedOrder.customerId);
        const assignedRep = updatedOrder.assignedRepId ? db.getUserById(updatedOrder.assignedRepId) : null;
        db.triggerAutomationWorkflows('call_logged', {
          order: updatedOrder,
          customer,
          assignedRep,
          callLog: call,
        });
      }

      res.status(201).json({ call, order: updatedOrder });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to log call' });
    }
  });

  app.get('/api/call-logs', (req: Request, res: Response) => {
    const orderId = req.query.orderId as string | undefined;
    const calls = db.getCallLogs(orderId);
    res.json({ calls });
  });

  // Follow-up Queue
  app.get('/api/follow-ups', (req: Request, res: Response) => {
    const repId = req.query.repId as string | undefined;
    const followUps = db.getFollowUpQueue(repId);
    res.json({ followUps });
  });

  // Payroll: Rules & Records
  app.get('/api/payroll/rules', (req: Request, res: Response) => {
    const rules = db.getCommissionRules();
    res.json({ rules });
  });

  app.patch('/api/payroll/rules', (req: Request, res: Response) => {
    try {
      const { baseSalary, perConfirmedBonus, perDeliveredCommission, returnPenalty, adminUserId } = req.body;
      const rules = db.updateCommissionRules(
        {
          baseSalary: baseSalary !== undefined ? Number(baseSalary) : undefined,
          perConfirmedBonus: perConfirmedBonus !== undefined ? Number(perConfirmedBonus) : undefined,
          perDeliveredCommission: perDeliveredCommission !== undefined ? Number(perDeliveredCommission) : undefined,
          returnPenalty: returnPenalty !== undefined ? Number(returnPenalty) : undefined,
        },
        adminUserId
      );
      res.json({ rules });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update commission rules' });
    }
  });

  app.get('/api/payroll/periods', (req: Request, res: Response) => {
    const periods = db.getPayrollPeriods();
    res.json({ periods });
  });

  app.get('/api/payroll/records', (req: Request, res: Response) => {
    const periodId = req.query.periodId as string | undefined;
    const records = db.getPayrollRecords(periodId);
    res.json({ records });
  });

  app.post('/api/payroll/records/:id/approve', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminUserId } = req.body;
      const record = db.approvePayrollRecord(id, adminUserId);
      res.json({ record });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to approve payroll' });
    }
  });

  app.post('/api/payroll/records/:id/pay', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminUserId } = req.body;
      const record = db.markPayrollRecordPaid(id, adminUserId);
      res.json({ record });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to mark payroll paid' });
    }
  });

  // Remittances
  app.get('/api/remittances', (req: Request, res: Response) => {
    const remittances = db.getRemittances();
    res.json({ remittances });
  });

  app.post('/api/remittances/:id/reconcile', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminUserId } = req.body;
      const remittance = db.reconcileRemittance(id, adminUserId);
      res.json({ remittance });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reconcile remittance' });
    }
  });

  // Automations & WhatsApp
  app.get('/api/automations/templates', (req: Request, res: Response) => {
    const templates = db.getAutomationTemplates();
    res.json({ templates });
  });

  app.put('/api/automations/templates/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content, active } = req.body;
      const template = db.updateAutomationTemplate(id, content, active);
      res.json({ template });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update template' });
    }
  });

  app.post('/api/automations/message-preview', (req: Request, res: Response) => {
    const { templateId, orderId } = req.body;
    const message = db.generateMessageForOrder(templateId, orderId);
    res.json({ message });
  });

  // In-App Notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    const notifications = db.getNotifications();
    res.json({ notifications });
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    if (id === 'all') {
      db.markAllNotificationsRead();
    } else {
      db.markNotificationRead(id);
    }
    res.json({ success: true });
  });

  // Webhooks Intake
  app.post('/api/webhooks/woocommerce', (req: Request, res: Response) => {
    try {
      const order = db.ingestWebhook('woocommerce', req.body);
      res.status(201).json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'WooCommerce ingestion failed' });
    }
  });

  app.post('/api/webhooks/shopify', (req: Request, res: Response) => {
    try {
      const order = db.ingestWebhook('shopify', req.body);
      res.status(201).json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Shopify ingestion failed' });
    }
  });

  app.post('/api/webhooks/orders', (req: Request, res: Response) => {
    try {
      const order = db.ingestWebhook('custom', req.body);
      res.status(201).json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Custom webhook ingestion failed' });
    }
  });

  app.get('/api/webhooks/logs', (req: Request, res: Response) => {
    const logs = db.getWebhookLogs();
    res.json({ logs });
  });

  // Round-Robin State Info
  app.get('/api/round-robin', (req: Request, res: Response) => {
    const rrState = db.getRoundRobinState();
    res.json({ state: rrState });
  });

  // ==================== FORM BUILDER API ====================
  app.get('/api/forms', (req: Request, res: Response) => {
    const forms = db.getCustomForms();
    res.json({ forms });
  });

  app.get('/api/forms/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const form = db.getCustomFormById(id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ form });
  });

  app.get('/api/forms/slug/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const form = db.getCustomFormBySlug(slug);
    if (!form) {
      return res.status(404).json({ error: 'Form not found with this slug' });
    }
    res.json({ form });
  });

  app.post('/api/forms', (req: Request, res: Response) => {
    try {
      const form = db.createCustomForm(req.body);
      res.status(201).json({ form, message: 'Custom form created successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create form' });
    }
  });

  app.put('/api/forms/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const form = db.updateCustomForm(id, req.body);
      res.json({ form, message: 'Form updated successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update form' });
    }
  });

  app.delete('/api/forms/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = db.deleteCustomForm(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ success: true, message: 'Form deleted successfully' });
  });

  app.post('/api/forms/:id/view', (req: Request, res: Response) => {
    const { id } = req.params;
    db.incrementFormViews(id);
    res.json({ success: true });
  });

  app.post('/api/forms/:id/submit', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body, formId: id };

      if (!payload.customerName || !payload.customerPhone) {
        return res.status(400).json({ error: 'Customer Name and Phone Number are required' });
      }

      const result = db.submitCustomForm(payload);
      res.status(201).json({
        success: true,
        order: result.order,
        customer: result.customer,
        form: result.form,
        executionLogs: result.executionLogs,
        message: `Thank you! Your Cash on Delivery order #${result.order.orderNumber} has been received. Our sales agent will call you shortly.`,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Form submission failed' });
    }
  });

  // ==================== AUTOMATION ENGINE API ====================
  app.get('/api/workflows', (req: Request, res: Response) => {
    const workflows = db.getWorkflows();
    res.json({ workflows });
  });

  app.get('/api/workflows/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const workflow = db.getWorkflowById(id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({ workflow });
  });

  app.post('/api/workflows', (req: Request, res: Response) => {
    try {
      const workflow = db.createWorkflow(req.body);
      res.status(201).json({ workflow, message: 'Automation workflow created successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create workflow' });
    }
  });

  app.put('/api/workflows/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const workflow = db.updateWorkflow(id, req.body);
      res.json({ workflow, message: 'Automation workflow updated successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update workflow' });
    }
  });

  app.patch('/api/workflows/:id/toggle', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const workflow = db.toggleWorkflowActive(id);
      res.json({ workflow, message: `Workflow is now ${workflow.active ? 'Active' : 'Paused'}` });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to toggle workflow' });
    }
  });

  app.delete('/api/workflows/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = db.deleteWorkflow(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({ success: true, message: 'Workflow deleted successfully' });
  });

  app.post('/api/workflows/:id/test', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const log = db.testWorkflowRun(id, req.body);
      res.json({
        success: true,
        log,
        message: `Workflow test completed with ${log.executedActionsCount} actions executed.`,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Workflow test run failed' });
    }
  });

  app.get('/api/automation-logs', (req: Request, res: Response) => {
    const logs = db.getAutomationLogs();
    res.json({ logs });
  });

  // Stats / Dashboard KPI
  app.get('/api/stats', (req: Request, res: Response) => {
    const stats = db.getStats();
    res.json({ stats });
  });

  // Reset database to seed
  app.post('/api/reset-seed', (req: Request, res: Response) => {
    const freshDb = new (db.constructor as any)();
    Object.assign(db, freshDb);
    res.json({ message: 'Database reset to initial demo state' });
  });

  // --- VITE MIDDLEWARE (Development) or STATIC ASSETS (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
