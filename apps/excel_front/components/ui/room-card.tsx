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
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useOnClickOutside(cardRef, onClose);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!firstFocusableRef.current || !lastFocusableRef.current) return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusableRef.current) {
            lastFocusableRef.current.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableRef.current) {
            firstFocusableRef.current.focus();
            e.preventDefault();
          }
        }
      }
    };

    const setFocusableElements = () => {
      if (!cardRef.current) return;

      const focusableElements = cardRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length) {
        firstFocusableRef.current = focusableElements[0] as HTMLElement;
        lastFocusableRef.current = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;
        firstFocusableRef.current.focus();
      }
    };

    setFocusableElements();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={cardRef}
        className={cn(
          "w-80 bg-[#1E1E1E] border-2 border-[#333333] rounded-xl shadow-xl",
          "transform transition-all duration-200 ease-out",
          "modal-enter-active",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}