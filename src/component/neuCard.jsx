import React from "react";
import { motion } from "framer-motion";

export default function NeumorphicCard({
  children,
  className = "",
  as: Component = "div",
  padding = "p-8",
  rounded = "rounded-3xl",
}) {
  const cardShadow = `
  inset 6px 6px 14px rgba(0,0,0,0.16),
  inset -6px -6px 14px rgba(255,255,255,0.85),
  10px 12px 30px rgba(0,0,0,0.12),
  -8px -8px 24px rgba(255,255,255,0.7)
`;
  return (
    <motion.div
      className="relative inline-block w-full max-w-3xl rounded-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{
        rotateX: 1,
        rotateY: -1,
        transition: { duration: 0.3, ease: "easeInOut" },
      }}
    >
      {/* Gradient ring around card */}
      <div
        className="absolute -inset-[3px] rounded-[inherit] borderAnimation"
        style={{
          background:
            "linear-gradient(90deg, #4facfe, #00f2fe, #43e97b, #f093fb, #4facfe)",
          backgroundSize: "300% 300%",
          borderRadius: "inherit",
          zIndex: 0,
        }}
      ></div>

      {/* Card body */}
      <Component
        style={{ boxShadow: cardShadow }}
        className={`relative bg-[#e0e0e0] ${rounded} ${padding} 
          shadow-[6px_6px_14px_#bebebe,-6px_-6px_14px_#ffffff]
          hover:shadow-[8px_8px_18px_#b1b1b1,-8px_-8px_18px_#ffffff]
          transition-all bg-base-200 duration-300 ease-in-out
          ${className}`}
        // style={{ zIndex: 1 }}
      >
        {children}
      </Component>

      {/* Border animation keyframes */}
      <style>{`
        @keyframes borderMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .borderAnimation {
          animation: borderMove 6s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
