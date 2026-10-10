import React from 'react';
import { View, Text } from 'react-native';
import { OrderStatus } from '../../types';

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
    displayLabel = label || (norm === 'open' ? 'Open' : 'Pending');
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
        ? 'Out for Delivery'
        : norm === 'ready_for_pickup'
        ? 'Ready for Pickup'
        : norm === 'preparing'
        ? 'Preparing'
        : norm === 'accepted'
        ? 'Accepted'
        : norm === 'in_progress'
        ? 'In Progress'
        : 'Confirmed');
  } else if (norm === 'delivered' || norm === 'completed' || norm === 'active' || norm === 'resolved') {
    bgColor = '#E6F2E8';
    textColor = '#1F5C3A';
    borderColor = '#C9E6D0';
    dotColor = '#1F5C3A';
    displayLabel = label || (norm === 'active' ? 'Active' : norm === 'resolved' ? 'Resolved' : 'Delivered');
  } else if (norm === 'rejected' || norm === 'cancelled' || norm === 'out_of_stock' || norm === 'dismissed' || norm === 'closed') {
    bgColor = norm === 'closed' ? '#F3F4F6' : '#FDEEEB';
    textColor = norm === 'closed' ? '#4B5563' : '#C8452D';
    borderColor = norm === 'closed' ? '#E5E7EB' : '#F8C8BF';
    dotColor = norm === 'closed' ? '#6B7280' : '#C8452D';
    displayLabel = label || (norm === 'closed' ? 'Closed' : norm === 'out_of_stock' ? 'Out of Stock' : norm === 'cancelled' ? 'Cancelled' : norm === 'dismissed' ? 'Dismissed' : 'Rejected');
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
