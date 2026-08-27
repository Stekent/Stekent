import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  Bell,
  Tag,
  Table,
  Clock,
  Globe,
  Share2,
  Sliders,
  MoveDown,
  MoveUp,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import {
  AutomationWorkflow,
  WorkflowTriggerType,
  WorkflowAction,
  WorkflowActionType,
  User,
  CustomForm,
} from '../../types';
import { api } from '../../services/api';

interface WorkflowEditorModalProps {
  initialWorkflow?: AutomationWorkflow | null;
  users?: User[];
  forms?: CustomForm[];
  onClose: () => void;
  onSaved: (workflow: AutomationWorkflow) => void;
}

const TRIGGER_OPTIONS: Array<{
  trigger: WorkflowTriggerType;
  label: string;
  description: string;
  icon: any;
}> = [
  {
    trigger: 'form_submitted',
    label: 'When a Form is Submitted',
    description: 'Fires instantly when a customer submits any checkout or lead capture form.',
    icon: Layers,
  },
  {
    trigger: 'order_created',
    label: 'When a New Order is Created',
    description: 'Fires when an order enters the CRM (via form, webhook, or manual entry).',
    icon: Zap,
  },
  {
    trigger: 'order_confirmed',
    label: 'When Order is Confirmed by Rep',
    description: 'Fires when a sales agent verifies the customer phone call and marks Confirmed.',
    icon: CheckCircle2,
  },
  {
    trigger: 'order_dispatched',
    label: 'When Order is Dispatched via Courier',
    description: 'Fires when waybill and courier partner (GIG, Fez, Speedaf) are assigned.',
    icon: Globe,
  },
  {
    trigger: 'order_delivered',
    label: 'When Order is Delivered & Paid',
    description: 'Fires when courier confirms parcel delivery and Cash on Delivery is collected.',
    icon: Sparkles,
  },
  {
    trigger: 'order_failed',
    label: 'When Delivery Fails / Customer Unreachable',
    description: 'Fires when dispatch rider reports customer unreachable or delivery failed.',
    icon: AlertCircle,
  },
  {
    trigger: 'order_returned',
    label: 'When Parcel is Returned to Warehouse',
    description: 'Fires when a returned parcel is checked back into warehouse inventory.',
    icon: X,
  },
  {
    trigger: 'call_logged',
    label: 'When Rep Logs a Call Outcome',
    description: 'Fires when rep logs No Answer, Busy, Switched Off, or Call Back Later.',
    icon: Phone,
  },
];

