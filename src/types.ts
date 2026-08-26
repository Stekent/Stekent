export type Role = 'admin' | 'sales_rep' | 'delivery_agent' | 'inventory_manager';

export type OrderStatus = 'New' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Failed' | 'Returned';

export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'google' | 'organic' | 'woocommerce' | 'shopify';

export type CourierPartner = 'GIG Logistics' | 'Fez Delivery' | 'Speedaf' | 'Gokada' | 'Kwik Delivery' | 'In-house Dispatch';

export type CallOutcome =
  | 'Answered & Confirmed'
  | 'Phone Switched Off'
  | 'Ringing No Answer'
  | 'Call Busy'
  | 'Customer Requested Call Back'
  | 'Price Dispute / Cancelled'
  | 'Duplicate Order';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  active: boolean;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currency: string;
  stockQty: number;
  lowStockThreshold: number;
  reservedQty?: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  state?: string;
  createdAt: string;
  totalOrders?: number;
  deliveredOrders?: number;
  totalSpent?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  qty: number;
  unitPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  note?: string | null;
  changedById: string;
  changedBy?: User;
  changedAt: string;
}

export interface CallLog {
  id: string;
  orderId: string;
  repId: string;
  repName: string;
  outcome: CallOutcome;
  note?: string;
  scheduledFollowUpAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'order' | 'product' | 'customer' | 'payroll' | 'courier' | 'auth' | 'settings' | 'webhook';
  entityId?: string;
  details: string;
  performedById: string;
  performedByName: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  assignedRepId?: string | null;
  assignedRep?: User | null;
  status: OrderStatus;
  totalAmount: number;
  state?: string;
  source?: string | null;
  campaignId?: string | null;
  adClickId?: string | null;
  deliveryCourier?: CourierPartner | null;
  waybillNumber?: string | null;
  shippingFee?: number;
  expectedDeliveryDate?: string | null;
  failureReason?: string | null;
  podNotes?: string | null;
  remittanceStatus?: 'Pending' | 'Remitted' | 'Not Applicable';
  scheduledFollowUp?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  callLogs?: CallLog[];
}

export interface RoundRobinState {
  id: number;
  lastAssignedRepId: string | null;
  lastAssignedRep?: User | null;
  nextRep?: User | null;
  activeReps: User[];
  updatedAt: string;
}

export interface CreateOrderPayload {
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
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currency?: string;
  stockQty: number;
  lowStockThreshold: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: Platform;
  spend: number;
  ordersCount: number;
  revenue: number;
  roas: number;
  status: 'Active' | 'Paused' | 'Ended';
  costPerOrder: number;
  startDate: string;
}

export interface RepPerformance {
  id: string;
  name: string;
  email: string;
  role: Role;
  assigned: number;
  confirmed: number;
  confirmationRate: number;
  delivered: number;
  deliveredValue: number;
  deliveredRate: number;
  failedCount: number;
  estimatedCommission: number;
  rank: number;
}

export interface CommissionRules {
  baseSalary: number;
  perConfirmedBonus: number;
  perDeliveredCommission: number;
  returnPenalty: number;
}

export interface PayrollRecord {
  id: string;
  repId: string;
  repName: string;
  periodId: string;
  periodName: string;
  baseSalary: number;
  confirmedCount: number;
  confirmedBonus: number;
  deliveredCount: number;
  deliveredCommission: number;
  returnCount: number;
  returnPenalty: number;
  bonuses: number;
  deductions: number;
  netPayable: number;
  status: 'Draft' | 'Approved' | 'Paid';
  approvedAt?: string | null;
  paidAt?: string | null;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Reviewing' | 'Approved' | 'Paid';
  totalPayout: number;
  recordsCount: number;
}

export interface CourierRemittance {
  id: string;
  courierName: CourierPartner;
  period: string;
  totalWaybills: number;
  deliveredOrdersCount: number;
  collectedAmount: number;
  courierFee: number;
  netRemitted: number;
  status: 'Pending' | 'Reconciled';
  referenceNo: string;
  date: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  trigger: 'order_created' | 'order_confirmed' | 'order_dispatched' | 'out_for_delivery' | 'order_delivered' | 'follow_up';
  channel: 'whatsapp' | 'sms';
  content: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'followup' | 'payroll' | 'courier';
  read: boolean;
  timestamp: string;
  linkTab?: string;
}

export interface WebhookLog {
  id: string;
  source: 'woocommerce' | 'shopify' | 'custom';
  orderNumber: string;
  customerName: string;
  amount: number;
  status: 'success' | 'failed';
  rawPayload: string;
  timestamp: string;
}

// ==================== FORM BUILDER TYPES ====================

export type FormStepType = 'single' | 'multi_step';

export type FormFieldType =
  | 'text'
  | 'phone'
  | 'email'
  | 'address'
  | 'state_select'
  | 'product_select'
  | 'quantity_stepper'
  | 'quantity_tiers'
  | 'order_bump'
  | 'upsell_modal'
  | 'coupon_code'
  | 'payment_method'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'hidden'
  | 'countdown_timer'
  | 'trust_badges'
  | 'heading'
  | 'divider';

export interface FormFieldCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than';
  value: string;
}

