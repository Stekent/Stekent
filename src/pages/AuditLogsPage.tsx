import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, RefreshCw, Clock, User, FileText, Database } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

interface AuditLogsPageProps {
  onToast: (msg: string) => void;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ onToast }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const fetched = await api.getAuditLogs();
      setLogs(fetched);
    } catch (err) {
      console.error(err);
      onToast('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.performedByName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.entityType === filterType;
    return matchesSearch && matchesType;
  });

  const getEntityBadge = (type: AuditLog['entityType']) => {
    switch (type) {
      case 'order':
        return 'bg-[#E3F0E9] text-[#146B4E] border-[#146B4E]';
      case 'product':
        return 'bg-[#F6ECD8] text-[#B9822A] border-[#B9822A]';
      case 'payroll':
        return 'bg-[#E8EEF7] text-[#2F5FA8] border-[#2F5FA8]';
      case 'courier':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'auth':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top filter bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E5DD] shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5B675E]" />
            <input
              type="text"
              placeholder="Search audit actions, details, or staff..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-[#FAFBF9] focus:outline-none focus:border-[#146B4E]"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-[6px] border border-[#E2E5DD] bg-[#FAFBF9] text-[#12231C]"
          >
            <option value="all">All Modules</option>
            <option value="order">Orders</option>
            <option value="product">Products & Stock</option>
            <option value="payroll">Payroll</option>
            <option value="courier">Logistics & Couriers</option>
            <option value="auth">Auth & Staff</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-2 rounded-[6px] border border-[#E2E5DD] bg-white hover:bg-[#EEF0E8] text-xs font-semibold text-[#12231C] flex items-center justify-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E5DD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E5DD] flex justify-between items-center bg-[#FAFBF9]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#146B4E]" />
            <h3 className="font-heading font-bold text-sm text-[#12231C]">
              Enterprise Activity & Mutation Trail
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#5B675E]">
            {filteredLogs.length} Records Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAFBF9] border-b border-[#E2E5DD] text-[10px] text-[#5B675E] uppercase tracking-wider font-heading">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-4">Details & Mutation State</th>
                <th className="py-3 px-4 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0E8]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#5B675E]">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getEntityBadge(
                        log.entityType
                      )}`}
                    >
                      {log.entityType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#12231C] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-[#5B675E] max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="font-semibold text-[#12231C]">{log.performedByName}</div>
                    <div className="text-[10px] font-mono text-[#5B675E]">ID: {log.performedById}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