const ACTION_PALETTE_ITEMS: Array<{
  type: WorkflowActionType;
  label: string;
  category: string;
  icon: any;
  defaultConfig: any;
}> = [
  {
    type: 'send_whatsapp',
    label: 'Send WhatsApp Message',
    category: 'Communication',
    icon: MessageSquare,
    defaultConfig: {
      template:
        'Hello {customer_name}, your order for {quantity}x {product_name} (#{order_number}) is received! Total: ₦{amount}. Our agent {rep_name} will call you shortly.',
    },
  },
  {
    type: 'send_sms',
    label: 'Send SMS via Termii / Bulk SMS',
    category: 'Communication',
    icon: Phone,
    defaultConfig: {
      senderId: 'STEKENT',
      template: 'Hi {customer_name}, order #{order_number} confirmed. Free delivery to {state}. Thanks!',
    },
  },
  {
    type: 'send_email',
    label: 'Send Notification Email',
    category: 'Communication',
    icon: Mail,
    defaultConfig: {
      subject: 'Order #{order_number} Confirmation - Stekent Direct',
      body: '<p>Hi {customer_name},</p><p>We received your order #{order_number} for {quantity}x {product_name}. Total: ₦{amount}.</p>',
    },
  },
  {
    type: 'assign_sales_rep',
    label: 'Assign Sales Rep (Round Robin / State)',
    category: 'CRM Routing',
    icon: UserCheck,
    defaultConfig: {
      strategy: 'round_robin',
    },
  },
  {
    type: 'notify_manager',
    label: 'Notify Admin / Manager (Chioma)',
    category: 'Alerts',
    icon: Bell,
    defaultConfig: {
      channel: 'whatsapp',
      message: '🚨 Alert: Order #{order_number} from {customer_name} requires priority oversight.',
    },
  },
  {
    type: 'add_tags',
    label: 'Add CRM Tags',
    category: 'CRM Routing',
    icon: Tag,
    defaultConfig: {
      tags: ['Form-Inbound', 'High-Priority'],
    },
  },
  {
    type: 'send_google_sheets',
    label: 'Append Row to Google Sheets',
    category: 'External Sync',
    icon: FileSpreadsheet,
    defaultConfig: {
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      sheetName: 'All Inbound Orders',
    },
  },
  {
    type: 'start_follow_up',
    label: 'Schedule Automated Follow-up Call',
    category: 'CRM Routing',
    icon: Clock,
    defaultConfig: {
      delayMinutes: 30,
      note: 'Auto scheduled follow-up after inbound form submission.',
    },
  },
  {
    type: 'trigger_webhook',
    label: 'Trigger Outbound Webhook (Zapier / Make / n8n)',
    category: 'External Sync',
    icon: Globe,
    defaultConfig: {
      url: 'https://webhook.site/stekent-automation-sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  },
  {
    type: 'send_external_crm',
    label: 'Push to External CRM / ERP',
    category: 'External Sync',
    icon: Share2,
    defaultConfig: {
      crmName: 'HubSpot',
    },
  },
];

const MERGE_TAGS = [
  { tag: '{customer_name}', desc: 'Customer Full Name' },
  { tag: '{customer_phone}', desc: 'Phone Number' },
  { tag: '{product_name}', desc: 'Product Name' },
  { tag: '{quantity}', desc: 'Order Quantity' },
  { tag: '{amount}', desc: 'Total Amount (₦)' },
  { tag: '{order_number}', desc: 'Order ID' },
  { tag: '{rep_name}', desc: 'Assigned Agent' },
  { tag: '{delivery_address}', desc: 'Street Address' },
  { tag: '{state}', desc: 'Delivery State' },
];

export const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({
  initialWorkflow,
  users = [],
  forms = [],
  onClose,
  onSaved,
}) => {
  const [workflow, setWorkflow] = useState<AutomationWorkflow>(() => {
    if (initialWorkflow) return JSON.parse(JSON.stringify(initialWorkflow));
    return {
      id: '',
      name: 'Omnichannel Inbound Form Automation',
      description: 'Triggered when customer submits form: Sends instant WhatsApp, assigns rep, adds tag, and logs to Google Sheets.',
      trigger: 'form_submitted',
      active: true,
      totalRuns: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          id: 'act-1',
          type: 'send_whatsapp',
          name: 'Instant WhatsApp Customer Greeting',
          enabled: true,
          config: {
            template:
              'Hello {customer_name}! 🚀 We have received your order for {quantity}x {product_name} (#{order_number}) amounting to ₦{amount}. Our sales specialist {rep_name} will call you shortly to confirm doorstep dispatch. Thank you for choosing Stekent!',
          },
        },
        {
          id: 'act-2',
          type: 'assign_sales_rep',
          name: 'Round-Robin Agent Distribution',
          enabled: true,
          config: {
            strategy: 'round_robin',
          },
        },
        {
          id: 'act-3',
          type: 'add_tags',
          name: 'Tag Order as Direct Form Inbound',
          enabled: true,
          config: {
            tags: ['Form-Inbound', 'High-Priority-COD'],
          },
        },
        {
          id: 'act-4',
          type: 'send_google_sheets',
          name: 'Sync Row to Master Google Sheet',
          enabled: true,
          config: {
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            sheetName: 'Live Orders Feed',
          },
        },
      ],
    };
  });

  const [selectedActionId, setSelectedActionId] = useState<string | null>(workflow.actions[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const selectedAction = workflow.actions.find(a => a.id === selectedActionId);

  const handleAddAction = (item: typeof ACTION_PALETTE_ITEMS[0]) => {
    const newAct: WorkflowAction = {
      id: `act-${Date.now()}`,
      type: item.type,
      name: item.label,
      enabled: true,
      config: JSON.parse(JSON.stringify(item.defaultConfig)),
    };
    setWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, newAct],
    }));
    setSelectedActionId(newAct.id);
  };

  const handleUpdateSelectedAction = (updates: Partial<WorkflowAction>) => {
    if (!selectedActionId) return;
    setWorkflow(prev => ({
      ...prev,
      actions: prev.actions.map(a => (a.id === selectedActionId ? { ...a, ...updates } : a)),
    }));
  };

  const handleDeleteAction = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== id),
    }));
    if (selectedActionId === id) {
      setSelectedActionId(workflow.actions.find(a => a.id !== id)?.id || null);
    }
  };

  const handleMoveAction = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= workflow.actions.length) return;
    const newActs = [...workflow.actions];
    const [moved] = newActs.splice(index, 1);
    newActs.splice(newIndex, 0, moved);
    setWorkflow(prev => ({ ...prev, actions: newActs }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let saved: AutomationWorkflow;
      if (workflow.id) {
        saved = await api.updateWorkflow(workflow.id, workflow);
      } else {
        saved = await api.createWorkflow(workflow);
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      alert(`Save Error: ${err.message || 'Failed to save workflow'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const sampleData = {
        order: {
          id: 'test-ord-01',
          orderNumber: 'ORD-9921',
          totalAmount: 42000,
          quantity: 2,
          customerName: 'Chinedu Okafor',
          customerPhone: '0803 555 1234',
          customerState: 'Lagos',
          customerAddress: '15 Admiralty Way, Lekki Phase 1',
        },
        customer: {
          name: 'Chinedu Okafor',
          phone: '0803 555 1234',
          state: 'Lagos',
        },
        product: {
          name: 'Solar Generator 500W',
          sellingPrice: 42000,
        },
        assignedRep: users[0] || { name: 'Michael Obi' },
      };

      if (workflow.id) {
        const res = await api.testWorkflow(workflow.id, sampleData);
        setTestResult(res.log);
      } else {
        // Mock simulated test run if unsaved
        setTestResult({
          workflowName: workflow.name,
          trigger: workflow.trigger,
          status: 'success',
          executedActionsCount: workflow.actions.length,
          actionDetails: workflow.actions.map(a => ({
            actionName: a.name,
            actionType: a.type,
            status: 'success',
            output: `Executed successfully with config (${a.type})`,
          })),
        });
      }
    } catch (err: any) {
      alert(`Test Error: ${err.message || 'Test run failed'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const insertTag = (tag: string) => {
    if (!selectedAction || selectedAction.type !== 'send_whatsapp' && selectedAction.type !== 'send_sms') return;
    const current = selectedAction.config.template || '';
    handleUpdateSelectedAction({
      config: { ...selectedAction.config, template: `${current} ${tag}` },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex flex-col">
      {/* TOP WORKFLOW EDITOR HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={workflow.name}
                onChange={e => setWorkflow({ ...workflow, name: e.target.value })}
                className="font-bold text-base bg-transparent border-b border-slate-700 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none px-1 text-white"
              />
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${workflow.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                {workflow.active ? '● Active' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Zapier / Make / n8n Built-in Automation Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleRunTest}
            disabled={isTesting}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-700 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTesting ? 'Simulating...' : 'Test Run Pipeline'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Workflow'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE: LEFT (ACTIONS PALETTE) | CENTER (PIPELINE CANVAS) | RIGHT (ACTION CONFIG) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: ACTION PALETTE */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300">
          <div className="p-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Automation Action</h4>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
            {/* Communication Actions */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messaging & Notifications</span>
              </div>
              <div className="space-y-1.5">
                {ACTION_PALETTE_ITEMS.filter(a => a.category === 'Communication' || a.category === 'Alerts').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddAction(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-emerald-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-xs truncate max-w-[150px]">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CRM Routing Actions */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>CRM & Routing</span>
              </div>
              <div className="space-y-1.5">
                {ACTION_PALETTE_ITEMS.filter(a => a.category === 'CRM Routing').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddAction(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-blue-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-xs truncate max-w-[150px]">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* External Sync Actions */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>External Sync</span>
              </div>
              <div className="space-y-1.5">
                {ACTION_PALETTE_ITEMS.filter(a => a.category === 'External Sync').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleAddAction(item)}
                      className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 hover:border-amber-500 text-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-amber-400" />
                        <span className="font-medium text-xs truncate max-w-[150px]">{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: PIPELINE VISUAL CANVAS */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-lg space-y-4">
            {/* 1. TRIGGER BLOCK */}
            <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-xl relative text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Step 1: Trigger Event
                  </span>
                </div>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">When this happens:</label>
                <select
                  value={workflow.trigger}
                  onChange={e => setWorkflow({ ...workflow, trigger: e.target.value as WorkflowTriggerType })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                >
                  {TRIGGER_OPTIONS.map(opt => (
                    <option key={opt.trigger} value={opt.trigger}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Form Filter if trigger is form_submitted */}
              {workflow.trigger === 'form_submitted' && forms.length > 0 && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Filter by Specific Form (Optional):</label>
                  <select
                    value={workflow.triggerFilter?.formId || ''}
                    onChange={e =>
                      setWorkflow({
                        ...workflow,
                        triggerFilter: { ...workflow.triggerFilter, formId: e.target.value || undefined },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300"
                  >
                    <option value="">Any Inbound Form</option>
                    {forms.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} (/{f.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* PIPELINE CONNECTOR LINE */}
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-slate-700" />
            </div>

            {/* 2. ACTIONS PIPELINE */}
            <div className="space-y-3">
              {workflow.actions.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                  No actions added yet. Click an action on the left palette to add it to the pipeline.
                </div>
              ) : (
                workflow.actions.map((action, idx) => {
                  const isSelected = action.id === selectedActionId;
                  const itemDef = ACTION_PALETTE_ITEMS.find(p => p.type === action.type);
                  const Icon = itemDef?.icon || Sparkles;

                  return (
                    <React.Fragment key={action.id}>
                      <div
                        onClick={() => setSelectedActionId(action.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative shadow-lg ${
                          isSelected
                            ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Floating Action Buttons */}
                        <div className="absolute right-3 top-3 flex items-center space-x-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleMoveAction(idx, 'up');
                            }}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-800 text-slate-400 rounded disabled:opacity-20"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleMoveAction(idx, 'down');
                            }}
                            disabled={idx === workflow.actions.length - 1}
                            className="p-1 hover:bg-slate-800 text-slate-400 rounded disabled:opacity-20"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteAction(action.id);
                            }}
                            className="p-1 hover:bg-red-950 text-red-400 rounded"
                            title="Delete Action"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400 border border-slate-700">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Action #{idx + 1}
                            </span>
                            <h4 className="font-bold text-slate-100 text-sm">{action.name}</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {action.type === 'send_whatsapp' && (action.config?.template || 'WhatsApp Message')}
                              {action.type === 'send_sms' && `SMS Sender ID: ${action.config?.senderId || 'STEKENT'}`}
                              {action.type === 'assign_sales_rep' && `Routing: ${action.config?.strategy || 'round_robin'}`}
                              {action.type === 'add_tags' && `Tags: ${(action.config?.tags || []).join(', ')}`}
                              {action.type === 'send_google_sheets' && `Sheet: ${action.config?.sheetName || 'Orders'}`}
                              {action.type === 'trigger_webhook' && `POST: ${action.config?.url || 'Webhook URL'}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Connectors between actions */}
                      {idx < workflow.actions.length - 1 && (
                        <div className="flex justify-center">
                          <div className="w-0.5 h-4 bg-slate-800" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* TEST EXECUTION OUTPUT CARD */}
            {testResult && (
              <div className="mt-6 p-4 bg-slate-900 border border-emerald-500/50 rounded-2xl text-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pipeline Test Success ({testResult.executedActionsCount} Actions Executed)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Simulation Mode</span>
                </div>

                <div className="space-y-2">
                  {testResult.actionDetails?.map((step: any, sIdx: number) => (
                    <div key={sIdx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          #{sIdx + 1} {step.actionName}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">● Executed</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono break-all">{step.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: ACTION CONFIG INSPECTOR */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-slate-300">
          <div className="p-3.5 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configure Action</h4>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {selectedAction ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1">Action Name</label>
                  <input
                    type="text"
                    value={selectedAction.name}
                    onChange={e => handleUpdateSelectedAction({ name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* WHATSAPP MESSAGE CONFIG */}
                {selectedAction.type === 'send_whatsapp' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">WhatsApp Message Template</label>
                      <textarea
                        rows={6}
                        value={selectedAction.config?.template || ''}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, template: e.target.value },
                          })
                        }
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Merge Tag Pills */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                        Insert Merge Tags:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {MERGE_TAGS.map(t => (
                          <button
                            key={t.tag}
                            type="button"
                            onClick={() => insertTag(t.tag)}
                            className="bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
                            title={t.desc}
                          >
                            {t.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SMS CONFIG */}
                {selectedAction.type === 'send_sms' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Sender ID (11 Chars Max)</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={selectedAction.config?.senderId || 'STEKENT'}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, senderId: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">SMS Message</label>
                      <textarea
                        rows={4}
                        value={selectedAction.config?.template || ''}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, template: e.target.value },
                          })
                        }
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* ASSIGN SALES REP CONFIG */}
                {selectedAction.type === 'assign_sales_rep' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Assignment Method</label>
                      <select
                        value={selectedAction.config?.strategy || 'round_robin'}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, strategy: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      >
                        <option value="round_robin">Round-Robin (Fair Queue Rotation)</option>
                        <option value="state_based">State-Based Geolocation Routing</option>
                        <option value="specific_rep">Specific Agent Always</option>
                      </select>
                    </div>

                    {selectedAction.config?.strategy === 'specific_rep' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Select Specific Rep</label>
                        <select
                          value={selectedAction.config?.specificRepId || ''}
                          onChange={e =>
                            handleUpdateSelectedAction({
                              config: { ...selectedAction.config, specificRepId: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                        >
                          <option value="">Select an agent</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* ADD TAGS CONFIG */}
                {selectedAction.type === 'add_tags' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Tags (Comma-separated)</label>
                      <input
                        type="text"
                        value={(selectedAction.config?.tags || []).join(', ')}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: {
                              ...selectedAction.config,
                              tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                            },
                          })
                        }
                        placeholder="Form-Inbound, High-Priority, VIP"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* GOOGLE SHEETS CONFIG */}
                {selectedAction.type === 'send_google_sheets' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Google Sheet Name / Tab</label>
                      <input
                        type="text"
                        value={selectedAction.config?.sheetName || 'Orders'}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, sheetName: e.target.value },
                          })
                        }
                        placeholder="e.g. Master Orders 2026"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Google Spreadsheet ID</label>
                      <input
                        type="text"
                        value={selectedAction.config?.spreadsheetId || ''}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, spreadsheetId: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}

                {/* WEBHOOK CONFIG */}
                {selectedAction.type === 'trigger_webhook' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Webhook URL</label>
                      <input
                        type="text"
                        value={selectedAction.config?.url || ''}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, url: e.target.value },
                          })
                        }
                        placeholder="https://hooks.zapier.com/..."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}

                {/* FOLLOW UP CONFIG */}
                {selectedAction.type === 'start_follow_up' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Schedule Delay (Minutes)</label>
                      <input
                        type="number"
                        value={selectedAction.config?.delayMinutes || 30}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, delayMinutes: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Follow-up Task Note for Rep</label>
                      <input
                        type="text"
                        value={selectedAction.config?.note || ''}
                        onChange={e =>
                          handleUpdateSelectedAction({
                            config: { ...selectedAction.config, note: e.target.value },
                          })
                        }
                        placeholder="Call customer to confirm order delivery details."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6">Select an action in the center pipeline to configure.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
