import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProgressTracker({
  totalTeachers = 0,
  currentIndex = 0,
  screen = "teacher-input",
  fontSize = "text-xl sm:text-2xl",
}) {
  const text =
    screen === "teacher-input" ? "Step 1 - Add Teachers" :
    screen === "validation" ? "Step 2 - Validate School Week" :
    screen === "subject-class-input" ? `Step 3 - Teacher ${Math.min(currentIndex + 1, Math.max(totalTeachers, 1))} of ${Math.max(totalTeachers, 1)}` :
    screen === "summary" ? "Step 4 - Review and Generate" :
    screen === "timetable-generated" ? "Step 5 - Generated Timetable" :
    screen.replace(/-/g, " ");

  const subtitle =
    screen === "teacher-input"
      ? "Enter teacher names, then confirm to configure the school week."
      : screen === "validation"
      ? "Choose the active school days, periods, classes, and subjects."
      : screen === "subject-class-input"
      ? "Add subject-class workloads for the current teacher."
      : screen === "timetable-generated"
      ? "Review the timetable produced by the OR-Tools solver."
      : "Review the structure before generating the timetable.";

  const percentComplete =
    screen === "teacher-input" ? 20 :
    screen === "validation" ? 40 :
    screen === "subject-class-input" ? 60 :
    screen === "summary" ? 80 :
    screen === "timetable-generated" ? 100 : 0;

  return (
    <div className="w-full">
      <div className="rounded-[1.5rem] px-6 py-5 bg-base-100 shadow-neo">
        <div className="flex items-start justify-between gap-4">
          <div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={text}
                aria-live="polite"
                className={`${fontSize} font-bold font-heading tracking-tight leading-tight text-base-content`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {text}
              </motion.h2>
            </AnimatePresence>

            <p className="mt-2 text-sm ui-copy-muted">{subtitle}</p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-base-100 shadow-neo shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div className="text-sm">
              <div className="font-semibold text-base-content whitespace-nowrap">
                {Math.min(currentIndex + 1, Math.max(totalTeachers, 1))} /{" "}
                {Math.max(totalTeachers, 1)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full h-1.5 bg-base-200 rounded-full overflow-hidden inset-neo-soft">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
