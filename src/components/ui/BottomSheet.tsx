import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeight = 'max-h-[88%]',
}) => {
  const [mountTarget, setMountTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const chassis = document.querySelector('.iphone-chassis') || document.body;
      setMountTarget(chassis);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="absolute inset-0 z-[100] flex items-end justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full max-w-full bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col ${maxHeight} animate-slideUp`}
      >
        {/* Grab Handle */}
        <div className="pt-2.5 pb-1 cursor-grab flex justify-center shrink-0">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E5E5] shrink-0">
            <h3 className="text-sm font-bold text-[#1A1A1A] truncate pr-2">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6B7280] hover:text-[#1A1A1A] rounded-full hover:bg-[#F3F4F6] transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Content Viewport */}
        <div className="overflow-y-auto px-4 py-3 flex-1 no-scrollbar text-left">
          {children}
        </div>

        {/* Sticky Action Footer (Never covered by bottom navigation or home bar) */}
        {footer && (
          <div className="p-3.5 pb-6 sm:pb-3 bg-white border-t border-[#E5E5E5] shrink-0 z-20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return mountTarget ? createPortal(content, mountTarget) : content;
};
