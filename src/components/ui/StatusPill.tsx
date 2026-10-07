import React from 'react';
import { OrderStatus } from '../../types';

export interface StatusPillProps {
  status:
    | OrderStatus
    | 'pending'
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
    | 'resolved'
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

  if (norm === 'pending') {
    bgColor = '#FEF8EA';
    textColor = '#B45309';
    borderColor = '#FCE7C2';
    dotColor = '#E8A317';
    displayLabel = label || 'Pending';
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
        : 'Confirmed');
  } else if (norm === 'delivered' || norm === 'completed' || norm === 'active' || norm === 'resolved') {
    bgColor = '#E6F2E8';
    textColor = '#1F5C3A';
    borderColor = '#C9E6D0';
    dotColor = '#1F5C3A';
    displayLabel = label || (norm === 'active' ? 'Active' : norm === 'resolved' ? 'Resolved' : 'Delivered');
  } else if (norm === 'rejected' || norm === 'cancelled' || norm === 'out_of_stock' || norm === 'dismissed') {
    bgColor = '#FDEEEB';
    textColor = '#C8452D';
    borderColor = '#F8C8BF';
    dotColor = '#C8452D';
    displayLabel = label || (norm === 'out_of_stock' ? 'Out of Stock' : norm === 'cancelled' ? 'Cancelled' : norm === 'dismissed' ? 'Dismissed' : 'Rejected');
  }

  return (
    <span
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: borderColor,
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-tight ${className}`}
    >
      <span
        style={{ backgroundColor: dotColor }}
        className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
      />
      <span className="whitespace-nowrap">{displayLabel}</span>
    </span>
  );
};
