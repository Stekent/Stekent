import React from 'react';
import { X, RotateCw, Sparkles, ShieldAlert } from 'lucide-react';
import { RoundRobinState } from '../types';
import { getRepInitials } from '../utils/formatters';

interface RoundRobinModalProps {
  state: RoundRobinState | null;
  onClose: () => void;
}

export const RoundRobinModal: React.FC<RoundRobinModalProps> = ({
  state,
  onClose,
}) => {
  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12231C]/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] w-full max-w-xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#EEF0E8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[6px] bg-[#E3F0E9] text-[#146B4E]">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#12231C] font-heading">
                Round-Robin Dispatch Queue
              </h3>
              <p className="text-xs text-[#5B675E]">
                Autonomous sales rep assignment engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5B675E] hover:text-[#12231C] rounded-[6px] hover:bg-[#EEF0E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Key State Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[6px] bg-[#EEF0E8]/50 border border-[#E2E5DD]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B675E] font-heading block">
                Last Assigned Rep
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#EEF0E8] text-[#12231C] flex items-center justify-center text-xs font-bold font-mono border border-[#E2E5DD]">
                  {state.lastAssignedRep ? getRepInitials(state.lastAssignedRep.name) : '-'}
                </div>
                <span className="text-xs font-semibold text-[#12231C] truncate">
                  {state.lastAssignedRep?.name || 'None (Initial)'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[#E3F0E9] border border-[#C5DFD0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#146B4E] font-heading block flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Next Up In Queue
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#146B4E] text-white flex items-center justify-center text-xs font-bold font-mono">
                  {state.nextRep ? getRepInitials(state.nextRep.name) : '-'}
                </div>
                <span className="text-xs font-bold text-[#146B4E] truncate">
                  {state.nextRep?.name || 'All Busy'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Reps Queue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B675E] font-heading">
                Active Staff in Queue ({state.activeReps.length})
              </span>
              <span className="text-[10px] text-[#5B675E] font-mono">
                Sorted by ID
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {state.activeReps.map((rep, idx) => {
                const isLast = rep.id === state.lastAssignedRepId;
                const isNext = rep.id === state.nextRep?.id;

                return (
                  <div
                    key={rep.id}
                    className={`p-2.5 rounded-[6px] border flex items-center justify-between transition-all ${
                      isNext
                        ? 'bg-[#E3F0E9]/70 border-[#146B4E] text-[#146B4E]'
                        : isLast
                        ? 'bg-[#FAFBF9] border-[#E2E5DD] text-[#12231C]'
                        : 'bg-[#FFFFFF] border-[#E2E5DD] text-[#5B675E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-[#5B675E] w-4">
                        #{idx + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#EEF0E8] text-[#12231C] flex items-center justify-center text-xs font-bold font-mono border border-[#E2E5DD]">
                        {getRepInitials(rep.name)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#12231C]">
                          {rep.name}
                        </div>
                        <div className="text-[10px] text-[#5B675E] font-mono">
                          {rep.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isNext && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#146B4E] text-white font-semibold font-mono">
                          NEXT IN LINE
                        </span>
                      )}
                      {isLast && !isNext && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#EEF0E8] text-[#5B675E] border border-[#E2E5DD] font-mono">
                          Last assigned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logic Guarantee Notice */}
          <div className="p-3 rounded-[6px] bg-[#FAFBF9] border border-[#E2E5DD] text-xs space-y-1 text-[#5B675E]">
            <div className="flex items-center gap-1.5 text-[#12231C] font-semibold font-heading text-[11px] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B9822A]" />
              Queue Invariant Guarantee
            </div>
            <p className="text-[11px] leading-relaxed">
              When an order is created, the system assigns the sales rep after <code className="font-mono text-[#146B4E]">last_assigned_rep_id</code>.
              Manual reassignment in the ledger strictly will <strong>NOT</strong> modify this dispatch position.
            </p>
          </div>
        </div>

        <div className="p-3 border-t border-[#EEF0E8] bg-[#FAFBF9] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
