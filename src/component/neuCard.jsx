import React from "react";

import NeumorphicCard from "./neuCard";

import { motion } from "framer-motion";

export default function DashboardStats() {
  const stats = [
    { title: "Teachers", count: 15 },
    { title: "Students", count: 280 },
    { title: "Classes", count: 12 },
    { title: "Subjects", count: 35 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <NeumorphicCard key={idx} className="text-center">
          {/* Typing effect title */}
          <motion.h2
            className="text-lg font-semibold gradient-text whitespace-nowrap overflow-hidden border-r-2 border-pink-400"
            initial={{ width: "0ch" }}
            animate={{ width: `${stat.title.length}ch` }}
            transition={{
              duration: 1.2,
              ease: "steps(10, end)",
              delay: idx * 0.3,
            }}
          >
            {stat.title}
          </motion.h2>

          {/* Count */}
          <motion.p
            className="text-4xl font-bold gradient-text mt-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + idx * 0.3 }}
          >
            {stat.count}
          </motion.p>
        </NeumorphicCard>
      ))}
    </div>
  );
}
