import React from 'react';

interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'brand' | 'gold' | 'red';
  isMoney?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  isMoney = false,
}) => {
  const getIconBg = () => {
    switch (variant) {
      case 'emerald':
      case 'brand':
        return 'bg-[#E3F0E9] text-[#146B4E] border border-[#C5DFD0]';
      case 'amber':
      case 'gold':
        return 'bg-[#F6ECD8] text-[#B9822A] border border-[#EADBBD]';
      case 'blue':
        return 'bg-[#E8EEF7] text-[#2F5FA8] border border-[#C9DAF2]';
      case 'purple':
        return 'bg-[#E8EEF7] text-[#2F5FA8] border border-[#C9DAF2]';
      case 'rose':
      case 'red':
        return 'bg-[#F8E7E5] text-[#B33A3A] border border-[#ECCAC7]';
      default:
        return 'bg-[#EEF0E8] text-[#5B675E] border border-[#E2E5DD]';
    }
  };

  return (
    <div
      id={id}
      className="relative bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] p-4 flex flex-col justify-between overflow-hidden transition-colors hover:border-[#146B4E]/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B675E] block font-heading">
            {title}
          </span>
          <div
            className={`mt-1.5 text-2xl font-bold tracking-tight text-[#12231C] ${
              isMoney || typeof value === 'number' ? 'font-mono' : 'font-heading'
            }`}
          >
            {value}
          </div>
        </div>
        {icon && (
          <div className={`p-2 rounded-[6px] shrink-0 ${getIconBg()}`}>
            {icon}
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-2 border-t border-[#EEF0E8] text-xs text-[#5B675E]">
          {subtitle}
        </div>
      )}
    </div>
  );
};

