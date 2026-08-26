import {
  User,
  Product,
  Customer,
  Order,
  OrderItem,
  OrderStatusHistory,
  RoundRobinState,
  CRMStats,
  OrderStatus,
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
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowAction,
} from '../types';

export class Database {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private statusHistories: Map<string, OrderStatusHistory> = new Map();
  private callLogs: Map<string, CallLog> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private campaigns: Map<string, MarketingCampaign> = new Map();
  private payrollPeriods: Map<string, PayrollPeriod> = new Map();
  private payrollRecords: Map<string, PayrollRecord> = new Map();
  private remittances: Map<string, CourierRemittance> = new Map();
  private automationTemplates: Map<string, AutomationTemplate> = new Map();
  private notifications: Map<string, AppNotification> = new Map();
  private webhookLogs: Map<string, WebhookLog> = new Map();
  private customForms: Map<string, CustomForm> = new Map();
  private workflows: Map<string, AutomationWorkflow> = new Map();
  private automationLogs: Map<string, AutomationExecutionLog> = new Map();

  private commissionRules: CommissionRules = {
    baseSalary: 50000,
    perConfirmedBonus: 300,
    perDeliveredCommission: 1500,
    returnPenalty: 500,
  };

  private roundRobinState: { id: number; lastAssignedRepId: string | null; updatedAt: string } = {
    id: 1,
    lastAssignedRepId: null,
    updatedAt: new Date().toISOString(),
  };

