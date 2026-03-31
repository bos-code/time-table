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

  useEffect(() => {
    let text = "";
    if (screen === "teacher-input") {
      text = "Step 1 - Add Teachers";
    } else if (screen === "validation") {
      text = "Step 2 - Validate School Week";
    } else if (screen === "subject-class-input") {
      text = `Step 3 - Teacher ${Math.min(
        currentIndex + 1,
        totalTeachers
      )} of ${Math.max(totalTeachers, 1)}`;
    } else if (screen === "summary") {
      text = "Step 4 - Review and Generate";
    } else if (screen === "timetable-generated") {
      text = "Step 5 - Generated Timetable";
    } else {
      text = screen.replace(/-/g, " ");
    }

    clearInterval(typingRef.current);
    clearTimeout(pauseRef.current);

    setFullText(text);
    setDisplayText("");

    if (!text) {
      return undefined;
    }

    const chars = Array.from(text);
    let index = 0;
    const startTimeout = setTimeout(() => {
      typingRef.current = setInterval(() => {
        setDisplayText((previous) => previous + chars[index]);
        index += 1;
        if (index >= chars.length) {
          clearInterval(typingRef.current);
          pauseRef.current = setTimeout(() => {}, 600);
        }
      }, typingSpeed);
    }, Math.min(150, typingSpeed / 2));

    return () => {
      clearTimeout(startTimeout);
      clearInterval(typingRef.current);
      clearTimeout(pauseRef.current);
    };
  }, [screen, currentIndex, totalTeachers, typingSpeed]);

  const cardShadow = `
    inset 6px 6px 14px rgba(0,0,0,0.16),
    inset -6px -6px 14px rgba(255,255,255,0.85),
    10px 12px 30px rgba(0,0,0,0.12),
    -8px -8px 24px rgba(255,255,255,0.7)
  `;

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #ff4c60 0%, #ff8aa1 35%, #a18cd1 100%)",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className="w-full max-w-3xl"
    >
      <div style={{ boxShadow: cardShadow }} className="rounded-2xl px-6 py-5 bg-base-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={fullText}
                aria-live="polite"
                className={`${fontSize} font-bold leading-tight`}
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
                      background: "#333333",
                      borderRadius: 1,
                      verticalAlign: "middle",
                      animation: "blink 1s steps(2, start) infinite",
                    }}
                  />
                </span>
              </motion.h2>
            </AnimatePresence>

            <motion.p
              className="mt-2 text-sm text-[#555]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/30 backdrop-blur-sm"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90">
              <path
                d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 5h-2v6l5.2 3.2 1-1.6-4.2-2.6V7z"
                fill="#4facfe"
              />
            </svg>
            <div className="text-sm text-[#444]">
              <div className="font-semibold">
                {Math.min(currentIndex + 1, Math.max(totalTeachers, 1))} /{" "}
                {Math.max(totalTeachers, 1)}
              </div>
              <div className="text-xs text-[#777]">Progress</div>
            </div>
          </motion.div>
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
