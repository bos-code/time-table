import React from "react";
import { motion } from "framer-motion";

export default function NeumorphicCard({
  children,
  className = "",
  as: Component = "div",
  padding = "p-8",
  rounded = "rounded-[2rem]",
}) {
  return (
    <motion.div
      className="relative inline-block w-full"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Component
        className={`relative bg-base-100 ${rounded} ${padding} 
          shadow-neo
          transition-all duration-300 ease-out
          ${className}`}
      >
        {children}
      </Component>
    </motion.div>
  );
}
