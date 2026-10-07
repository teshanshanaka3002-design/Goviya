import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  count?: number;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  count,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 whitespace-nowrap shrink-0 ${
        selected
          ? 'bg-[#1F5C3A] text-white shadow-xs'
          : 'bg-[#F0F2EE] text-[#4B5563] hover:bg-[#E5E8E2] hover:text-[#1A1A1A]'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
            selected ? 'bg-white/25 text-white' : 'bg-black/8 text-[#4B5563]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
