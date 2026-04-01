import React, { useMemo } from "react";
import {
  FaCheckCircle,
  FaLock,
  FaUsers,
  FaClock,
  FaBook,
  FaClipboardList,
  FaTable,
} from "react-icons/fa";

const STEPS = [
  { id: "teacher-input", label: "Add Teachers", icon: FaUsers },
  { id: "validation", label: "Validate Week", icon: FaClock },
  { id: "subject-class-input", label: "Workload", icon: FaBook },
  { id: "summary", label: "Review", icon: FaClipboardList },
  { id: "timetable-generated", label: "Timetable", icon: FaTable },
];

export default function LeftSidebar({ state, dispatch, screen, isCollapsed }) {
  const currentIndex = useMemo(() => {
    return STEPS.findIndex((s) => s.id === screen);
  }, [screen]);

  return (
    <aside className="p-4 h-full flex flex-col gap-6">
      <section className="ui-surface-card flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="mb-6">
            <div className="ui-eyebrow">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Workflow
            </div>
            <h2 className="mt-2 text-xl font-heading font-bold">Steps</h2>
          </div>
        )}

        <nav className="flex flex-col gap-2 relative">
          <div className="absolute left-[31px] top-8 bottom-8 w-px bg-[color-mix(in_srgb,var(--color-base-content)_10%,transparent)] hidden lg:block" />

          {STEPS.map((step, index) => {
            const active = screen === step.id;
            const completed = index < currentIndex;
            const unlocked =
              index <= currentIndex ||
              (index === 1 && state.teachers.length > 0) ||
              (index === 2 && state.validation.days.length > 0) ||
              (index === 3 && state.teachers.some((t) => t.subjects.length > 0)) ||
              (index === 4 && state.generatedTimetable);

            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!unlocked}
                onClick={() => dispatch({ type: "GO_TO_SCREEN", payload: step.id })}
                className={`flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 w-full outline-none relative z-10 ${
                  active
                    ? "bg-primary/10 shadow-neo-hover"
                    : !unlocked
                    ? "opacity-40 grayscale cursor-not-allowed"
                    : "hover:bg-base-200"
                } ${isCollapsed ? "justify-center px-1" : "text-left"}`}
                title={isCollapsed ? step.label : undefined}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-neo transition-colors ${
                    active
                      ? "bg-primary text-primary-content"
                      : completed
                      ? "bg-base-content text-base-100"
                      : "bg-base-200 text-base-content"
                  }`}
                >
                  {unlocked ? (
                    completed && !active ? (
                      <FaCheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )
                  ) : (
                    <FaLock className="w-4 h-4" />
                  )}
                </span>

                {!isCollapsed && (
                  <div className="mt-0.5 truncate">
                    <div className={`font-semibold text-sm ${active ? "text-primary" : "text-base-content"}`}>
                      {step.label}
                    </div>
                    {active && <div className="text-xs ui-copy-muted mt-0.5">In progress</div>}
                    {completed && !active && <div className="text-xs text-success mt-0.5">Completed</div>}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </section>
    </aside>
  );
}