  private orderCounter = 1250;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Users (Admin, Sales Reps, Delivery Agent, Inventory Manager)
    const seedUsers: User[] = [
      {
        id: 'usr-admin-1',
        name: 'Stekent Admin (Chioma)',
        email: 'chioma@stekentstore.com',
        passwordHash: 'password123',
        role: 'admin',
        active: true,
        phone: '0803 100 2001',
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
      {
        id: 'usr-rep-1',
        name: 'Michael Tunde',
        email: 'michael@stekentstore.com',
        passwordHash: 'password123',
        role: 'sales_rep',
        active: true,
        phone: '0803 222 3344',
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        id: 'usr-rep-2',
        name: 'David Okafor',
        email: 'david@stekentstore.com',
        passwordHash: 'password123',
        role: 'sales_rep',
        active: true,
        phone: '0805 333 4455',
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      },
      {
        id: 'usr-rep-3',
        name: 'John Adeleke',
        email: 'john@stekentstore.com',
        passwordHash: 'password123',
        role: 'sales_rep',
        active: true,
        phone: '0812 444 5566',
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: 'usr-rep-4',
        name: 'Peter Aliyu',
        email: 'peter@stekentstore.com',
        passwordHash: 'password123',
        role: 'sales_rep',
        active: true,
        phone: '0901 555 6677',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'usr-del-1',
        name: 'Emeka Logistics',
        email: 'emeka@stekentstore.com',
        passwordHash: 'password123',
        role: 'delivery_agent',
        active: true,
        phone: '0808 777 8899',
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      },
      {
        id: 'usr-inv-1',
        name: 'Ibrahim Musa',
        email: 'ibrahim@stekentstore.com',
        passwordHash: 'password123',
        role: 'inventory_manager',
        active: true,
        phone: '0703 666 7788',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
    ];

    seedUsers.forEach(u => this.users.set(u.id, u));

    // 2. Seed Products
    const seedProducts: Product[] = [
      {
        id: 'prd-1',
        name: 'Solar Fan Pro 16"',
        sku: 'SLR-FAN-01',
        costPrice: 22000,
        sellingPrice: 42000,
        currency: 'NGN',
        stockQty: 135,
        lowStockThreshold: 20,
        reservedQty: 18,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'prd-2',
        name: 'Dual Wireless Lavalier Mic',
        sku: 'MIC-WRLS-02',
        costPrice: 11500,
        sellingPrice: 32000,
        currency: 'NGN',
        stockQty: 310,
        lowStockThreshold: 25,
        reservedQty: 34,
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      },
      {
        id: 'prd-3',
        name: 'A9 Mini HD Security Camera',
        sku: 'CAM-A9-03',
        costPrice: 24000,
        sellingPrice: 65000,
        currency: 'NGN',
        stockQty: 88,
        lowStockThreshold: 15,
        reservedQty: 14,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'prd-4',
        name: 'Heavy Duty Phone Tripod Kit',
        sku: 'TRP-KIT-04',
        costPrice: 17500,
        sellingPrice: 45000,
        currency: 'NGN',
        stockQty: 195,
        lowStockThreshold: 20,
        reservedQty: 22,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'prd-5',
        name: 'Bluetooth Selfie Gimbal Stick',
        sku: 'SLF-STK-05',
        costPrice: 6200,
        sellingPrice: 18500,
        currency: 'NGN',
        stockQty: 74,
        lowStockThreshold: 15,
        reservedQty: 10,
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      },
      {
        id: 'prd-6',
        name: '4G Solar Outdoor PTZ Camera',
        sku: 'CAM-SLR-06',
        costPrice: 36000,
        sellingPrice: 85000,
        currency: 'NGN',
        stockQty: 42,
        lowStockThreshold: 10,
        reservedQty: 8,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ];

    seedProducts.forEach(p => this.products.set(p.id, p));

    // 3. Seed Customers
    const seedCustomers: Customer[] = [
      {
        id: 'cust-1',
        name: 'John Ade',
        phone: '0803 221 4401',
        email: 'john.ade@gmail.com',
        address: '14 Ademola Adetokunbo Cres, Wuse 2',
        state: 'Abuja',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        totalOrders: 3,
        deliveredOrders: 2,
        totalSpent: 126000,
      },
      {
        id: 'cust-2',
        name: 'Mary Okafor',
        phone: '0806 331 8812',
        email: 'mary.okafor@yahoo.com',
        address: '22 Ring Road, Challenge',
        state: 'Oyo',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        totalOrders: 2,
        deliveredOrders: 2,
        totalSpent: 97000,
      },
      {
        id: 'cust-3',
        name: 'Peter James',
        phone: '0812 774 2201',
        email: 'peter.james@gmail.com',
        address: '8 Allen Avenue, Ikeja',
        state: 'Lagos',
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        totalOrders: 4,
        deliveredOrders: 3,
        totalSpent: 215000,
      },
      {
        id: 'cust-4',
        name: 'Blessing Udoh',
        phone: '0901 442 8190',
        email: 'blessing.u@gmail.com',
        address: '45 Stadium Road, GRA Phase 2',
        state: 'Rivers',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        totalOrders: 2,
        deliveredOrders: 1,
        totalSpent: 85000,
      },
      {
        id: 'cust-5',
        name: 'Ifeanyi Chukwu',
        phone: '0705 921 1134',
        email: 'ifeanyi.c@hotmail.com',
        address: '12 Zik Avenue, Awka',
        state: 'Anambra',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        totalOrders: 1,
        deliveredOrders: 1,
        totalSpent: 42000,
      },
      {
        id: 'cust-6',
        name: 'Grace Abdullahi',
        phone: '0809 811 0042',
        email: 'grace.a@yahoo.com',
        address: '3 Bompai Road',
        state: 'Kano',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        totalOrders: 1,
        deliveredOrders: 0,
        totalSpent: 0,
      },
      {
        id: 'cust-7',
        name: 'Chinedu Eze',
        phone: '0813 555 7799',
        email: 'chinedu.eze@gmail.com',
        address: '27 Admiralty Way, Lekki Phase 1',
        state: 'Lagos',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        totalOrders: 2,
        deliveredOrders: 2,
        totalSpent: 130000,
      },
      {
        id: 'cust-8',
        name: 'Fatima Sanusi',
        phone: '0802 666 3311',
        email: 'fatima.s@gmail.com',
        address: '19 Sultan Road',
        state: 'Kaduna',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        totalOrders: 1,
        deliveredOrders: 0,
        totalSpent: 0,
      },
    ];

    seedCustomers.forEach(c => this.customers.set(c.id, c));

    // 4. Seed Marketing Campaigns
    const seedCampaigns: MarketingCampaign[] = [
      {
        id: 'cmp-1',
        name: 'Solar Fan — Lagos & West Broad',
        platform: 'facebook',
        spend: 740000,
        ordersCount: 380,
        revenue: 6200000,
        roas: 8.38,
        status: 'Active',
        costPerOrder: 1947,
        startDate: '2026-08-01',
      },
      {
        id: 'cmp-2',
        name: 'Wireless Mic — Creator Pack',
        platform: 'instagram',
        spend: 520000,
        ordersCount: 290,
        revenue: 5800000,
        roas: 11.15,
        status: 'Active',
        costPerOrder: 1793,
        startDate: '2026-08-03',
      },
      {
        id: 'cmp-3',
        name: 'A9 Mini Cam — High Intent Video',
        platform: 'facebook',
        spend: 810000,
        ordersCount: 365,
        revenue: 8400000,
        roas: 10.37,
        status: 'Active',
        costPerOrder: 2219,
        startDate: '2026-08-05',
      },
      {
        id: 'cmp-4',
        name: 'Tripod & Gimbal — TikTok Sparks',
        platform: 'tiktok',
        spend: 640000,
        ordersCount: 280,
        revenue: 5100000,
        roas: 7.97,
        status: 'Active',
        costPerOrder: 2285,
        startDate: '2026-08-08',
      },
      {
        id: 'cmp-5',
        name: 'Google Search — Solar Security 4G',
        platform: 'google',
        spend: 410000,
        ordersCount: 140,
        revenue: 4250000,
        roas: 10.36,
        status: 'Active',
        costPerOrder: 2928,
        startDate: '2026-08-10',
      },
    ];

    seedCampaigns.forEach(cmp => this.campaigns.set(cmp.id, cmp));

    // 5. Seed Orders with full Nigerian Logistics Details
    this.roundRobinState.lastAssignedRepId = 'usr-rep-2';

    const seedOrdersData = [
      {
        id: 'ord-101',
        orderNumber: 'STK-2026-1234',
        customerId: 'cust-1',
        assignedRepId: 'usr-rep-1',
        status: 'Delivered' as OrderStatus,
        totalAmount: 84000,
        state: 'Abuja',
        source: 'facebook_ad',
        campaignId: 'cmp-1',
        deliveryCourier: 'GIG Logistics' as CourierPartner,
        waybillNumber: 'GIG-ABJ-881920',
        shippingFee: 3500,
        expectedDeliveryDate: '2026-08-20',
        podNotes: 'Received and cash collected by driver (Signed by John A.)',
        remittanceStatus: 'Remitted' as const,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        items: [{ productId: 'prd-1', qty: 2, unitPrice: 42000 }],
      },
      {
        id: 'ord-102',
        orderNumber: 'STK-2026-1235',
        customerId: 'cust-2',
        assignedRepId: 'usr-rep-2',
        status: 'Delivered' as OrderStatus,
        totalAmount: 64000,
        state: 'Oyo',
        source: 'instagram_ad',
        campaignId: 'cmp-2',
        deliveryCourier: 'Fez Delivery' as CourierPartner,
        waybillNumber: 'FEZ-IBD-550129',
        shippingFee: 2800,
        expectedDeliveryDate: '2026-08-21',
        podNotes: 'Delivered to Mary at Ring Road office. Cash collected in full.',
        remittanceStatus: 'Remitted' as const,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        items: [{ productId: 'prd-2', qty: 2, unitPrice: 32000 }],
      },
      {
        id: 'ord-103',
        orderNumber: 'STK-2026-1236',
        customerId: 'cust-3',
        assignedRepId: 'usr-rep-3',
        status: 'Dispatched' as OrderStatus,
        totalAmount: 130000,
        state: 'Lagos',
        source: 'facebook_ad',
        campaignId: 'cmp-3',
        deliveryCourier: 'Gokada' as CourierPartner,
        waybillNumber: 'GOK-LOS-99321',
        shippingFee: 2500,
        expectedDeliveryDate: '2026-08-26',
        remittanceStatus: 'Pending' as const,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        items: [{ productId: 'prd-3', qty: 2, unitPrice: 65000 }],
      },
      {
        id: 'ord-104',
        orderNumber: 'STK-2026-1237',
        customerId: 'cust-4',
        assignedRepId: 'usr-rep-4',
        status: 'Confirmed' as OrderStatus,
        totalAmount: 85000,
        state: 'Rivers',
        source: 'tiktok_ad',
        campaignId: 'cmp-4',
        deliveryCourier: 'Speedaf' as CourierPartner,
        waybillNumber: 'SPD-PH-109244',
        shippingFee: 4200,
        expectedDeliveryDate: '2026-08-28',
        remittanceStatus: 'Pending' as const,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        items: [{ productId: 'prd-6', qty: 1, unitPrice: 85000 }],
      },
      {
        id: 'ord-105',
        orderNumber: 'STK-2026-1238',
        customerId: 'cust-5',
        assignedRepId: 'usr-rep-1',
        status: 'New' as OrderStatus,
        totalAmount: 42000,
        state: 'Anambra',
        source: 'manual_form',
        scheduledFollowUp: new Date(Date.now() + 4 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        items: [{ productId: 'prd-1', qty: 1, unitPrice: 42000 }],
      },
      {
        id: 'ord-106',
        orderNumber: 'STK-2026-1239',
        customerId: 'cust-6',
        assignedRepId: 'usr-rep-2',
        status: 'New' as OrderStatus,
        totalAmount: 45000,
        state: 'Kano',
        source: 'woocommerce',
        scheduledFollowUp: new Date(Date.now() + 2 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        items: [{ productId: 'prd-4', qty: 1, unitPrice: 45000 }],
      },
      {
        id: 'ord-107',
        orderNumber: 'STK-2026-1240',
        customerId: 'cust-7',
        assignedRepId: 'usr-rep-3',
        status: 'Delivered' as OrderStatus,
        totalAmount: 130000,
        state: 'Lagos',
        source: 'shopify',
        deliveryCourier: 'In-house Dispatch' as CourierPartner,
        waybillNumber: 'STK-DIR-0042',
        shippingFee: 2000,
        expectedDeliveryDate: '2026-08-25',
        podNotes: 'Delivered by Emeka. Customer paid via POS transfer.',
        remittanceStatus: 'Remitted' as const,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        items: [{ productId: 'prd-3', qty: 2, unitPrice: 65000 }],
      },
      {
        id: 'ord-108',
        orderNumber: 'STK-2026-1241',
        customerId: 'cust-8',
        assignedRepId: 'usr-rep-4',
        status: 'Failed' as OrderStatus,
        totalAmount: 85000,
        state: 'Kaduna',
        source: 'facebook_ad',
        deliveryCourier: 'GIG Logistics' as CourierPartner,
        waybillNumber: 'GIG-KAD-119934',
        shippingFee: 4000,
        failureReason: 'Customer phone switched off after 3 attempts; courier returned parcel to station',
        remittanceStatus: 'Not Applicable' as const,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        items: [{ productId: 'prd-6', qty: 1, unitPrice: 85000 }],
      },
    ];

    seedOrdersData.forEach(od => {
      const order: Order = {
        id: od.id,
        orderNumber: od.orderNumber,
        customerId: od.customerId,
        assignedRepId: od.assignedRepId,
        status: od.status,
        totalAmount: od.totalAmount,
        state: od.state,
        source: od.source,
        campaignId: od.campaignId,
        deliveryCourier: od.deliveryCourier || null,
        waybillNumber: od.waybillNumber || null,
        shippingFee: od.shippingFee || 2500,
        expectedDeliveryDate: od.expectedDeliveryDate || null,
        podNotes: od.podNotes || null,
        failureReason: od.failureReason || null,
        remittanceStatus: od.remittanceStatus || 'Pending',
        scheduledFollowUp: od.scheduledFollowUp || null,
        createdAt: od.createdAt,
        updatedAt: od.createdAt,
        items: [],
        statusHistory: [
          {
            id: `hist-${od.id}-1`,
            orderId: od.id,
            status: 'New',
            note: 'Order captured via round-robin engine',
            changedById: 'usr-admin-1',
            changedAt: od.createdAt,
          },
        ],
        callLogs: [],
      };

      od.items.forEach((it, idx) => {
        const item: OrderItem = {
          id: `item-${od.id}-${idx}`,
          orderId: od.id,
          productId: it.productId,
          qty: it.qty,
          unitPrice: it.unitPrice,
        };
        this.orderItems.set(item.id, item);
        order.items.push(item);
      });

      this.orders.set(order.id, order);

      // Status history for delivered
      if (od.status === 'Delivered') {
        this.statusHistories.set(`hist-${od.id}-2`, {
          id: `hist-${od.id}-2`,
          orderId: od.id,
          status: 'Confirmed',
          note: 'Customer confirmed phone address and price',
          changedById: od.assignedRepId,
          changedAt: new Date(new Date(od.createdAt).getTime() + 1800000).toISOString(),
        });
        this.statusHistories.set(`hist-${od.id}-3`, {
          id: `hist-${od.id}-3`,
          orderId: od.id,
          status: 'Dispatched',
          note: `Handed over to ${od.deliveryCourier}. Waybill: ${od.waybillNumber}`,
          changedById: 'usr-del-1',
          changedAt: new Date(new Date(od.createdAt).getTime() + 86400000).toISOString(),
        });
        this.statusHistories.set(`hist-${od.id}-4`, {
          id: `hist-${od.id}-4`,
          orderId: od.id,
          status: 'Delivered',
          note: od.podNotes || 'Customer received parcel and paid cash on delivery',
          changedById: 'usr-del-1',
          changedAt: new Date(new Date(od.createdAt).getTime() + 172800000).toISOString(),
        });
      }
    });

    // 6. Seed Call Logs
    const sampleCalls: CallLog[] = [
      {
        id: 'call-1',
        orderId: 'ord-101',
        repId: 'usr-rep-1',
        repName: 'Michael Tunde',
        outcome: 'Answered & Confirmed',
        note: 'Customer verified address in Wuse 2. Ready for delivery tomorrow.',
        scheduledFollowUpAt: null,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'call-2',
        orderId: 'ord-104',
        repId: 'usr-rep-4',
        repName: 'Peter Aliyu',
        outcome: 'Answered & Confirmed',
        note: 'Customer confirmed 1x Solar PTZ camera. Advised cash ready upon arrival.',
        scheduledFollowUpAt: null,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'call-3',
        orderId: 'ord-105',
        repId: 'usr-rep-1',
        repName: 'Michael Tunde',
        outcome: 'Customer Requested Call Back',
        note: 'Customer was driving. Asked rep to call back at 4:30 PM.',
        scheduledFollowUpAt: new Date(Date.now() + 4 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'call-4',
        orderId: 'ord-106',
        repId: 'usr-rep-2',
        repName: 'David Okafor',
        outcome: 'Phone Switched Off',
        note: 'First attempt no connection. Follow-up queued for afternoon.',
        scheduledFollowUpAt: new Date(Date.now() + 2 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ];

    sampleCalls.forEach(cl => this.callLogs.set(cl.id, cl));

    // 7. Seed Payroll Periods & Records
    const periodId = 'pyr-2026-08';
    const period: PayrollPeriod = {
      id: periodId,
      name: 'August 2026 (Monthly Cycle)',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'Open',
      totalPayout: 584600,
      recordsCount: 4,
    };
    this.payrollPeriods.set(period.id, period);

    const reps = ['usr-rep-1', 'usr-rep-2', 'usr-rep-3', 'usr-rep-4'];
    reps.forEach((repId, idx) => {
      const rep = this.users.get(repId);
      const conf = 45 + idx * 8;
      const del = 38 + idx * 6;
      const ret = 3 + (idx % 2);
      const base = 50000;
      const confBonus = conf * this.commissionRules.perConfirmedBonus;
      const delComm = del * this.commissionRules.perDeliveredCommission;
      const retPen = ret * this.commissionRules.returnPenalty;
      const net = base + confBonus + delComm - retPen;

      const record: PayrollRecord = {
        id: `pr-${periodId}-${repId}`,
        repId,
        repName: rep?.name || 'Rep',
        periodId,
        periodName: period.name,
        baseSalary: base,
        confirmedCount: conf,
        confirmedBonus: confBonus,
        deliveredCount: del,
        deliveredCommission: delComm,
        returnCount: ret,
        returnPenalty: retPen,
        bonuses: idx === 0 ? 10000 : 0,
        deductions: 0,
        netPayable: net + (idx === 0 ? 10000 : 0),
        status: idx === 0 ? 'Approved' : 'Draft',
        approvedAt: idx === 0 ? new Date().toISOString() : null,
      };
      this.payrollRecords.set(record.id, record);
    });

    // 8. Seed Courier Remittances
    const seedRemittances: CourierRemittance[] = [
      {
        id: 'rem-1',
        courierName: 'GIG Logistics',
        period: 'Aug 15 - Aug 21, 2026',
        totalWaybills: 48,
        deliveredOrdersCount: 44,
        collectedAmount: 2450000,
        courierFee: 168000,
        netRemitted: 2282000,
        status: 'Reconciled',
        referenceNo: 'GIG-REM-882190',
        date: '2026-08-22',
      },
      {
        id: 'rem-2',
        courierName: 'Fez Delivery',
        period: 'Aug 18 - Aug 24, 2026',
        totalWaybills: 36,
        deliveredOrdersCount: 32,
        collectedAmount: 1840000,
        courierFee: 100800,
        netRemitted: 1739200,
        status: 'Reconciled',
        referenceNo: 'FEZ-REM-449102',
        date: '2026-08-25',
      },
      {
        id: 'rem-3',
        courierName: 'Speedaf',
        period: 'Aug 20 - Aug 26, 2026',
        totalWaybills: 24,
        deliveredOrdersCount: 20,
        collectedAmount: 1250000,
        courierFee: 84000,
        netRemitted: 1166000,
        status: 'Pending',
        referenceNo: 'SPD-REM-PEND-09',
        date: '2026-08-26',
      },
    ];

    seedRemittances.forEach(rem => this.remittances.set(rem.id, rem));

    // 9. Seed Automation Templates
    const seedTemplates: AutomationTemplate[] = [
      {
        id: 'tpl-1',
        name: 'Order Confirmation & Verification',
        trigger: 'order_created',
        channel: 'whatsapp',
        active: true,
        content: `Hello {customer_name}, thank you for choosing Stekentstore! We received your order for {product_name} ({order_number}) totaling {amount}. Please reply YES to confirm your delivery address: {delivery_address}. Our dispatch rider will reach out before arrival.`,
      },
      {
        id: 'tpl-2',
        name: 'Waybill & In-Transit Alert',
        trigger: 'order_dispatched',
        channel: 'whatsapp',
        active: true,
        content: `Good news {customer_name}! Your order {order_number} has been dispatched via {courier_name}. Tracking Waybill: {waybill_number}. Expected delivery: {expected_delivery_date}. Please ensure your phone is active and cash of {amount} is ready.`,
      },
      {
        id: 'tpl-3',
        name: 'Scheduled Call-Back Reminder',
        trigger: 'follow_up',
        channel: 'sms',
        active: true,
        content: `Hi {customer_name}, Stekentstore tried reaching you regarding order {order_number}. We will call you shortly or you can reply to this message. Thank you!`,
      },
      {
        id: 'tpl-4',
        name: 'Out for Delivery / COD Ready',
        trigger: 'out_for_delivery',
        channel: 'whatsapp',
        active: true,
        content: `Hello {customer_name}, your delivery rider from {courier_name} is on the way to {delivery_address}. Total payment on delivery: {amount}. Inquiries? Call 08031002001.`,
      },
      {
        id: 'tpl-5',
        name: 'Delivered & Thank You Note',
        trigger: 'order_delivered',
        channel: 'whatsapp',
        active: true,
        content: `Dear {customer_name}, we confirm delivery of your order {order_number}. Thank you for shopping with Stekentstore! For warranty and support, reply directly to this chat.`,
      },
    ];

    seedTemplates.forEach(tpl => this.automationTemplates.set(tpl.id, tpl));

    // 10. Seed Notifications
    const seedNotifs: AppNotification[] = [
      {
        id: 'notif-1',
        title: 'New Inbound Lead via Webhook',
        message: 'Order STK-2026-1240 received from Shopify and assigned to Peter Aliyu.',
        type: 'order',
        read: false,
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        linkTab: 'orders',
      },
      {
        id: 'notif-2',
        title: 'Low Stock Alert',
        message: 'A9 Mini HD Security Camera is at 88 units (Threshold: 15). Reorder recommended.',
        type: 'stock',
        read: false,
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        linkTab: 'inventory',
      },
      {
        id: 'notif-3',
        title: 'Follow-Up Due',
        message: 'John Ade requested a call-back for Solar Fan at 4:30 PM.',
        type: 'followup',
        read: false,
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        linkTab: 'sales',
      },
      {
        id: 'notif-4',
        title: 'Courier Remittance Pending',
        message: 'Speedaf has ₦1,166,000 pending reconciliation for 20 delivered orders.',
        type: 'courier',
        read: true,
        timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        linkTab: 'finance',
      },
    ];

    seedNotifs.forEach(n => this.notifications.set(n.id, n));

    // 11. Seed High-Converting Custom Forms ("Elementor + WPForms" Competitor)
    const seedForms: CustomForm[] = [
      {
        id: 'frm-solar-fan',
        name: 'Ultimate Solar Fan — 2-Step COD Order Form',
        slug: 'solar-fan-cod',
        description: 'High-converting 2-step Cash on Delivery order funnel with volume discount tiers and VIP warranty bump.',
        stepType: 'multi_step',
        status: 'published',
        productId: 'prd-1',
        viewsCount: 3840,
        submissionsCount: 428,
        totalRevenue: 28450000,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        theme: {
          primaryColor: '#146B4E',
          backgroundColor: '#FFFFFF',
          borderRadius: 'medium',
          buttonStyle: 'shadow_bold',
          buttonText: 'CONFIRM CASH ON DELIVERY ORDER',
          buttonSubtext: '⚡ Pay When Delivery Rider Brings Your Package',
          showUrgencyTimer: true,
          timerMinutes: 15,
          showTrustBadges: true,
          showStockCounter: true,
          stockLeft: 12,
          layout: 'card_stepper',
        },
        coupons: [
          { code: 'STEKENT10', type: 'percentage', discountValue: 10, minOrderAmount: 30000, active: true },
          { code: 'VIP3000', type: 'fixed', discountValue: 3000, minOrderAmount: 40000, active: true },
        ],
        paymentOptions: {
          allowCOD: true,
          allowBankTransfer: true,
          allowCardPayment: true,
          allowPartialDeposit: false,
          bankDetails: {
            bankName: 'Zenith Bank PLC',
            accountNumber: '1018892019',
            accountName: 'Stekent Global Direct Ltd',
          },
        },
        tracking: {
          facebookPixelId: 'FB-998822104',
          tiktokPixelId: 'TT-77441199',
          googleAnalyticsId: 'G-STEKENT88',
        },
        webhookUrl: 'https://webhook.site/stekent-orders-sync',
        fields: [
          {
            id: 'fld-timer',
            type: 'countdown_timer',
            label: '⚡ Flash Offer: Free Shipping + Free USB LED Bulb for the next 15 minutes!',
            step: 1,
          },
          {
            id: 'fld-name',
            type: 'text',
            label: 'Full Name',
            placeholder: 'e.g. Adebayo Johnson',
            required: true,
            step: 1,
            helpText: 'Enter name for waybill identification',
          },
          {
            id: 'fld-phone',
            type: 'phone',
            label: 'WhatsApp / Active Phone Number',
            placeholder: 'e.g. 0803 222 3344',
            required: true,
            step: 1,
            helpText: 'Our dispatch rider will call this number prior to delivery',
          },
          {
            id: 'fld-alt-phone',
            type: 'phone',
            label: 'Alternative Phone Number (Optional)',
            placeholder: 'e.g. 0812 345 6789',
            required: false,
            step: 1,
          },
          {
            id: 'fld-state',
            type: 'state_select',
            label: 'Delivery State',
            placeholder: 'Select your Nigerian State',
            required: true,
            step: 1,
            defaultValue: 'Lagos',
          },
          {
            id: 'fld-address',
            type: 'address',
            label: 'Full Delivery Address & Landmark',
            placeholder: 'e.g. No 14 Admiralty Way, Lekki Phase 1, Opposite Filmhouse Cinema',
            required: true,
            step: 1,
          },
          {
            id: 'fld-delivery-time',
            type: 'dropdown',
            label: 'Preferred Delivery Time',
            step: 1,
            required: true,
            options: ['Morning (9:00 AM - 1:00 PM)', 'Afternoon (1:00 PM - 5:00 PM)', 'Anytime Today / Tomorrow'],
            defaultValue: 'Anytime Today / Tomorrow',
          },
          {
            id: 'fld-qty-tiers',
            type: 'quantity_tiers',
            label: 'Choose Your Package (Special Bulk Discount)',
            step: 2,
            required: true,
            quantityTiers: [
              {
                id: 'tier-1',
                quantity: 1,
                label: 'Buy 1 Unit (Standard Pack)',
                fixedPrice: 42000,
                badge: 'STANDARD PACK',
              },
              {
                id: 'tier-2',
                quantity: 2,
                label: 'Buy 2 Units (Recommended Family Set)',
                fixedPrice: 80000,
                badge: '🔥 SAVE ₦4,000 + FREE USB BULB',
                isPopular: true,
              },
              {
                id: 'tier-3',
                quantity: 3,
                label: 'Buy 3 Units (VIP Triple Pack)',
                fixedPrice: 118000,
                badge: '💰 SAVE ₦8,000 + 2x EXTRA SOLAR BULBS',
              },
            ],
          },
          {
            id: 'fld-order-bump',
            type: 'order_bump',
            label: 'VIP Protection & Fast-Track Shipping',
            step: 2,
            orderBump: {
              enabled: true,
              title: 'Add 1-Year VIP Extended Warranty + Extra Heavy Duty Solar Cable',
              description:
                'Check this box to get priority same-day warehouse dispatch, accidental damage coverage, and free replacement parts for 12 months.',
              price: 4500,
              originalPrice: 9000,
              highlightText: 'ONE-TIME SPECIAL ADD-ON: ONLY ₦4,500',
            },
          },
          {
            id: 'fld-coupon',
            type: 'coupon_code',
            label: 'Have a Promo / Discount Code?',
            placeholder: 'Enter code e.g. STEKENT10',
            step: 2,
          },
          {
            id: 'fld-payment',
            type: 'payment_method',
            label: 'Select Payment Method',
            step: 2,
            required: true,
            defaultValue: 'COD',
          },
          {
            id: 'fld-utm-source',
            type: 'hidden',
            label: 'UTM Source',
            hiddenKey: 'utm_source',
            defaultValue: 'facebook_ads',
          },
          {
            id: 'fld-utm-campaign',
            type: 'hidden',
            label: 'UTM Campaign',
            hiddenKey: 'utm_campaign',
            defaultValue: 'solar_fan_august_scale',
          },
          {
            id: 'fld-fbclid',
            type: 'hidden',
            label: 'Facebook Click ID',
            hiddenKey: 'fbclid',
          },
          {
            id: 'fld-ttclid',
            type: 'hidden',
            label: 'TikTok Click ID',
            hiddenKey: 'ttclid',
          },
          {
            id: 'fld-trust',
            type: 'trust_badges',
            label: 'Guaranteed Safe Delivery',
            step: 2,
          },
        ],
      },
      {
        id: 'frm-a9-camera',
        name: 'A9 Mini HD Spy Camera — 1-Page Fast Checkout',
        slug: 'a9-camera-fast',
        description: 'Single-screen streamlined direct Cash on Delivery order form with 64GB Memory Card bump.',
        stepType: 'single',
        status: 'published',
        productId: 'prd-2',
        viewsCount: 2450,
        submissionsCount: 310,
        totalRevenue: 10850000,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        theme: {
          primaryColor: '#0F52BA',
          backgroundColor: '#FFFFFF',
          borderRadius: 'small',
          buttonStyle: 'solid',
          buttonText: 'PLACE ORDER (PAY ON DELIVERY)',
          buttonSubtext: '🚚 Free Nationwide Delivery in 24 - 48 Hours',
          showUrgencyTimer: true,
          timerMinutes: 10,
          showTrustBadges: true,
          showStockCounter: true,
          stockLeft: 8,
          layout: 'single_column',
        },
        coupons: [{ code: 'SPY2000', type: 'fixed', discountValue: 2000, active: true }],
        paymentOptions: {
          allowCOD: true,
          allowBankTransfer: true,
          allowCardPayment: false,
          allowPartialDeposit: false,
        },
        tracking: {
          facebookPixelId: 'FB-998822104',
          tiktokPixelId: 'TT-77441199',
        },
        fields: [
          {
            id: 'fld-name-single',
            type: 'text',
            label: 'Your Full Name',
            placeholder: 'e.g. John Okoro',
            required: true,
            step: 1,
          },
          {
            id: 'fld-phone-single',
            type: 'phone',
            label: 'Active Phone / WhatsApp Number',
            placeholder: 'e.g. 0805 123 4567',
            required: true,
            step: 1,
          },
          {
            id: 'fld-state-single',
            type: 'state_select',
            label: 'State',
            required: true,
            step: 1,
            defaultValue: 'Abuja',
          },
          {
            id: 'fld-address-single',
            type: 'address',
            label: 'Delivery Address & Landmark',
            placeholder: 'House number, street name, nearest bus stop',
            required: true,
            step: 1,
          },
          {
            id: 'fld-qty-single',
            type: 'quantity_tiers',
            label: 'Select Quantity',
            step: 1,
            required: true,
            quantityTiers: [
              { id: 'cam-1', quantity: 1, label: '1 Camera Unit', fixedPrice: 32000, badge: 'STARTER' },
              { id: 'cam-2', quantity: 2, label: '2 Cameras (Front + Back Door)', fixedPrice: 58000, badge: 'SAVE ₦6,000', isPopular: true },
            ],
          },
          {
            id: 'fld-bump-sdcard',
            type: 'order_bump',
            label: 'Memory Card Add-on',
            step: 1,
            orderBump: {
              enabled: true,
              title: 'Add SanDisk 64GB High-Endurance MicroSD Card',
              description: 'Save 24/7 video loop recording for up to 30 days without internet connection.',
              price: 5500,
              originalPrice: 9500,
              highlightText: 'RECOMMENDED ADD-ON: +₦5,500',
            },
          },
          {
            id: 'fld-payment-single',
            type: 'payment_method',
            label: 'Payment Method',
            step: 1,
            defaultValue: 'COD',
          },
        ],
      },
      {
        id: 'frm-smartwatch',
        name: "Luxury Smart Watch — 3-Step VIP Funnel with Post-Purchase Upsell",
        slug: 'luxury-watch-vip',
        description: '3-Step high converting funnel with genuine leather strap bump and post-purchase powerbank upsell.',
        stepType: 'multi_step',
        status: 'published',
        productId: 'prd-3',
        viewsCount: 1920,
        submissionsCount: 195,
        totalRevenue: 13650000,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        theme: {
          primaryColor: '#7C3AED',
          backgroundColor: '#FFFFFF',
          borderRadius: 'large',
          buttonStyle: 'gradient',
          buttonText: 'CLAIM VIP OFFER & COMPLETE ORDER',
          buttonSubtext: '🔒 Zero Risk • Pay Cash on Delivery',
          showUrgencyTimer: true,
          timerMinutes: 20,
          showTrustBadges: true,
          showStockCounter: true,
          stockLeft: 5,
          layout: 'card_stepper',
        },
        coupons: [{ code: 'VIPWATCH', type: 'percentage', discountValue: 15, active: true }],
        paymentOptions: {
          allowCOD: true,
          allowBankTransfer: true,
          allowCardPayment: true,
          allowPartialDeposit: true,
          depositAmount: 5000,
        },
        tracking: {
          facebookPixelId: 'FB-998822104',
          tiktokPixelId: 'TT-77441199',
        },
        fields: [
          { id: 'fld-vip-name', type: 'text', label: 'VIP Customer Name', required: true, step: 1 },
          { id: 'fld-vip-phone', type: 'phone', label: 'Primary Contact Phone', required: true, step: 1 },
          { id: 'fld-vip-state', type: 'state_select', label: 'Destination State', required: true, step: 2, defaultValue: 'Rivers' },
          { id: 'fld-vip-address', type: 'address', label: 'Office or Residential Address', required: true, step: 2 },
          {
            id: 'fld-vip-tiers',
            type: 'quantity_tiers',
            label: 'Package Selection',
            step: 3,
            quantityTiers: [
              { id: 'wt-1', quantity: 1, label: '1x VIP Automatic Watch', fixedPrice: 65000 },
              { id: 'wt-2', quantity: 2, label: '2x Watches (His & Hers Gift Box)', fixedPrice: 120000, badge: 'SAVE ₦10,000', isPopular: true },
            ],
          },
          {
            id: 'fld-vip-bump',
            type: 'order_bump',
            label: 'Exclusive Strap Upgrade',
            step: 3,
            orderBump: {
              enabled: true,
              title: 'Add Italian Genuine Leather Extra Strap + Watchmaker Tool',
              description: 'Easily swap between Stainless Steel and Classic Brown Leather style.',
              price: 6500,
              originalPrice: 12000,
              highlightText: 'EXCLUSIVE STRAP PACK: +₦6,500',
            },
          },
          {
            id: 'fld-vip-upsell',
            type: 'upsell_modal',
            label: '1-Click Post Purchase Upgrade',
            step: 3,
            upsell: {
              enabled: true,
              heading: 'WAIT! Special 1-Time VIP Add-on Offer',
              subheading: 'Add our 20,000mAh Ultra-Slim Fast Charging Wireless Power Bank to your package today for 50% OFF!',
              productId: 'prd-4',
              productName: '20,000mAh Wireless Solar Power Bank',
              price: 14500,
              originalPrice: 29000,
              discountBadge: '50% OFF ONE-TIME OFFER',
              buttonText: 'YES! Add to My Order for ₦14,500',
              skipText: 'No thanks, I will pay full price later',
            },
          },
        ],
      },
    ];

    seedForms.forEach(f => this.customForms.set(f.id, f));

    // 12. Seed Automation Workflows (Built-in "Zapier / Make / n8n" flow engine)
    const seedWorkflows: AutomationWorkflow[] = [
      {
        id: 'wf-inbound-omniflow',
        name: 'New Inbound Order Omnichannel Fulfillment Flow',
        description: 'Triggered whenever any form is submitted or new order is created. Sends instant WhatsApp greeting, SMS confirmation, auto-assigns Sales Rep via Round-Robin, notifies manager on high values, adds tags, and syncs row to Google Sheets.',
        trigger: 'form_submitted',
        active: true,
        totalRuns: 428,
        lastRunAt: new Date(Date.now() - 25 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        actions: [
          {
            id: 'act-1',
            type: 'send_whatsapp',
            name: 'Send Instant WhatsApp Greeting to Customer',
            enabled: true,
            config: {
              template: `Hello {customer_name}! 🌟 Thank you for ordering from Stekentstore.

📦 *Order Details:*
• *Order #:* {order_number}
• *Product:* {quantity}x {product_name}
• *Total Payable on Delivery:* {amount}
• *Delivery Address:* {delivery_address}

Our dedicated sales representative (*{rep_name}*) is reviewing your delivery details and will call your phone number (*{customer_phone}*) shortly to schedule express dispatch.

Reply *CONFIRM* if this address is 100% correct! 🚚`,
            },
          },
          {
            id: 'act-2',
            type: 'send_sms',
            name: 'Send Instant SMS via Termii / Twilio Gateway',
            enabled: true,
            config: {
              senderId: 'STEKENT',
              template: 'Stekentstore: Order {order_number} received for {product_name}. Total: {amount}. Our rep {rep_name} will call you shortly for dispatch.',
            },
          },
          {
            id: 'act-3',
            type: 'assign_sales_rep',
            name: 'Assign Sales Rep via Round-Robin Routing',
            enabled: true,
            config: {
              assignmentMethod: 'round_robin',
            },
          },
          {
            id: 'act-4',
            type: 'notify_manager',
            name: 'Notify Stekent Manager for High-Value Orders (> ₦50,000)',
            enabled: true,
            config: {
              managerAlertChannel: 'whatsapp',
              managerMessage: '🚨 [HIGH VALUE INBOUND ORDER] {order_number} from {customer_name} ({state}) totaling {amount}. Assigned to {rep_name}.',
            },
          },
          {
            id: 'act-5',
            type: 'add_tags',
            name: 'Apply CRM Tags',
            enabled: true,
            config: {
              tagsToAdd: ['Form-Inbound', 'COD-Pending', 'High-Priority-Lead'],
            },
          },
          {
            id: 'act-6',
            type: 'send_google_sheets',
            name: 'Sync Row to Google Sheets Master Spreadsheet',
            enabled: true,
            config: {
              googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit',
              googleSheetTab: 'Inbound_Submissions_2026',
            },
          },
          {
            id: 'act-7',
            type: 'start_follow_up',
            name: 'Schedule Auto-Confirmation Call Reminder',
            enabled: true,
            config: {
              delayMinutes: 30,
              followUpNote: 'First confirmation call attempt for new inbound order',
            },
          },
        ],
      },
      {
        id: 'wf-confirmed-dispatch',
        name: 'Order Confirmed → Logistics & Courier Handover',
        description: 'Triggers when a sales rep marks an order as Confirmed. Sends waybill expectation to customer, auto-assigns courier, and pushes webhook to GIG Logistics / Fez Delivery.',
        trigger: 'order_confirmed',
        active: true,
        totalRuns: 312,
        lastRunAt: new Date(Date.now() - 120 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        actions: [
          {
            id: 'act-c1',
            type: 'send_whatsapp',
            name: 'Send Customer Confirmation & Dispatch Notice',
            enabled: true,
            config: {
              template: `Good day {customer_name}! 🎉 Your Stekentstore order *{order_number}* is now *CONFIRMED*.

We are packaging your *{quantity}x {product_name}* for shipment. Our courier partner will deliver within 24-48 hours.
Please keep *{amount}* in cash or transfer ready. Questions? Chat directly with {rep_name}.`,
            },
          },
          {
            id: 'act-c2',
            type: 'trigger_webhook',
            name: 'Trigger Outbound Courier Logistics Webhook',
            enabled: true,
            config: {
              webhookUrl: 'https://api.giglogistics.ng/v2/shipments/create-waybill',
              httpMethod: 'POST',
              authHeader: 'Bearer gig_live_sec_884920119',
            },
          },
          {
            id: 'act-c3',
            type: 'add_tags',
            name: 'Apply Ready-For-Dispatch Tag',
            enabled: true,
            config: {
              tagsToAdd: ['Confirmed-Verified', 'Ready-For-Packing'],
            },
          },
          {
            id: 'act-c4',
            type: 'update_customer',
            name: 'Update Customer Lifetime Value (LTV)',
            enabled: true,
            config: {},
          },
        ],
      },
      {
        id: 'wf-failed-call-recovery',
        name: 'Failed Call / Unreachable Automated Recovery Flow',
        description: 'Triggers when a call log outcome is Phone Switched Off or Ringing No Answer. Automatically sends WhatsApp with 1-click confirmation and re-queues follow-up.',
        trigger: 'call_logged',
        triggerFilter: {
          callOutcome: 'Phone Switched Off',
        },
        active: true,
        totalRuns: 89,
        lastRunAt: new Date(Date.now() - 180 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        actions: [
          {
            id: 'act-fc1',
            type: 'send_whatsapp',
            name: 'Send "Sorry We Missed You" WhatsApp Message',
            enabled: true,
            config: {
              template: `Hi {customer_name}, {rep_name} from Stekentstore tried reaching you regarding your order {order_number} for {product_name}, but your phone was unavailable/switched off.

Please reply with the best time to reach you today so we can dispatch your parcel on time! 📲`,
            },
          },
          {
            id: 'act-fc2',
            type: 'start_follow_up',
            name: 'Queue Re-dial Attempt in 2 Hours',
            enabled: true,
            config: {
              delayMinutes: 120,
              followUpNote: '2nd call attempt after switched off phone',
            },
          },
        ],
      },
      {
        id: 'wf-delivered-loyalty',
        name: 'Order Delivered → Loyalty VIP Review & Re-Order Sequence',
        description: 'Triggered when Courier marks parcel as Delivered. Sends thank-you WhatsApp with VIP discount voucher and updates Google Sheets master ledger.',
        trigger: 'order_delivered',
        active: true,
        totalRuns: 245,
        lastRunAt: new Date(Date.now() - 360 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        actions: [
          {
            id: 'act-d1',
            type: 'send_whatsapp',
            name: 'Send VIP Thank You + Review Prompt',
            enabled: true,
            config: {
              template: `Hello {customer_name}! 🎁 We received confirmation that your Stekentstore package *{order_number}* was delivered safely.

We appreciate your business! As a valued VIP customer, here is an exclusive 15% discount coupon for your next purchase: *VIPLOYALTY15*.

Need any assistance or setup guides? Reply directly to this chat! ⭐`,
            },
          },
          {
            id: 'act-d2',
            type: 'send_google_sheets',
            name: 'Update Google Sheets with Delivered Status & Remittance',
            enabled: true,
            config: {
              googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit',
              googleSheetTab: 'Delivered_Ledger_2026',
            },
          },
          {
            id: 'act-d3',
            type: 'add_tags',
            name: 'Tag Customer as VIP Repeat Buyer',
            enabled: true,
            config: {
              tagsToAdd: ['Delivered-Paid', 'VIP-Loyal-Customer'],
            },
          },
        ],
      },
    ];

    seedWorkflows.forEach(wf => this.workflows.set(wf.id, wf));

    // 13. Seed Initial Automation Execution Logs
    const sampleExecutionLogs: AutomationExecutionLog[] = [
      {
        id: 'log-exec-1',
        workflowId: 'wf-inbound-omniflow',
        workflowName: 'New Inbound Order Omnichannel Fulfillment Flow',
        trigger: 'form_submitted',
        entityId: 'ord-103',
        entityIdentifier: 'Order STK-2026-1236 (Solar Fan COD)',
        customerName: 'Peter James',
        customerPhone: '0812 774 2201',
        executedActionsCount: 7,
        status: 'success',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        actionDetails: [
          {
            actionType: 'send_whatsapp',
            actionName: 'Send Instant WhatsApp Greeting',
            status: 'success',
            output: 'WhatsApp template generated and dispatched to 08127742201 via Stekent Cloud API.',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          },
          {
            actionType: 'send_sms',
            actionName: 'Send Instant SMS via Termii Gateway',
            status: 'success',
            output: 'SMS delivered with Sender ID STEKENT (Message ID: TMI-8891024).',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          },
          {
            actionType: 'assign_sales_rep',
            actionName: 'Assign Sales Rep via Round-Robin',
            status: 'success',
            output: 'Assigned to John Adeleke (usr-rep-3) based on active rotation queue.',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          },
          {
            actionType: 'notify_manager',
            actionName: 'Notify Stekent Manager',
            status: 'success',
            output: 'Manager alert pushed to Chioma (Admin). Order total: ₦130,000.',
            timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
          },
          {
            actionType: 'add_tags',
            actionName: 'Apply CRM Tags',
            status: 'success',
            output: 'Added tags: Form-Inbound, COD-Pending, High-Priority-Lead.',
            timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
          },
          {
            actionType: 'send_google_sheets',
            actionName: 'Sync Row to Google Sheets',
            status: 'success',
            output: 'Row appended to Inbound_Submissions_2026 (Row #428).',
            timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
          },
          {
            actionType: 'start_follow_up',
            actionName: 'Schedule Confirmation Call',
            status: 'success',
            output: 'Scheduled call follow-up for rep John Adeleke in 30 minutes.',
            timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
          },
        ],
      },
      {
        id: 'log-exec-2',
        workflowId: 'wf-confirmed-dispatch',
        workflowName: 'Order Confirmed → Logistics & Courier Handover',
        trigger: 'order_confirmed',
        entityId: 'ord-104',
        entityIdentifier: 'Order STK-2026-1237 (Solar PTZ Camera)',
        customerName: 'Fatima Bello',
        customerPhone: '0903 881 9902',
        executedActionsCount: 4,
        status: 'success',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        actionDetails: [
          {
            actionType: 'send_whatsapp',
            actionName: 'Send Customer Confirmation',
            status: 'success',
            output: 'Confirmation message sent to 09038819902.',
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          },
          {
            actionType: 'trigger_webhook',
            actionName: 'Courier Logistics Webhook',
            status: 'success',
            output: 'POST to GIG Logistics API returned HTTP 201. Waybill GIG-KNO-33910 generated.',
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          },
          {
            actionType: 'add_tags',
            actionName: 'Apply Ready-For-Dispatch Tag',
            status: 'success',
            output: 'Tags updated.',
            timestamp: new Date(Date.now() - 119 * 60000).toISOString(),
          },
          {
            actionType: 'update_customer',
            actionName: 'Update Customer LTV',
            status: 'success',
            output: 'Customer Fatima Bello LTV updated to ₦85,000.',
            timestamp: new Date(Date.now() - 119 * 60000).toISOString(),
          },
        ],
      },
    ];

    sampleExecutionLogs.forEach(l => this.automationLogs.set(l.id, l));

    // 14. Initial Audit Log
    this.logAudit(
      'System Seed Initialized',
      'settings',
      'sys-1',
      'Bootstrapped complete enterprise database with staff personas, catalog, orders, forms, workflows, and payroll rules',
      'usr-admin-1',
      'Stekent Admin (Chioma)'
    );
  }

  // --- AUDIT LOGS ---
  public logAudit(
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string,
    performedById: string,
    performedByName: string
  ): AuditLog {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entityType,
      entityId,
      details,
      performedById,
      performedByName,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.set(log.id, log);
    return log;
  }

  public getAuditLogs(): AuditLog[] {
    return Array.from(this.auditLogs.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- AUTH & USERS ---
  public authenticate(email: string, passwordHash: string): User | null {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase() && user.active) {
        return user;
      }
    }
    return null;
  }

  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  // --- PRODUCTS & INVENTORY ---
  public getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  public getProductById(id: string): Product | null {
    return this.products.get(id) || null;
  }

  public createProduct(data: {
    name: string;
    sku: string;
    costPrice: number;
    sellingPrice: number;
    currency?: string;
    stockQty: number;
    lowStockThreshold: number;
  }): Product {
    const id = `prd-${Date.now()}`;
    const product: Product = {
      id,
      name: data.name,
      sku: data.sku,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      currency: data.currency || 'NGN',
      stockQty: data.stockQty,
      lowStockThreshold: data.lowStockThreshold,
      reservedQty: 0,
      createdAt: new Date().toISOString(),
    };
    this.products.set(id, product);
    this.logAudit(
      'Product Created',
      'product',
      id,
      `Added ${product.name} (SKU: ${product.sku}) with ${product.stockQty} units`,
      'usr-admin-1',
      'Stekent Admin'
    );
    return product;
  }

  public updateProductStock(
    productId: string,
    delta: number,
    reason: string,
    userId: string = 'usr-inv-1'
  ): Product {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.stockQty;
    product.stockQty += delta;
    if (product.stockQty < 0) product.stockQty = 0;

    const user = this.users.get(userId);
    this.logAudit(
      'Stock Adjusted',
      'product',
      productId,
      `Stock for ${product.name} adjusted from ${previousStock} to ${product.stockQty} (${delta > 0 ? '+' : ''}${delta}). Reason: ${reason}`,
      userId,
      user?.name || 'Inventory Staff'
    );

    return product;
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  public findOrCreateCustomer(data: {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    state?: string;
  }): Customer {
    const cleanPhone = data.phone.trim().replace(/\s+/g, '');
    for (const cust of this.customers.values()) {
      if (cust.phone.replace(/\s+/g, '') === cleanPhone) {
        if (data.address && !cust.address) cust.address = data.address;
        if (data.state && !cust.state) cust.state = data.state;
        if (data.email && !cust.email) cust.email = data.email;
        return cust;
      }
    }

    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      state: data.state || 'Lagos',
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      deliveredOrders: 0,
      totalSpent: 0,
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  public getCustomerById(id: string): Customer | null {
    return this.customers.get(id) || null;
  }

  public createCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    state?: string;
  }): Customer {
    return this.findOrCreateCustomer(data);
  }

  public createNotification(data: {
    title: string;
    message: string;
    type?: any;
    linkTab?: string;
  }): any {
    const notif = {
      id: `notif-${Date.now()}`,
      title: data.title,
      message: data.message,
      type: data.type || 'order',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: data.linkTab || 'orders',
    };
    this.notifications.set(notif.id, notif as any);
    return notif;
  }

  // --- ROUND ROBIN ENGINE ---
  public getNextRoundRobinRep(): User | null {
    return this.pickNextRepForOrder();
  }

  public getRoundRobinState(): RoundRobinState {
    const activeReps = Array.from(this.users.values()).filter(
      u => u.role === 'sales_rep' && u.active
    );

    let lastRep: User | null = null;
    if (this.roundRobinState.lastAssignedRepId) {
      lastRep = this.users.get(this.roundRobinState.lastAssignedRepId) || null;
    }

    let nextRep: User | null = null;
    if (activeReps.length > 0) {
      if (!this.roundRobinState.lastAssignedRepId) {
        nextRep = activeReps[0];
      } else {
        const lastIndex = activeReps.findIndex(
          r => r.id === this.roundRobinState.lastAssignedRepId
        );
        const nextIndex = (lastIndex + 1) % activeReps.length;
        nextRep = activeReps[nextIndex];
      }
    }

    return {
      id: this.roundRobinState.id,
      lastAssignedRepId: this.roundRobinState.lastAssignedRepId,
      lastAssignedRep: lastRep,
      nextRep,
      activeReps,
      updatedAt: this.roundRobinState.updatedAt,
    };
  }

  private pickNextRepForOrder(): User | null {
    const activeReps = Array.from(this.users.values()).filter(
      u => u.role === 'sales_rep' && u.active
    );
    if (activeReps.length === 0) return null;

    let chosenRep: User;
    if (!this.roundRobinState.lastAssignedRepId) {
      chosenRep = activeReps[0];
    } else {
      const lastIndex = activeReps.findIndex(
        r => r.id === this.roundRobinState.lastAssignedRepId
      );
      const nextIndex = (lastIndex + 1) % activeReps.length;
      chosenRep = activeReps[nextIndex];
    }

    this.roundRobinState.lastAssignedRepId = chosenRep.id;
    this.roundRobinState.updatedAt = new Date().toISOString();
    return chosenRep;
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    const list = Array.from(this.orders.values()).map(order => {
      const customer = this.customers.get(order.customerId);
      const rep = order.assignedRepId ? this.users.get(order.assignedRepId) : null;
      const history = Array.from(this.statusHistories.values())
        .filter(h => h.orderId === order.id)
        .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
      const calls = Array.from(this.callLogs.values())
        .filter(c => c.orderId === order.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        ...order,
        customer,
        assignedRep: rep || null,
        statusHistory: history,
        callLogs: calls,
      };
    });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | null {
    const order = this.orders.get(id);
    if (!order) return null;

    const customer = this.customers.get(order.customerId);
    const rep = order.assignedRepId ? this.users.get(order.assignedRepId) : null;
    const history = Array.from(this.statusHistories.values())
      .filter(h => h.orderId === order.id)
      .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
    const calls = Array.from(this.callLogs.values())
      .filter(c => c.orderId === order.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      ...order,
      customer,
      assignedRep: rep || null,
      statusHistory: history,
      callLogs: calls,
    };
  }

  public createOrder(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    customerState?: string;
    productId: string;
    quantity: number;
    source?: string;
    campaignId?: string;
    assignedRepId?: string;
    deliveryCourier?: CourierPartner;
    shippingFee?: number;
    changedByUserId?: string;
  }): Order {
    const product = this.products.get(data.productId);
    if (!product) throw new Error('Product not found');

    const customer = this.findOrCreateCustomer({
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
      address: data.customerAddress,
      state: data.customerState,
    });

    // Determine rep: manual override or round-robin
    let assignedRep: User | null = null;
    if (data.assignedRepId) {
      assignedRep = this.users.get(data.assignedRepId) || null;
    } else {
      assignedRep = this.pickNextRepForOrder();
    }

    this.orderCounter += 1;
    const orderNumber = `STK-2026-${this.orderCounter}`;
    const orderId = `ord-${Date.now()}`;
    const totalAmount = product.sellingPrice * (data.quantity || 1);

    const order: Order = {
      id: orderId,
      orderNumber,
      customerId: customer.id,
      assignedRepId: assignedRep ? assignedRep.id : null,
      status: 'New',
      totalAmount,
      state: data.customerState || customer.state || 'Lagos',
      source: data.source || 'manual_form',
      campaignId: data.campaignId || null,
      deliveryCourier: data.deliveryCourier || null,
      waybillNumber: null,
      shippingFee: data.shippingFee || 2500,
      expectedDeliveryDate: null,
      remittanceStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };

    const item: OrderItem = {
      id: `item-${orderId}-0`,
      orderId,
      productId: product.id,
      product,
      qty: data.quantity || 1,
      unitPrice: product.sellingPrice,
    };

    this.orderItems.set(item.id, item);
    order.items.push(item);
    this.orders.set(orderId, order);

    // Reserve stock
    if (product.reservedQty !== undefined) {
      product.reservedQty += data.quantity || 1;
    }

    // Customer order counter
    customer.totalOrders = (customer.totalOrders || 0) + 1;

    // Log history
    const hist: OrderStatusHistory = {
      id: `hist-${orderId}-init`,
      orderId,
      status: 'New',
      note: `Order captured from ${order.source}. Assigned to ${assignedRep?.name || 'Unassigned'} via ${data.assignedRepId ? 'Manual Select' : 'Continuous Round-Robin'}.`,
      changedById: data.changedByUserId || 'usr-admin-1',
      changedAt: order.createdAt,
    };
    this.statusHistories.set(hist.id, hist);

    // Audit log
    const changedByUser = data.changedByUserId ? this.users.get(data.changedByUserId) : null;
    this.logAudit(
      'Order Created',
      'order',
      orderId,
      `Created ${orderNumber} for ${customer.name} (₦${totalAmount.toLocaleString()}) -> assigned to ${assignedRep?.name}`,
      data.changedByUserId || 'usr-admin-1',
      changedByUser?.name || 'System'
    );

    // Add In-App Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Order Dispatched to Pool',
      message: `${orderNumber} for ${customer.name} (₦${totalAmount.toLocaleString()}) assigned to ${assignedRep?.name}.`,
      type: 'order',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'orders',
    };
    this.notifications.set(notif.id, notif);

    return this.getOrderById(orderId)!;
  }

  public manuallyReassignOrder(
    orderId: string,
    newRepId: string,
    changedByUserId: string = 'usr-admin-1'
  ): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    const newRep = this.users.get(newRepId);
    if (!newRep) throw new Error('New representative not found');

    const oldRep = order.assignedRepId ? this.users.get(order.assignedRepId) : null;
    order.assignedRepId = newRep.id;
    order.updatedAt = new Date().toISOString();

    const changer = this.users.get(changedByUserId);
    const hist: OrderStatusHistory = {
      id: `hist-${orderId}-${Date.now()}`,
      orderId,
      status: order.status,
      note: `Manually reassigned from ${oldRep?.name || 'None'} to ${newRep.name}. Round-robin queue counter untouched.`,
      changedById: changedByUserId,
      changedAt: order.updatedAt,
    };
    this.statusHistories.set(hist.id, hist);

    this.logAudit(
      'Order Reassigned',
      'order',
      orderId,
      `Reassigned ${order.orderNumber} to ${newRep.name}`,
      changedByUserId,
      changer?.name || 'Staff'
    );

    return this.getOrderById(orderId)!;
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    changedByUserId: string = 'usr-admin-1'
  ): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    const prevStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    // If marked Delivered, update customer LTV and deduct stock from reserved & actual
    if (status === 'Delivered' && prevStatus !== 'Delivered') {
      const customer = this.customers.get(order.customerId);
      if (customer) {
        customer.deliveredOrders = (customer.deliveredOrders || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + Number(order.totalAmount);
      }
      order.items.forEach(item => {
        const prod = this.products.get(item.productId);
        if (prod) {
          prod.stockQty -= item.qty;
          if (prod.stockQty < 0) prod.stockQty = 0;
          if (prod.reservedQty) prod.reservedQty -= item.qty;
          if (prod.reservedQty && prod.reservedQty < 0) prod.reservedQty = 0;
        }
      });
    }

    // If returned from failed/dispatched, restore reserved stock
    if (status === 'Returned' || (status === 'Cancelled' && prevStatus !== 'Cancelled')) {
      order.items.forEach(item => {
        const prod = this.products.get(item.productId);
        if (prod && prod.reservedQty) {
          prod.reservedQty -= item.qty;
          if (prod.reservedQty < 0) prod.reservedQty = 0;
        }
      });
    }

    const changer = this.users.get(changedByUserId);
    const hist: OrderStatusHistory = {
      id: `hist-${orderId}-${Date.now()}`,
      orderId,
      status,
      note: note || `Status changed from ${prevStatus} to ${status}`,
      changedById: changedByUserId,
      changedAt: order.updatedAt,
    };
    this.statusHistories.set(hist.id, hist);

    this.logAudit(
      'Order Status Updated',
      'order',
      orderId,
      `Order ${order.orderNumber} transitioned to ${status}`,
      changedByUserId,
      changer?.name || 'Staff'
    );

    return this.getOrderById(orderId)!;
  }

  // --- LOGISTICS & COURIER DISPATCH ---
  public assignCourierDispatch(data: {
    orderId: string;
    courier: CourierPartner;
    waybillNumber: string;
    shippingFee?: number;
    expectedDeliveryDate?: string;
    changedByUserId?: string;
  }): Order {
    const order = this.orders.get(data.orderId);
    if (!order) throw new Error('Order not found');

    order.deliveryCourier = data.courier;
    order.waybillNumber = data.waybillNumber;
    if (data.shippingFee) order.shippingFee = data.shippingFee;
    if (data.expectedDeliveryDate) order.expectedDeliveryDate = data.expectedDeliveryDate;
    order.status = 'Dispatched';
    order.updatedAt = new Date().toISOString();

    const changer = this.users.get(data.changedByUserId || 'usr-del-1');
    const hist: OrderStatusHistory = {
      id: `hist-${order.id}-${Date.now()}`,
      orderId: order.id,
      status: 'Dispatched',
      note: `Assigned to ${data.courier}. Waybill: ${data.waybillNumber}. Expected: ${data.expectedDeliveryDate || 'N/A'}`,
      changedById: data.changedByUserId || 'usr-del-1',
      changedAt: order.updatedAt,
    };
    this.statusHistories.set(hist.id, hist);

    this.logAudit(
      'Courier Assigned',
      'courier',
      order.id,
      `Waybill ${data.waybillNumber} generated for ${data.courier} on ${order.orderNumber}`,
      data.changedByUserId || 'usr-del-1',
      changer?.name || 'Delivery Agent'
    );

    return this.getOrderById(order.id)!;
  }

  public recordDeliveryOutcome(data: {
    orderId: string;
    status: 'Delivered' | 'Failed' | 'Returned';
    podNotes?: string;
    failureReason?: string;
    changedByUserId?: string;
  }): Order {
    const order = this.orders.get(data.orderId);
    if (!order) throw new Error('Order not found');

    if (data.podNotes) order.podNotes = data.podNotes;
    if (data.failureReason) order.failureReason = data.failureReason;

    return this.updateOrderStatus(
      data.orderId,
      data.status,
      data.status === 'Delivered' ? data.podNotes : data.failureReason,
      data.changedByUserId
    );
  }

  // --- CALL LOGGING & FOLLOW-UP QUEUE ---
  public logCallAttempt(data: {
    orderId: string;
    repId: string;
    outcome: CallOutcome;
    note?: string;
    scheduledFollowUpAt?: string | null;
  }): CallLog {
    const order = this.orders.get(data.orderId);
    if (!order) throw new Error('Order not found');

    const rep = this.users.get(data.repId);
    const call: CallLog = {
      id: `call-${Date.now()}`,
      orderId: data.orderId,
      repId: data.repId,
      repName: rep?.name || 'Sales Rep',
      outcome: data.outcome,
      note: data.note || '',
      scheduledFollowUpAt: data.scheduledFollowUpAt || null,
      createdAt: new Date().toISOString(),
    };
    this.callLogs.set(call.id, call);

    // If scheduled follow-up, save to order
    if (data.scheduledFollowUpAt) {
      order.scheduledFollowUp = data.scheduledFollowUpAt;
    }

    // Auto-advance status if outcome is Answered & Confirmed
    if (data.outcome === 'Answered & Confirmed' && order.status === 'New') {
      this.updateOrderStatus(
        data.orderId,
        'Confirmed',
        `Call confirmed with customer by ${rep?.name}. Note: ${data.note || 'Confirmed'}`,
        data.repId
      );
    } else if (data.outcome === 'Price Dispute / Cancelled') {
      this.updateOrderStatus(
        data.orderId,
        'Cancelled',
        `Customer cancelled during call: ${data.note || 'Price/product mismatch'}`,
        data.repId
      );
    }

    return call;
  }

  public getCallLogs(orderId?: string): CallLog[] {
    const logs = Array.from(this.callLogs.values());
    if (orderId) {
      return logs.filter(l => l.orderId === orderId);
    }
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getFollowUpQueue(repId?: string): Order[] {
    const orders = this.getOrders().filter(o => o.status === 'New' || o.status === 'Confirmed');
    if (repId) {
      return orders.filter(o => o.assignedRepId === repId);
    }
    return orders;
  }

  // --- REPS PERFORMANCE LEADERBOARD ---
  public getRepPerformances(): RepPerformance[] {
    const reps = Array.from(this.users.values()).filter(u => u.role === 'sales_rep');
    const allOrders = Array.from(this.orders.values());

    const list: RepPerformance[] = reps.map(rep => {
      const repOrders = allOrders.filter(o => o.assignedRepId === rep.id);
      const assigned = repOrders.length;
      const confirmed = repOrders.filter(
        o => o.status === 'Confirmed' || o.status === 'Dispatched' || o.status === 'Delivered'
      ).length;
      const delivered = repOrders.filter(o => o.status === 'Delivered').length;
      const failed = repOrders.filter(o => o.status === 'Failed' || o.status === 'Returned').length;
      const deliveredValue = repOrders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + Number(o.totalAmount), 0);

      const confirmationRate = assigned > 0 ? (confirmed / assigned) * 100 : 0;
      const deliveredRate = confirmed > 0 ? (delivered / confirmed) * 100 : 0;

      // Commission estimation
      const estimatedCommission =
        confirmed * this.commissionRules.perConfirmedBonus +
        delivered * this.commissionRules.perDeliveredCommission -
        failed * this.commissionRules.returnPenalty;

      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        role: rep.role,
        assigned,
        confirmed,
        confirmationRate: Math.round(confirmationRate * 10) / 10,
        delivered,
        deliveredValue,
        deliveredRate: Math.round(deliveredRate * 10) / 10,
        failedCount: failed,
        estimatedCommission: Math.max(0, estimatedCommission),
        rank: 1,
      };
    });

    list.sort((a, b) => b.deliveredValue - a.deliveredValue);
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }

  // --- PAYROLL ENGINE ---
  public getCommissionRules(): CommissionRules {
    return { ...this.commissionRules };
  }

  public updateCommissionRules(rules: Partial<CommissionRules>, adminUserId: string = 'usr-admin-1'): CommissionRules {
    this.commissionRules = {
      ...this.commissionRules,
      ...rules,
    };
    this.logAudit(
      'Commission Rules Updated',
      'payroll',
      'rules-1',
      `Base: ₦${this.commissionRules.baseSalary}, Confirmed: ₦${this.commissionRules.perConfirmedBonus}, Delivered: ₦${this.commissionRules.perDeliveredCommission}, Return Pen: ₦${this.commissionRules.returnPenalty}`,
      adminUserId,
      'Admin'
    );
    return this.commissionRules;
  }

  public getPayrollPeriods(): PayrollPeriod[] {
    return Array.from(this.payrollPeriods.values());
  }

  public getPayrollRecords(periodId?: string): PayrollRecord[] {
    const list = Array.from(this.payrollRecords.values());
    if (periodId) {
      return list.filter(r => r.periodId === periodId);
    }
    return list;
  }

  public approvePayrollRecord(recordId: string, adminUserId: string = 'usr-admin-1'): PayrollRecord {
    const rec = this.payrollRecords.get(recordId);
    if (!rec) throw new Error('Payroll record not found');

    rec.status = 'Approved';
    rec.approvedAt = new Date().toISOString();

    const admin = this.users.get(adminUserId);
    this.logAudit(
      'Payroll Approved',
      'payroll',
      recordId,
      `Approved payroll for ${rec.repName} (₦${rec.netPayable.toLocaleString()})`,
      adminUserId,
      admin?.name || 'Admin'
    );

    return rec;
  }

  public markPayrollRecordPaid(recordId: string, adminUserId: string = 'usr-admin-1'): PayrollRecord {
    const rec = this.payrollRecords.get(recordId);
    if (!rec) throw new Error('Payroll record not found');

    rec.status = 'Paid';
    rec.paidAt = new Date().toISOString();

    this.logAudit(
      'Payroll Paid',
      'payroll',
      recordId,
      `Disbursed payment to ${rec.repName} (₦${rec.netPayable.toLocaleString()})`,
      adminUserId,
      'Admin'
    );

    return rec;
  }

  // --- COURIER REMITTANCES ---
  public getRemittances(): CourierRemittance[] {
    return Array.from(this.remittances.values());
  }

  public reconcileRemittance(id: string, adminUserId: string = 'usr-admin-1'): CourierRemittance {
    const rem = this.remittances.get(id);
    if (!rem) throw new Error('Remittance record not found');

    rem.status = 'Reconciled';
    this.logAudit(
      'Remittance Reconciled',
      'courier',
      id,
      `Reconciled ₦${rem.netRemitted.toLocaleString()} with ${rem.courierName} (Ref: ${rem.referenceNo})`,
      adminUserId,
      'Admin'
    );
    return rem;
  }

  // --- AUTOMATIONS & TEMPLATES ---
  public getAutomationTemplates(): AutomationTemplate[] {
    return Array.from(this.automationTemplates.values());
  }

  public updateAutomationTemplate(id: string, content: string, active?: boolean): AutomationTemplate {
    const tpl = this.automationTemplates.get(id);
    if (!tpl) throw new Error('Template not found');

    tpl.content = content;
    if (active !== undefined) tpl.active = active;
    return tpl;
  }

  public generateMessageForOrder(templateId: string, orderId: string): string {
    const tpl = this.automationTemplates.get(templateId);
    const order = this.getOrderById(orderId);
    if (!tpl || !order) return '';

    let text = tpl.content;
    text = text.replace(/{customer_name}/g, order.customer?.name || 'Customer');
    text = text.replace(/{order_number}/g, order.orderNumber);
    text = text.replace(/{product_name}/g, order.items?.[0]?.product?.name || 'Item');
    text = text.replace(/{amount}/g, `₦${order.totalAmount.toLocaleString()}`);
    text = text.replace(/{delivery_address}/g, order.customer?.address || order.state || 'Lagos');
    text = text.replace(/{courier_name}/g, order.deliveryCourier || 'Courier Service');
    text = text.replace(/{waybill_number}/g, order.waybillNumber || 'PENDING');
    text = text.replace(/{expected_delivery_date}/g, order.expectedDeliveryDate || 'Soon');

    return text;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): AppNotification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.get(id);
    if (notif) notif.read = true;
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach(n => (n.read = true));
  }

  // --- WEBHOOK INTAKE ---
  public ingestWebhook(source: 'woocommerce' | 'shopify' | 'custom', payload: any): Order {
    let customerName = 'Customer';
    let customerPhone = '0800 000 0000';
    let customerAddress = 'Lagos, Nigeria';
    let customerState = 'Lagos';
    let customerEmail = '';
    let productId = Array.from(this.products.keys())[0];
    let quantity = 1;

    if (source === 'woocommerce') {
      customerName = `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim() || 'WooCommerce Customer';
      customerPhone = payload.billing?.phone || payload.shipping?.phone || '0803 000 1122';
      customerAddress = `${payload.shipping?.address_1 || payload.billing?.address_1 || ''}, ${payload.shipping?.city || ''}`;
      customerState = payload.shipping?.state || payload.billing?.state || 'Lagos';
      customerEmail = payload.billing?.email || '';
      quantity = payload.line_items?.[0]?.quantity || 1;
    } else if (source === 'shopify') {
      customerName = `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Shopify Customer';
      customerPhone = payload.shipping_address?.phone || payload.customer?.phone || '0805 111 2233';
      customerAddress = `${payload.shipping_address?.address1 || ''}, ${payload.shipping_address?.city || ''}`;
      customerState = payload.shipping_address?.province || 'Lagos';
      customerEmail = payload.email || '';
      quantity = payload.line_items?.[0]?.quantity || 1;
    } else {
      customerName = payload.name || payload.customerName || 'Lead Customer';
      customerPhone = payload.phone || payload.customerPhone || '0812 000 3344';
      customerAddress = payload.address || payload.customerAddress || 'Lagos';
      customerState = payload.state || payload.customerState || 'Lagos';
      customerEmail = payload.email || '';
      productId = payload.productId || productId;
      quantity = payload.quantity || 1;
    }

    const order = this.createOrder({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerState,
      productId,
      quantity,
      source,
    });

    const webLog: WebhookLog = {
      id: `wh-${Date.now()}`,
      source,
      orderNumber: order.orderNumber,
      customerName: customerName,
      amount: order.totalAmount,
      status: 'success',
      rawPayload: JSON.stringify(payload).slice(0, 300),
      timestamp: new Date().toISOString(),
    };
    this.webhookLogs.set(webLog.id, webLog);

    return order;
  }

  public getWebhookLogs(): WebhookLog[] {
    return Array.from(this.webhookLogs.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- MARKETING CAMPAIGNS ---
  public getCampaigns(): MarketingCampaign[] {
    return Array.from(this.campaigns.values());
  }

  public createCampaign(data: {
    name: string;
    platform: MarketingCampaign['platform'];
    spend: number;
    ordersCount?: number;
    revenue?: number;
    status?: 'Active' | 'Paused';
  }): MarketingCampaign {
    const id = `cmp-${Date.now()}`;
    const ordersCount = data.ordersCount || 0;
    const revenue = data.revenue || 0;
    const roas = data.spend > 0 ? Math.round((revenue / data.spend) * 10) / 10 : 0;
    const cpo = ordersCount > 0 ? Math.round(data.spend / ordersCount) : 0;

    const campaign: MarketingCampaign = {
      id,
      name: data.name,
      platform: data.platform,
      spend: data.spend,
      ordersCount,
      revenue,
      roas,
      status: data.status || 'Active',
      costPerOrder: cpo,
      startDate: new Date().toISOString().split('T')[0],
    };

    this.campaigns.set(id, campaign);
    return campaign;
  }

  // --- GLOBAL STATS & KPI CALCULATION ---
  public getStats(): CRMStats {
    const allOrders = Array.from(this.orders.values());
    const allProducts = Array.from(this.products.values());
    const allCampaigns = Array.from(this.campaigns.values());
    const allPayrolls = Array.from(this.payrollRecords.values());

    const deliveredOrders = allOrders.filter(o => o.status === 'Delivered');
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const activeOrdersCount = allOrders.filter(
      o => o.status === 'New' || o.status === 'Confirmed' || o.status === 'Dispatched'
    ).length;
    const confirmedOrdersCount = allOrders.filter(o => o.status === 'Confirmed').length;
    const dispatchedOrdersCount = allOrders.filter(o => o.status === 'Dispatched').length;
    const deliveredCount = deliveredOrders.length;
    const pendingCount = allOrders.filter(o => o.status === 'New').length;
    const failedCount = allOrders.filter(o => o.status === 'Failed').length;
    const returnedCount = allOrders.filter(o => o.status === 'Returned').length;

    const totalResolved = deliveredCount + failedCount + returnedCount;
    const deliverySuccessRate = totalResolved > 0 ? Math.round((deliveredCount / totalResolved) * 100) : 85;

    const lowStockCount = allProducts.filter(p => p.stockQty <= p.lowStockThreshold).length;
    const totalInventoryUnits = allProducts.reduce((sum, p) => sum + p.stockQty, 0);
    const totalInventoryValuation = allProducts.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);

    const adSpend = allCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const logisticsCost = deliveredOrders.length * 3000 + (failedCount + returnedCount) * 1800;

    // COGS for delivered orders
    let cogsCost = 0;
    deliveredOrders.forEach(ord => {
      ord.items.forEach(item => {
        const prod = this.products.get(item.productId);
        if (prod) {
          cogsCost += prod.costPrice * item.qty;
        }
      });
    });

    const payrollCost = allPayrolls.reduce((sum, p) => sum + p.netPayable, 0);
    const netProfit = deliveredRevenue - cogsCost - logisticsCost - adSpend - payrollCost;

    // Pending courier remittances
    const pendingRemittances = Array.from(this.remittances.values())
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + r.netRemitted, 0);

    const rrState = this.getRoundRobinState();

    return {
      totalRevenue,
      deliveredRevenue,
      activeOrdersCount,
      confirmedOrdersCount,
      dispatchedOrdersCount,
      deliveredCount,
      pendingCount,
      failedCount,
      returnedCount,
      deliverySuccessRate,
      totalProductsCount: allProducts.length,
      lowStockCount,
      totalInventoryUnits,
      totalInventoryValuation,
      netProfit,
      adSpend,
      logisticsCost,
      cogsCost,
      payrollCost,
      courierPendingRemittance: pendingRemittances,
      roundRobin: {
        lastAssignedRepId: rrState.lastAssignedRepId,
        lastAssignedRepName: rrState.lastAssignedRep?.name || null,
        nextRepName: rrState.nextRep?.name || null,
        totalActiveReps: rrState.activeReps.length,
      },
    };
  }

  // ==================== FORM BUILDER METHODS ====================
  public getCustomForms(): CustomForm[] {
    return Array.from(this.customForms.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getCustomFormById(id: string): CustomForm | undefined {
    return this.customForms.get(id);
  }

  public getCustomFormBySlug(slug: string): CustomForm | undefined {
    return Array.from(this.customForms.values()).find(f => f.slug === slug);
  }

  public createCustomForm(data: Partial<CustomForm>): CustomForm {
    const id = `frm-${Date.now()}`;
    const slug = data.slug || `form-${Date.now()}`;
    const now = new Date().toISOString();

    const newForm: CustomForm = {
      id,
      name: data.name || 'Untitled Checkout Form',
      slug,
      description: data.description || '',
      stepType: data.stepType || 'multi_step',
      status: data.status || 'published',
      productId: data.productId || Array.from(this.products.keys())[0] || 'prd-1',
      theme: data.theme || {
        primaryColor: '#146B4E',
        backgroundColor: '#FFFFFF',
        borderRadius: 'medium',
        buttonStyle: 'shadow_bold',
        buttonText: 'CONFIRM CASH ON DELIVERY ORDER',
        buttonSubtext: '⚡ Pay When Delivery Rider Brings Your Package',
        showUrgencyTimer: true,
        timerMinutes: 15,
        showTrustBadges: true,
        showStockCounter: true,
        stockLeft: 10,
        layout: 'card_stepper',
      },
      fields: data.fields || [],
      coupons: data.coupons || [],
      paymentOptions: data.paymentOptions || {
        allowCOD: true,
        allowBankTransfer: true,
        allowCardPayment: false,
        allowPartialDeposit: false,
      },
      tracking: data.tracking || {},
      webhookUrl: data.webhookUrl || '',
      viewsCount: 0,
      submissionsCount: 0,
      totalRevenue: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.customForms.set(id, newForm);
    this.logAudit(
      'Form Created',
      'settings',
      id,
      `Created custom form "${newForm.name}" (Slug: ${newForm.slug})`,
      'usr-admin-1',
      'Stekent Admin'
    );
    return newForm;
  }

  public updateCustomForm(id: string, updates: Partial<CustomForm>): CustomForm {
    const existing = this.customForms.get(id);
    if (!existing) throw new Error('Form not found');

    const updated: CustomForm = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.customForms.set(id, updated);
    this.logAudit(
      'Form Updated',
      'settings',
      id,
      `Updated form layout/fields for "${updated.name}"`,
      'usr-admin-1',
      'Stekent Admin'
    );
    return updated;
  }

  public deleteCustomForm(id: string): boolean {
    const form = this.customForms.get(id);
    if (form) {
      this.customForms.delete(id);
      this.logAudit('Form Deleted', 'settings', id, `Deleted form "${form.name}"`, 'usr-admin-1', 'Stekent Admin');
      return true;
    }
    return false;
  }

  public incrementFormViews(id: string): void {
    const form = this.customForms.get(id);
    if (form) {
      form.viewsCount = (form.viewsCount || 0) + 1;
      this.customForms.set(id, form);
    }
  }

  public submitCustomForm(payload: FormSubmissionPayload): {
    order: Order;
    customer: Customer;
    form: CustomForm;
    executionLogs: AutomationExecutionLog[];
  } {
    const form = this.customForms.get(payload.formId);
    if (!form) throw new Error('Form not found');

    const product = this.products.get(payload.productId) || this.products.get(form.productId);
    if (!product) throw new Error('Associated product not found');

    // 1. Calculate Base Item Price & Quantity
    const qty = Math.max(1, payload.quantity || 1);
    let itemUnitPrice = product.sellingPrice;

    // Check if quantity tier selected
    if (payload.selectedTierId) {
      const tierField = form.fields.find(f => f.type === 'quantity_tiers');
      const tier = tierField?.quantityTiers?.find(t => t.id === payload.selectedTierId);
      if (tier && tier.fixedPrice) {
        itemUnitPrice = Math.round(tier.fixedPrice / qty);
      }
    }

    let subtotal = itemUnitPrice * qty;

    // 2. Order Bump calculation
    let bumpAmount = 0;
    if (payload.bumpAccepted) {
      const bumpField = form.fields.find(f => f.type === 'order_bump');
      if (bumpField?.orderBump?.enabled) {
        bumpAmount = bumpField.orderBump.price || 0;
      }
    }

    // 3. Upsell Modal calculation
    let upsellAmount = 0;
    if (payload.upsellAccepted) {
      const upsellField = form.fields.find(f => f.type === 'upsell_modal');
      if (upsellField?.upsell?.enabled) {
        upsellAmount = upsellField.upsell.price || 0;
      }
    }

    // 4. Coupon Discount calculation
    let discount = 0;
    if (payload.couponCode) {
      const validCoupon = form.coupons.find(
        c => c.active && c.code.trim().toUpperCase() === payload.couponCode?.trim().toUpperCase()
      );
      if (validCoupon) {
        if (validCoupon.type === 'percentage') {
          discount = Math.round((subtotal * validCoupon.discountValue) / 100);
        } else {
          discount = validCoupon.discountValue;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + bumpAmount + upsellAmount - discount);

    // 5. Customer Record Upsert
    let customer = Array.from(this.customers.values()).find(
      c => c.phone.replace(/\s+/g, '') === payload.customerPhone.replace(/\s+/g, '')
    );

    if (!customer) {
      customer = this.createCustomer({
        name: payload.customerName,
        phone: payload.customerPhone,
        email: payload.customerEmail || `${payload.customerPhone.replace(/\D/g, '')}@lead.stekent.ng`,
        address: payload.customerAddress || 'Direct Address Not Specified',
        state: payload.customerState || 'Lagos',
      });
    } else {
      customer.name = payload.customerName;
      if (payload.customerAddress) customer.address = payload.customerAddress;
      if (payload.customerState) customer.state = payload.customerState;
      this.customers.set(customer.id, customer);
    }

    // 6. Round Robin Sales Rep
    const assignedRep = this.getNextRoundRobinRep();

    // 7. Create CRM Order
    const notesParts = [
      `Inbound from Form Builder: "${form.name}" (Slug: ${form.slug})`,
      payload.bumpAccepted ? `+ Included Order Bump: ₦${bumpAmount.toLocaleString()}` : '',
      payload.upsellAccepted ? `+ Included Upsell Add-on: ₦${upsellAmount.toLocaleString()}` : '',
      payload.couponCode ? `+ Applied Coupon "${payload.couponCode}" (-₦${discount.toLocaleString()})` : '',
      payload.paymentMethod ? `Payment: ${payload.paymentMethod}` : '',
      payload.utm_source ? `UTM: ${payload.utm_source} / ${payload.utm_campaign || ''}` : '',
      payload.fbclid ? `FB Click ID: ${payload.fbclid}` : '',
      payload.ttclid ? `TikTok Click ID: ${payload.ttclid}` : '',
    ].filter(Boolean);

    const order = this.createOrder({
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      customerState: payload.customerState || customer.state || 'Lagos',
      productId: product.id,
      quantity: qty,
      source: payload.utm_source || 'website_form',
      assignedRepId: assignedRep?.id,
    });

    // Overwrite order total amount to match exact calculate with bumps/discounts
    order.totalAmount = totalAmount;
    this.orders.set(order.id, order);

    // Update form metrics
    form.submissionsCount = (form.submissionsCount || 0) + 1;
    form.totalRevenue = (form.totalRevenue || 0) + totalAmount;
    this.customForms.set(form.id, form);

    // Add In-App Notification
    this.createNotification({
      title: `New Form Order (${form.name})`,
      message: `₦${totalAmount.toLocaleString()} order received from ${customer.name} (${customer.state}). Rep: ${assignedRep?.name || 'Assigned'}.`,
      type: 'order',
      linkTab: 'orders',
    });

    // 8. Fire Automation Engine Workflows!
    const executionLogs = this.triggerAutomationWorkflows('form_submitted', {
      order,
      customer,
      form,
      product,
      assignedRep,
      payload,
    });

    return { order, customer, form, executionLogs };
  }

  // ==================== AUTOMATION ENGINE METHODS ====================
  public getWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getWorkflowById(id: string): AutomationWorkflow | undefined {
    return this.workflows.get(id);
  }

  public createWorkflow(data: Partial<AutomationWorkflow>): AutomationWorkflow {
    const id = `wf-${Date.now()}`;
    const now = new Date().toISOString();

    const newWorkflow: AutomationWorkflow = {
      id,
      name: data.name || 'Untitled Automation Workflow',
      description: data.description || '',
      trigger: data.trigger || 'form_submitted',
      triggerFilter: data.triggerFilter,
      actions: data.actions || [],
      active: data.active !== undefined ? data.active : true,
      totalRuns: 0,
      lastRunAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.workflows.set(id, newWorkflow);
    this.logAudit(
      'Workflow Created',
      'settings',
      id,
      `Created automation workflow "${newWorkflow.name}" (Trigger: ${newWorkflow.trigger})`,
      'usr-admin-1',
      'Stekent Admin'
    );
    return newWorkflow;
  }

  public updateWorkflow(id: string, updates: Partial<AutomationWorkflow>): AutomationWorkflow {
    const existing = this.workflows.get(id);
    if (!existing) throw new Error('Workflow not found');

    const updated: AutomationWorkflow = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(id, updated);
    this.logAudit(
      'Workflow Updated',
      'settings',
      id,
      `Updated automation workflow "${updated.name}" (${updated.actions.length} actions)`,
      'usr-admin-1',
      'Stekent Admin'
    );
    return updated;
  }

  public toggleWorkflowActive(id: string): AutomationWorkflow {
    const wf = this.workflows.get(id);
    if (!wf) throw new Error('Workflow not found');
    wf.active = !wf.active;
    wf.updatedAt = new Date().toISOString();
    this.workflows.set(id, wf);
    return wf;
  }

  public deleteWorkflow(id: string): boolean {
    const wf = this.workflows.get(id);
    if (wf) {
      this.workflows.delete(id);
      this.logAudit('Workflow Deleted', 'settings', id, `Deleted workflow "${wf.name}"`, 'usr-admin-1', 'Stekent Admin');
      return true;
    }
    return false;
  }

  public getAutomationLogs(): AutomationExecutionLog[] {
    return Array.from(this.automationLogs.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public triggerAutomationWorkflows(
    trigger: WorkflowTriggerType,
    context: {
      order?: Order;
      customer?: Customer;
      form?: CustomForm;
      product?: Product;
      assignedRep?: User | null;
      callLog?: CallLog;
      payload?: any;
    }
  ): AutomationExecutionLog[] {
    const activeWorkflows = Array.from(this.workflows.values()).filter(
      wf => wf.active && wf.trigger === trigger
    );

    const results: AutomationExecutionLog[] = [];

    for (const wf of activeWorkflows) {
      // Check filters
      if (wf.triggerFilter) {
        if (wf.triggerFilter.formId && context.form && wf.triggerFilter.formId !== 'all') {
          if (wf.triggerFilter.formId !== context.form.id) continue;
        }
        if (wf.triggerFilter.callOutcome && context.callLog) {
          if (wf.triggerFilter.callOutcome !== context.callLog.outcome) continue;
        }
        if (wf.triggerFilter.minOrderAmount && context.order) {
          if (context.order.totalAmount < wf.triggerFilter.minOrderAmount) continue;
        }
      }

      const log = this.executeWorkflowInstance(wf, trigger, context);
      results.push(log);
    }

    return results;
  }

  public executeWorkflowInstance(
    workflow: AutomationWorkflow,
    trigger: WorkflowTriggerType,
    context: {
      order?: Order;
      customer?: Customer;
      form?: CustomForm;
      product?: Product;
      assignedRep?: User | null;
      callLog?: CallLog;
      payload?: any;
    }
  ): AutomationExecutionLog {
    const now = new Date().toISOString();
    const customerName = context.customer?.name || context.payload?.customerName || 'Customer';
    const customerPhone = context.customer?.phone || context.payload?.customerPhone || '0800000000';
    const productName = context.product?.name || (context.order?.items?.[0] ? this.products.get(context.order.items[0].productId)?.name : 'Product');
    const orderNumber = context.order?.orderNumber || `STK-${Date.now().toString().slice(-4)}`;
    const formattedAmount = context.order ? `₦${context.order.totalAmount.toLocaleString()}` : '₦0';
    const repName = context.assignedRep?.name || (context.order?.assignedRepId ? this.users.get(context.order.assignedRepId)?.name : 'Sales Team');
    const deliveryAddress = context.customer?.address || context.payload?.customerAddress || context.order?.state || 'Lagos, Nigeria';

    const actionDetails: AutomationExecutionLog['actionDetails'] = [];

    for (const action of workflow.actions) {
      if (!action.enabled) {
        actionDetails.push({
          actionType: action.type,
          actionName: action.name,
          status: 'skipped',
          output: 'Action step disabled in workflow settings.',
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      let output = '';
      let status: 'success' | 'failed' = 'success';

      try {
        switch (action.type) {
          case 'send_whatsapp': {
            const rawTemplate = action.config.template || 'Hello {customer_name}, your order {order_number} is received!';
            const message = rawTemplate
              .replace(/{customer_name}/g, customerName)
              .replace(/{customer_phone}/g, customerPhone)
              .replace(/{product_name}/g, productName || 'Stekent Item')
              .replace(/{quantity}/g, String(context.order?.items?.[0]?.qty || 1))
              .replace(/{amount}/g, formattedAmount)
              .replace(/{order_number}/g, orderNumber)
              .replace(/{rep_name}/g, repName || 'Agent')
              .replace(/{delivery_address}/g, deliveryAddress)
              .replace(/{state}/g, context.order?.state || context.customer?.state || 'Nigeria');
            output = `WhatsApp message queued to ${customerPhone} via Stekent Cloud WhatsApp API. Preview: "${message.slice(0, 80)}..."`;
            break;
          }
          case 'send_sms': {
            const sender = action.config.senderId || 'STEKENT';
            const rawTemplate = action.config.template || 'Stekentstore: Order {order_number} received.';
            const smsText = rawTemplate
              .replace(/{customer_name}/g, customerName)
              .replace(/{order_number}/g, orderNumber)
              .replace(/{product_name}/g, productName || 'Item')
              .replace(/{amount}/g, formattedAmount)
              .replace(/{rep_name}/g, repName || 'Agent');
            output = `SMS dispatched via Termii SMS Gateway with Sender ID "${sender}" to ${customerPhone} (Ref: TMI-${Date.now().toString().slice(-6)}).`;
            break;
          }
          case 'send_email': {
            output = `Fulfillment confirmation email sent to ${context.customer?.email || 'customer@gmail.com'}.`;
            break;
          }
          case 'assign_sales_rep': {
            const assigned = context.assignedRep || this.getNextRoundRobinRep();
            output = `Lead assigned to sales agent "${assigned?.name || 'Michael Tunde'}" (${assigned?.id || 'usr-rep-1'}).`;
            break;
          }
          case 'notify_manager': {
            const channel = action.config.managerAlertChannel || 'whatsapp';
            output = `Manager instant alert delivered via ${channel.toUpperCase()} to Admin Chioma for order ${orderNumber}.`;
            break;
          }
          case 'add_tags': {
            const tags = action.config.tagsToAdd || ['Form-Inbound', 'COD'];
            output = `Applied ${tags.length} CRM tags to order: [${tags.join(', ')}].`;
            break;
          }
          case 'send_google_sheets': {
            const sheet = action.config.googleSheetTab || 'Inbound_Submissions';
            output = `Row appended successfully to Google Sheet tab "${sheet}" (Row #${Date.now().toString().slice(-3)}).`;
            break;
          }
          case 'trigger_webhook': {
            const url = action.config.webhookUrl || 'https://api.external-courier.com/shipments';
            output = `HTTP POST dispatched to ${url}. Status: 200 OK.`;
            break;
          }
          case 'send_external_crm': {
            output = `Payload synced to external CRM integration endpoint.`;
            break;
          }
          case 'start_follow_up': {
            const delay = action.config.delayMinutes || 30;
            output = `Scheduled automated callback task for rep in ${delay} minutes.`;
            break;
          }
          case 'update_customer': {
            output = `Customer lifetime order count and metrics updated in database.`;
            break;
          }
          default: {
            output = `Action "${action.name}" executed successfully.`;
          }
        }
      } catch (err: any) {
        status = 'failed';
        output = `Error executing action: ${err.message || 'Unknown error'}`;
      }

      actionDetails.push({
        actionType: action.type,
        actionName: action.name,
        status,
        output,
        timestamp: new Date().toISOString(),
      });
    }

    const log: AutomationExecutionLog = {
      id: `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      workflowId: workflow.id,
      workflowName: workflow.name,
      trigger,
      entityId: context.order?.id || context.form?.id || `ent-${Date.now()}`,
      entityIdentifier: context.order ? `Order ${orderNumber} (${productName})` : context.form ? `Form: ${context.form.name}` : `Event ${trigger}`,
      customerName,
      customerPhone,
      executedActionsCount: actionDetails.filter(a => a.status === 'success').length,
      actionDetails,
      status: actionDetails.some(a => a.status === 'failed') ? 'partial' : 'success',
      timestamp: now,
    };

    this.automationLogs.set(log.id, log);

    // Update workflow metrics
    workflow.totalRuns = (workflow.totalRuns || 0) + 1;
    workflow.lastRunAt = now;
    this.workflows.set(workflow.id, workflow);

    return log;
  }

  public testWorkflowRun(workflowId: string, sampleData?: any): AutomationExecutionLog {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error('Workflow not found');

    const sampleOrder = Array.from(this.orders.values())[0];
    const sampleCustomer = sampleOrder ? this.customers.get(sampleOrder.customerId) : Array.from(this.customers.values())[0];
    const sampleProduct = sampleOrder?.items?.[0] ? this.products.get(sampleOrder.items[0].productId) : Array.from(this.products.values())[0];
    const sampleRep = sampleOrder?.assignedRepId ? this.users.get(sampleOrder.assignedRepId) : Array.from(this.users.values())[1];

    return this.executeWorkflowInstance(wf, wf.trigger, {
      order: sampleOrder,
      customer: sampleCustomer,
      product: sampleProduct,
      assignedRep: sampleRep,
      payload: sampleData,
    });
  }
}

export const db = new Database();
