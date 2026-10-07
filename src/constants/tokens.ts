// Goviya Design Tokens
export const colors = {
  primary: '#1F5C3A',      // dark forest green — primary buttons, active states, headings
  primaryHover: '#16452B',
  primaryLight: '#E6F2E8', // mint — search bars, secondary buttons, chips, selected backgrounds
  background: '#F6F7F5',   // off-white app background
  surface: '#FFFFFF',      // card background
  border: '#E5E5E5',       // subtle 1px card borders
  borderLight: '#F0F0EE',
  danger: '#C8452D',       // coral red — destructive actions, errors, rejected status
  dangerLight: '#FDEEEB',
  warning: '#E8A317',      // amber — pending status, low-stock warnings
  warningLight: '#FEF8EA',
  accent: '#5BB5C9',       // soft teal — secondary accents, confirmed/in-progress status
  accentLight: '#EEF8FA',
  success: '#1F5C3A',      // reuse primary green for delivered/completed status
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: '#FEF8EA', text: '#E8A317', border: '#FCE7C2' },
  accepted: { bg: '#EEF8FA', text: '#2E8C9F', border: '#C7EBF2' },
  confirmed: { bg: '#EEF8FA', text: '#2E8C9F', border: '#C7EBF2' },
  preparing: { bg: '#EEF8FA', text: '#2E8C9F', border: '#C7EBF2' },
  ready_for_pickup: { bg: '#EEF8FA', text: '#2E8C9F', border: '#C7EBF2' },
  out_for_delivery: { bg: '#EEF8FA', text: '#2E8C9F', border: '#C7EBF2' },
  in_progress: { bg: '#EEF8FA', text: '#2E8C9F', border: '#C7EBF2' },
  delivered: { bg: '#E6F2E8', text: '#1F5C3A', border: '#C9E6D0' },
  completed: { bg: '#E6F2E8', text: '#1F5C3A', border: '#C9E6D0' },
  rejected: { bg: '#FDEEEB', text: '#C8452D', border: '#F8C8BF' },
  cancelled: { bg: '#FDEEEB', text: '#C8452D', border: '#F8C8BF' },
};
