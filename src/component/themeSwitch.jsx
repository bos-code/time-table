import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoon,
  FaSun,
  FaCalendarAlt,
  FaBars,
  FaChartBar,
} from "react-icons/fa";

export default function Navbar({ toggleLeft, toggleRight, isLeftOpen, isRightOpen }) {
  const [theme, setTheme] = useState("dark-glass");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <nav className="flex items-center justify-between bg-base-100 border-b border-[color-mix(in_srgb,var(--color-base-content)_8%,transparent)] px-4 py-3 z-50 w-full">
      <div className="flex items-center gap-4">
        {toggleLeft && (
          <button 
            onClick={toggleLeft} 
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-base-200 text-base-content transition-colors outline-none"
            aria-label="Toggle Navigation Sidebar"
          >
            <FaBars className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3 ml-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-neo shrink-0">
            <FaCalendarAlt className="text-xl" />
          </div>
          <span className="text-xl font-heading font-black tracking-tight hidden sm:block">
            TimeTink
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "light-glass" ? "dark-glass" : "light-glass")}
          className="relative inline-flex h-[36px] items-center gap-2 overflow-hidden rounded-full bg-base-200 p-1 px-3 inset-neo-soft cursor-pointer outline-none select-none transition-colors"
          type="button"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {theme === "dark-glass" ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaMoon className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaSun className="w-4 h-4 text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {toggleRight && (
          <button 
            onClick={toggleRight} 
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors outline-none ml-2 ${isRightOpen ? "bg-primary/10 text-primary shadow-neo-hover" : "hover:bg-base-200 text-base-content"}`}
            aria-label="Toggle Analytics Sidebar"
          >
            <FaChartBar className="w-5 h-5" />
          </button>
        )}
      </div>
    </nav>
  );
}
