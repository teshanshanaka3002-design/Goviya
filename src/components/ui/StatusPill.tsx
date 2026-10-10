import React from 'react';
import { View, Text } from 'react-native';
import { OrderStatus } from '../../types';
import { useLanguage } from '../../i18n';

export interface StatusPillProps {
  status:
    | OrderStatus
    | 'pending'
    | 'open'
    | 'confirmed'
    | 'accepted'
    | 'in_progress'
    | 'out_for_delivery'
    | 'delivered'
    | 'completed'
    | 'rejected'
    | 'cancelled'
    | 'active'
    | 'out_of_stock'
    | 'removed'
    | 'resolved'
    | 'closed'
    | 'dismissed';
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, className = '' }) => {
  const { t } = useLanguage();
  const norm = status.toLowerCase();

  let bgColor = '#FEF8EA';
  let textColor = '#B45309';
  let borderColor = '#FCE7C2';
  let dotColor = '#E8A317';
  let displayLabel = label;

  if (norm === 'pending' || norm === 'open') {
    bgColor = '#FEF8EA';
    textColor = '#B45309';
    borderColor = '#FCE7C2';
    dotColor = '#E8A317';
    displayLabel = label || (norm === 'open' ? t('buyer.support.statusOpen', 'Open') : t('order.status.pending', 'Pending'));
  } else if (
    norm === 'confirmed' ||
    norm === 'accepted' ||
    norm === 'in_progress' ||
    norm === 'preparing' ||
    norm === 'ready_for_pickup' ||
    norm === 'out_for_delivery'
  ) {
    bgColor = '#EEF8FA';
    textColor = '#19768A';
    borderColor = '#C7EBF2';
    dotColor = '#5BB5C9';
    displayLabel =
      label ||
      (norm === 'out_for_delivery'
        ? t('order.status.out_for_delivery', 'Out for Delivery')
        : norm === 'ready_for_pickup'
        ? t('order.status.ready_for_pickup', 'Ready for Pickup')
        : norm === 'preparing'
        ? t('order.status.preparing', 'Preparing')
        : norm === 'accepted'
        ? t('order.status.accepted', 'Accepted')
        : norm === 'in_progress'
        ? t('buyer.support.statusInProgress', 'In Progress')
        : t('order.status.accepted', 'Confirmed'));
  } else if (norm === 'delivered' || norm === 'completed' || norm === 'active' || norm === 'resolved') {
    bgColor = '#E6F2E8';
    textColor = '#1F5C3A';
    borderColor = '#C9E6D0';
    dotColor = '#1F5C3A';
    displayLabel = label || (norm === 'active' ? t('buyer.orders.tabActive', 'Active') : norm === 'resolved' ? t('buyer.support.statusResolved', 'Resolved') : t('order.status.delivered', 'Delivered'));
  } else if (norm === 'rejected' || norm === 'cancelled' || norm === 'out_of_stock' || norm === 'dismissed' || norm === 'closed') {
    bgColor = norm === 'closed' ? '#F3F4F6' : '#FDEEEB';
    textColor = norm === 'closed' ? '#4B5563' : '#C8452D';
    borderColor = norm === 'closed' ? '#E5E7EB' : '#F8C8BF';
    dotColor = norm === 'closed' ? '#6B7280' : '#C8452D';
    displayLabel = label || (norm === 'closed' ? t('buyer.support.statusClosed', 'Closed') : norm === 'out_of_stock' ? 'Out of Stock' : norm === 'cancelled' ? t('order.status.cancelled', 'Cancelled') : norm === 'dismissed' ? 'Dismissed' : t('order.status.rejected', 'Rejected'));
  }

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
      className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border self-start ${className}`}
    >
      <View
        style={{ backgroundColor: dotColor }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
      />
      <Text style={{ color: textColor }} className="text-xs font-semibold" numberOfLines={1}>
        {displayLabel}
      </Text>
    </View>
  );
};
