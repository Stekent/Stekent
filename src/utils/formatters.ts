export function formatCurrency(amount: number | string, currency: string = 'NGN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₦0.00';

  const symbol = currency === 'NGN' ? '₦' : '$';
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getRepInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'SR';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SR';
  return parts
    .map(n => (n && n.length > 0 ? n[0] : ''))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SR';
}
