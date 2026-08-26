import React from 'react';
import { OrderStatus } from '../types';

interface StatusPillProps {
  id?: string;
  status: OrderStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  id,
  status,
  size = 'md',
  className = '',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'New':
        return 'bg-[#EEF0E8] text-[#5B675E] border-[#D5D8CF]';
      case 'Confirmed':
        return 'bg-[#E8EEF7] text-[#2F5FA8] border-[#C9DAF2]';
      case 'Dispatched':
        return 'bg-[#F6ECD8] text-[#B9822A] border-[#EADBBD]';
      case 'Delivered':
        return 'bg-[#E3F0E9] text-[#146B4E] border-[#C5DFD0]';
      case 'Cancelled':
        return 'bg-[#F8E7E5] text-[#B33A3A] border-[#ECCAC7]';
      default:
        return 'bg-[#EEF0E8] text-[#5B675E] border-[#D5D8CF]';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'New':
        return 'bg-[#5B675E]';
      case 'Confirmed':
        return 'bg-[#2F5FA8]';
      case 'Dispatched':
        return 'bg-[#B9822A]';
      case 'Delivered':
        return 'bg-[#146B4E]';
      case 'Cancelled':
        return 'bg-[#B33A3A]';
      default:
        return 'bg-[#5B675E]';
    }
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap ${getStyles()} ${sizeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor()}`} />
      <span>{status}</span>
    </span>
  );
};

