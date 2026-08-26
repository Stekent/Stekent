import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Play,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Sliders,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  Bell,
  Tag,
  FileSpreadsheet,
  Globe,
  Share2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  History,
  BookOpen,
} from 'lucide-react';
import { AutomationWorkflow, AutomationExecutionLog, User, CustomForm } from '../types';
import { api } from '../services/api';
import { WorkflowEditorModal } from '../components/automation/WorkflowEditorModal';

export const AutomationEnginePage: React.FC = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [logs, setLogs] = useState<AutomationExecutionLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflows' | 'logs' | 'recipes'>('workflows');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AutomationWorkflow | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchWorkflowsAndLogs = async () => {
    try {
      setLoading(true);
      const [fetchedWorkflows, fetchedLogs, fetchedUsers, fetchedForms] = await Promise.all([
        api.getWorkflows(),
        api.getAutomationLogs(),
        api.getUsers(),
        api.getForms(),
      ]);
      setWorkflows(fetchedWorkflows || []);
      setLogs(fetchedLogs || []);
      setUsers(fetchedUsers || []);
      setForms(fetchedForms || []);
    } catch (err: any) {
      console.error('Failed to fetch automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowsAndLogs();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleActive = async (wf: AutomationWorkflow) => {
    try {
      const updated = await api.toggleWorkflow(wf.id);
      setWorkflows(prev => prev.map(w => (w.id === wf.id ? updated : w)));
      showToast(`Workflow is now ${updated.active ? 'Active' : 'Paused'}`);
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete workflow "${name}"?`)) return;
    try {
      await api.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      showToast(`Workflow "${name}" deleted`);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleTestRun = async (wf: AutomationWorkflow) => {
    try {
      const res = await api.testWorkflow(wf.id);
      showToast(`Test completed: ${res.log.executedActionsCount} actions executed`);
      fetchWorkflowsAndLogs();
    } catch (err: any) {
      alert(`Test failed: ${err.message}`);
    }
  };

  // KPIs
  const totalExecutions = workflows.reduce((acc, w) => acc + (w.totalRuns || 0), 0);
  const activeCount = workflows.filter(w => w.active).length;
  const hoursSaved = (totalExecutions * 0.15).toFixed(1); // 9 minutes saved per automated workflow

  const filteredWorkflows = workflows.filter(
    w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'form_submitted':
        return <Layers className="w-4 h-4 text-emerald-600" />;
      case 'order_confirmed':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'order_dispatched':
        return <Globe className="w-4 h-4 text-purple-600" />;
      case 'call_logged':
        return <Phone className="w-4 h-4 text-amber-600" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'send_sms':
        return <Phone className="w-3.5 h-3.5 text-blue-500" />;
      case 'assign_sales_rep':
        return <UserCheck className="w-3.5 h-3.5 text-purple-500" />;
      case 'notify_manager':
        return <Bell className="w-3.5 h-3.5 text-red-500" />;
      case 'send_google_sheets':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />;
      case 'add_tags':
        return <Tag className="w-3.5 h-3.5 text-amber-500" />;
      case 'trigger_webhook':
        return <Globe className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Zap className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Automation Engine</h1>
              <p className="text-sm text-slate-500">
                Built-in Zapier, Make & n8n competitor: Auto-send WhatsApp, SMS, Assign Sales Reps, Notify Admins, and Sync Google Sheets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingWorkflow(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Automation Workflow</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Workflows</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{activeCount} / {workflows.length}</div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">● Instant Event Listeners</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Executions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalExecutions.toLocaleString()}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across WhatsApp, SMS, Sheets</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Engine Reliability</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">99.8%</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Zero Failed Deliveries</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rep Hours Saved</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{hoursSaved} hrs</div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Automated Dispatch & Routing</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'workflows' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Workflows ({workflows.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>Execution Logs ({logs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'recipes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Pre-Built Recipes</span>
            </button>
          </div>
        </div>

        {activeTab === 'workflows' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* TAB 1: WORKFLOWS LIST */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading automation workflows...</div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Zap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Automation Workflows Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create automated pipelines triggered by form submissions, order confirmations, or call outcomes.
              </p>
              <button
                onClick={() => {
                  setEditingWorkflow(null);
                  setIsEditorOpen(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredWorkflows.map(wf => (
                <div
                  key={wf.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md ${
                    wf.active ? 'border-slate-200' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Workflow Info & Trigger */}
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                            wf.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${wf.active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                          <span>{wf.active ? 'Active' : 'Paused'}</span>
                        </span>

                        <div className="flex items-center space-x-1 text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                          {getTriggerIcon(wf.trigger)}
                          <span>Trigger: {wf.trigger.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">{wf.name}</h3>
                      <p className="text-xs text-slate-500">{wf.description}</p>

                      {/* Action Pipeline Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Pipeline:
                        </span>
                        {wf.actions.map((act, aIdx) => (
                          <React.Fragment key={act.id}>
                            <span className="bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1.5 shadow-2xs">
                              {getActionIcon(act.type)}
                              <span>{act.name}</span>
                            </span>
                            {aIdx < wf.actions.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right: Stats & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 uppercase font-semibold block text-[10px]">Executions</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {wf.executionCount || 0} runs
                        </span>
                        {wf.lastExecutedAt && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(wf.lastExecutedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleTestRun(wf)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"
                          title="Run Test Execution"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingWorkflow(wf);
                            setIsEditorOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Workflow Pipeline"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(wf)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                            wf.active
                              ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                              : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {wf.active ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteWorkflow(wf.id, wf.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Workflow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXECUTION LOGS LEDGER */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Chronological Automation Execution Ledger</h3>
            <span className="text-xs text-slate-500">{logs.length} Total Processed Runs</span>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No automation logs recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {logs.map(log => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{log.workflowName}</span>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                              Trigger: {log.trigger}
                            </span>
                            <span>•</span>
                            <span>{new Date(log.executedAt).toLocaleString()}</span>
                            {log.orderNumber && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold">Order: #{log.orderNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ {log.executedActionsCount} Actions Completed
                        </span>
                        <span className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* EXPANDED ACTION STEPS DETAILS */}
                    {isExpanded && (
                      <div className="mt-3.5 pl-6 space-y-2 border-l-2 border-emerald-500">
                        {log.actionDetails?.map((step: any, sIdx: number) => (
                          <div key={sIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                Step {sIdx + 1}: {step.actionName} ({step.actionType})
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold uppercase">Success</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-100 break-all">
                              {step.output}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRE-BUILT RECIPES LIBRARY */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Omnichannel Instant Greeting</h3>
            </div>
            <p className="text-xs text-slate-600">
              Fires on Form Submission: Sends WhatsApp with dynamic order summary, round-robin routes order to available sales rep, and tags customer.
            </p>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">WhatsApp</span>
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded">Round-Robin</span>
              <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded">Tag: Form-Inbound</span>
            </div>
            <button
              onClick={() => {
                setEditingWorkflow({
                  id: '',
                  name: 'Omnichannel Instant Greeting Recipe',
                  description: 'Triggered when customer submits form: Sends instant WhatsApp, assigns rep, and tags customer.',
                  trigger: 'form_submitted',
                  active: true,
                  actions: [
                    {
                      id: 'a1',
                      type: 'send_whatsapp',
                      name: 'Instant WhatsApp Customer Greeting',
                      config: { template: 'Hello {customer_name}! We received your order for {product_name}. Our rep {rep_name} will call you soon.' },
                    },
                    { id: 'a2', type: 'assign_sales_rep', name: 'Round-Robin Assignment', config: { strategy: 'round_robin' } },
                    { id: 'a3', type: 'add_tags', name: 'Tag Order', config: { tags: ['Form-Inbound'] } },
                  ],
                } as any);
                setIsEditorOpen(true);
              }}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Install Recipe
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-blue-700">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Courier Dispatch Notification</h3>
            </div>
            <p className="text-xs text-slate-600">
              Fires on Order Dispatched: Sends SMS with courier waybill tracking details to customer and pushes payload to external Google Sheets.
            </p>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded">SMS Waybill</span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">Google Sheets Sync</span>
            </div>
            <button
              onClick={() => {
                setEditingWorkflow({
                  id: '',
                  name: 'Courier Dispatch SMS & Sheets Sync',
                  description: 'Sends waybill tracking SMS to customer and logs dispatched parcel to Google Sheets.',
                  trigger: 'order_dispatched',
                  active: true,
                  actions: [
                    {
                      id: 'a1',
                      type: 'send_sms',
                      name: 'SMS Waybill Notice',
                      config: { senderId: 'STEKENT', template: 'Hello {customer_name}, your order #{order_number} has been dispatched! Delivery in 24-48hrs.' },
                    },
                    {
                      id: 'a2',
                      type: 'send_google_sheets',
                      name: 'Log Dispatched Order',
                      config: { sheetName: 'Dispatched Orders' },
                    },
                  ],
                } as any);
                setIsEditorOpen(true);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Install Recipe
            </button>
          </div>
        </div>
      )}

      {/* WORKFLOW EDITOR FULLSCREEN MODAL */}
      {isEditorOpen && (
        <WorkflowEditorModal
          initialWorkflow={editingWorkflow}
          users={users}
          forms={forms}
          onClose={() => setIsEditorOpen(false)}
          onSaved={saved => {
            setWorkflows(prev => {
              const idx = prev.findIndex(w => w.id === saved.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = saved;
                return copy;
              }
              return [saved, ...prev];
            });
            showToast(`Workflow "${saved.name}" saved successfully`);
          }}
        />
      )}
    </div>
  );
};
