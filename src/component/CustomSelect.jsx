import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({ value, onChange, options, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ui-input flex items-center justify-between text-left cursor-pointer w-full bg-base-100 min-h-[46px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-4">{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 text-primary shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[9999] w-full mt-2 bg-base-100 border border-[color-mix(in_srgb,var(--color-base-content)_10%,transparent)] rounded-xl py-1 shadow-neo-hover origin-top max-h-60 overflow-y-auto overflow-x-hidden"
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-base-200 text-base-content"
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
