import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ProgressTracker({
  totalTeachers = 0,
  currentIndex = 0,
  screen = "teacher-input",
  typingSpeed = 40,
  fontSize = "text-xl sm:text-2xl",
}) {
  const [displayText, setDisplayText] = useState("");
  const [fullText, setFullText] = useState("");
  const typingRef = useRef();
  const pauseRef = useRef();

  const text = 
    screen === "teacher-input" ? "Step 1 - Add Teachers" :
    screen === "validation" ? "Step 2 - Validate School Week" :
    screen === "subject-class-input" ? `Step 3 - Teacher ${Math.min(currentIndex + 1, Math.max(totalTeachers, 1))} of ${Math.max(totalTeachers, 1)}` :
    screen === "summary" ? "Step 4 - Review and Generate" :
    screen === "timetable-generated" ? "Step 5 - Generated Timetable" :
    screen.replace(/-/g, " ");

  useEffect(() => {
    setFullText(text);
    setDisplayText("");

    if (!text) return;

    let index = 0;
    const chars = Array.from(text);
    let intervalId;
    
    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index < chars.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, typingSpeed);
    }, Math.min(150, typingSpeed / 2));

    return () => {
      clearTimeout(startTimeout);
      clearInterval(intervalId);
    };
  }, [text, typingSpeed]);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className="w-full"
    >
      <div className="rounded-[1.5rem] px-6 py-5 bg-base-100 shadow-neo">
        <div className="flex items-start justify-between gap-4">
          <div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={fullText}
                aria-live="polite"
                className={`${fontSize} font-bold font-heading tracking-tight leading-tight`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                style={gradientTextStyle}
              >
                <span>{displayText}</span>
                <span
                  aria-hidden="true"
                  style={{ display: "inline-block", width: 4, marginLeft: 8 }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 4,
                      height: 24,
                      background: "var(--color-primary)",
                      borderRadius: 2,
                      verticalAlign: "middle",
                      animation: "blink 1s steps(2, start) infinite",
                    }}
                  />
                </span>
              </motion.h2>
            </AnimatePresence>

            <motion.p
              className="mt-2 text-sm ui-copy-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-base-100 shadow-neo shrink-0"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div className="text-sm">
              <div className="font-semibold text-base-content whitespace-nowrap">
                {Math.min(currentIndex + 1, Math.max(totalTeachers, 1))} /{" "}
                {Math.max(totalTeachers, 1)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 w-full h-1.5 bg-base-200 rounded-full overflow-hidden inset-neo-soft">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
