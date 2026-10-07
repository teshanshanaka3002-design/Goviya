import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-[#D1D5DB] my-4 ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[#E6F2E8] text-[#1F5C3A] flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-base font-bold text-[#1A1A1A] mb-1">{title}</h4>
      <p className="text-xs text-[#6B7280] max-w-xs mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-3 w-full animate-pulse p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-[#E5E7EB] h-16 rounded-2xl w-full" />
      ))}
    </div>
  );
};
