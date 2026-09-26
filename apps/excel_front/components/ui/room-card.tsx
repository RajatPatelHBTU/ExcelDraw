"use client";

import { useEffect, useRef } from "react";
import { useOnClickOutside } from "@/app/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface RoomCardProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function RoomCard({ isOpen, onClose, children, className }: RoomCardProps) {
  const cardRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useOnClickOutside(cardRef, onClose);

  // Auto-focus the input ONLY once when the modal is opened
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!cardRef.current) return;
      const input = cardRef.current.querySelector<HTMLElement>("input, textarea");
      if (input) {
        input.focus();
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle keyboard events (Escape to close, Tab to trap focus)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        if (!cardRef.current) return;

        const focusableElements = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={cardRef}
        className={cn(
          "w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl relative",
          "transform transition-all duration-200 ease-out",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 z-20"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}