import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [theme, setTheme] = useState("dark-glass");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark-glass" ? "light-glass" : "dark-glass"));
  };

  // Shadow styles for neumorphic effect
  const shadow =
    theme === "dark-glass"
      ? "shadow-[8px_8px_15px_rgba(0,0,0,0.4),-8px_-8px_15px_rgba(255,255,255,0.05)]"
      : "shadow-[8px_8px_15px_rgba(0,0,0,0.1),-8px_-8px_15px_rgba(255,255,255,0.7)]";

  return (
    <div
      className={`w-full flex items-center justify-between p-4 glass-card rounded-2xl ${shadow}`}
    >
      <div className="text-xl font-bold text-primary">School Dashboard</div>

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        className={`p-3 rounded-xl glass-card hover:scale-105 transition-transform ${shadow} bg-primary`}
      >
        <AnimatePresence mode="wait">
          {theme === "dark-glass" ? (
            <motion.svg
              key="moon"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6 text-yellow-400"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m15.364-6.364l1.414-1.414M4.222 19.778l1.414-1.414m0-12.728L4.222 4.222M19.778 19.778l-1.414-1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