export interface QuantityTier {
  id: string;
  quantity: number;
  label: string; // e.g. "Buy 2 Bottles (Most Popular)"
  discountPercentage?: number;
  fixedPrice?: number;
  badge?: string; // e.g. "SAVE ₦5,000 + FREE DELIVERY"
  isPopular?: boolean;
}

export interface OrderBumpConfig {
  enabled: boolean;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  highlightText?: string;
  productId?: string;
}

export interface UpsellConfig {
  enabled: boolean;
  heading: string;
  subheading: string;
  productId: string;
  productName: string;
  price: number;
  originalPrice: number;
  discountBadge: string;
  buttonText: string;
  skipText: string;
}

export interface CouponCode {
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  active: boolean;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  step?: number; // 1, 2, 3 for multi-step
  defaultValue?: string;
  options?: string[];
  hiddenKey?: 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content' | 'fbclid' | 'ttclid' | 'gclid' | 'custom';
  hiddenValue?: string;
  condition?: FormFieldCondition;
  helpText?: string;
  quantityTiers?: QuantityTier[];
  orderBump?: OrderBumpConfig;
  upsell?: UpsellConfig;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'pill';
  buttonStyle: 'solid' | 'gradient' | 'shadow_bold';
  buttonText: string;
  buttonSubtext?: string;
  showUrgencyTimer: boolean;
  timerMinutes: number;
  showTrustBadges: boolean;
  showStockCounter: boolean;
  stockLeft: number;
  layout: 'single_column' | 'two_column' | 'card_stepper';
}

export interface CustomForm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  stepType: FormStepType;
  status: 'published' | 'draft';
  productId: string;
  theme: FormTheme;
  fields: FormField[];
  coupons: CouponCode[];
  paymentOptions: {
    allowCOD: boolean;
    allowBankTransfer: boolean;
    allowCardPayment: boolean;
    allowPartialDeposit: boolean;
    depositAmount?: number;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  tracking: {
    facebookPixelId?: string;
    tiktokPixelId?: string;
    googleAnalyticsId?: string;
  };
  webhookUrl?: string;
  viewsCount: number;
  submissionsCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmissionPayload {
  formId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerState?: string;
  productId: string;
  quantity: number;
  selectedTierId?: string;
  bumpAccepted?: boolean;
  bumpPrice?: number;
  upsellAccepted?: boolean;
  upsellPrice?: number;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod: 'COD' | 'Bank Transfer' | 'Card' | 'Deposit';
  depositPaid?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  customFields?: Record<string, string>;
}

// ==================== AUTOMATION ENGINE TYPES ====================

export type WorkflowTriggerType =
  | 'form_submitted'
  | 'order_created'
  | 'order_confirmed'
  | 'order_dispatched'
  | 'order_delivered'
  | 'order_failed'
  | 'order_returned'
  | 'call_logged'
  | 'inventory_low';

export type WorkflowActionType =
  | 'send_whatsapp'
  | 'send_sms'
  | 'send_email'
  | 'assign_sales_rep'
  | 'notify_manager'
  | 'create_order'
  | 'update_customer'
  | 'add_tags'
  | 'start_follow_up'
  | 'trigger_webhook'
  | 'send_google_sheets'
  | 'send_external_crm';

export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  name: string;
  enabled: boolean;
  config: {
    template?: string;
    senderId?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    subject?: string;
    assignmentMethod?: 'round_robin' | 'state_based' | 'specific_rep';
    specificRepId?: string;
    stateMapping?: Record<string, string>;
    managerAlertChannel?: 'in_app' | 'whatsapp' | 'slack_webhook';
    managerMessage?: string;
    orderStatus?: OrderStatus;
    tagsToAdd?: string[];
    delayMinutes?: number;
    followUpNote?: string;
    webhookUrl?: string;
    httpMethod?: 'POST' | 'GET';
    authHeader?: string;
    googleSheetUrl?: string;
    googleSheetTab?: string;
    crmEndpointUrl?: string;
  };
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTriggerType;
  triggerFilter?: {
    formId?: string;
    source?: string;
    state?: string;
    minOrderAmount?: number;
    callOutcome?: CallOutcome;
  };
  actions: WorkflowAction[];
  active: boolean;
  totalRuns: number;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: WorkflowTriggerType;
  entityId: string;
  entityIdentifier: string;
  customerName?: string;
  customerPhone?: string;
  executedActionsCount: number;
  actionDetails: Array<{
    actionType: WorkflowActionType;
    actionName: string;
    status: 'success' | 'failed' | 'skipped';
    output: string;
    timestamp: string;
  }>;
  status: 'success' | 'failed' | 'partial';
  error?: string;
  timestamp: string;
}

export interface CRMStats {
  totalRevenue: number;
  deliveredRevenue: number;
  activeOrdersCount: number;
  confirmedOrdersCount: number;
  dispatchedOrdersCount: number;
  deliveredCount: number;
  pendingCount: number;
  failedCount: number;
  returnedCount: number;
  deliverySuccessRate: number;
  totalProductsCount: number;
  lowStockCount: number;
  totalInventoryUnits: number;
  totalInventoryValuation: number;
  netProfit: number;
  adSpend: number;
  logisticsCost: number;
  cogsCost: number;
  payrollCost: number;
  courierPendingRemittance: number;
  roundRobin: {
    lastAssignedRepId: string | null;
    lastAssignedRepName: string | null;
    nextRepName: string | null;
    totalActiveReps: number;
  };
}
