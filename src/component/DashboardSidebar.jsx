import React from "react";
import {
  FaCalendarAlt,
  FaChartPie,
  FaCheckCircle,
  FaChalkboardTeacher,
  FaLock,
  FaMagic,
  FaTable,
} from "react-icons/fa";
import { getQuickStats } from "../utils/dashboard";

const STEPS = [
  {
    id: "teacher-input",
    label: "Teacher Roster",
    hint: "Create the staff base",
    icon: FaChalkboardTeacher,
  },
  {
    id: "validation",
    label: "School Week",
    hint: "Days, periods, and subject pool",
    icon: FaCalendarAlt,
  },
  {
    id: "subject-class-input",
    label: "Workloads",
    hint: "Map teachers to class demand",
    icon: FaChartPie,
  },
  {
    id: "summary",
    label: "Review",
    hint: "Stress-test the plan",
    icon: FaMagic,
  },
  {
    id: "timetable-generated",
    label: "Timetable",
    hint: "Inspect solver output",
    icon: FaTable,
  },
];

function canOpenStep(state, stepId) {
  if (stepId === "teacher-input") {
    return true;
  }
  if (stepId === "timetable-generated") {
    return Boolean(state.generatedTimetable);
  }
  return state.teachers.length > 0;
}

export default function DashboardSidebar({ state, dispatch, screen }) {
  const quickStats = getQuickStats(state);
  const currentIndex = STEPS.findIndex((step) => step.id === screen);
  const highestTeacherLoad = quickStats.teacherLoads[0];
  const highestClassLoad = quickStats.classLoads[0];
  const utilization = quickStats.weeklyCapacityPerClass
    ? Math.min(
        100,
        Math.round(
          ((highestClassLoad?.lessonCount || 0) / quickStats.weeklyCapacityPerClass) *
            100
        )
      )
    : 0;

  return (
    <aside className="xl:sticky xl:top-6 h-fit">
      <div className="ui-shell-panel rounded-[2.1rem] p-5 sm:p-6">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />

        <div className="relative space-y-6">
          <section className="ui-surface-card overflow-hidden">
            <div className="ui-eyebrow">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Planner Suite
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-base-content">
                  School Dashboard
                </h1>
                <p className="mt-2 max-w-xs text-sm leading-6 ui-copy-muted">
                  A premium planning cockpit for teacher capacity, class pressure, and
                  solver-ready timetable setup.
                </p>
              </div>

              <div className="rounded-2xl bg-base-100 shadow-neo px-4 py-3 text-right">
                <div className="ui-label text-right mb-1">
                  Live
                </div>
                <div className="text-3xl font-heading font-black text-primary">
                  {quickStats.totalLessons}
                </div>
                <div className="text-xs ui-copy-muted">weekly lessons</div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-base-content">Workflow</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] ui-copy-soft">
                  Five-step sequence
                </div>
              </div>
              <div className="ui-badge-soft mt-1">
                Step {Math.max(currentIndex + 1, 1)} / {STEPS.length}
              </div>
            </div>

            <nav className="mt-4 space-y-2">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const unlocked = canOpenStep(state, step.id);
                const active = step.id === screen;
                const completed =
                  currentIndex > index ||
                  (step.id === "timetable-generated" && Boolean(state.generatedTimetable));

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => dispatch({ type: "GO_TO_SCREEN", payload: step.id })}
                    className={`flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 w-full text-left outline-none ${
                      active 
                        ? "bg-primary/10 shadow-neo-hover" 
                        : !unlocked 
                          ? "opacity-40 grayscale cursor-not-allowed" 
                          : "hover:bg-base-200"
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-neo transition-colors ${
                      active ? "bg-primary text-primary-content" :
                      completed ? "bg-base-content text-base-100" :
                      "bg-base-200 text-base-content"
                    }`}>
                      {unlocked ? (
                        completed && !active ? <FaCheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />
                      ) : (
                        <FaLock className="w-4 h-4" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-base-content">
                          {step.label}
                        </span>
                        <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] ui-copy-soft">
                          0{index + 1}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs ui-copy-muted">
                        {step.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </section>

          <hr className="border-t border-[color-mix(in_srgb,var(--color-base-content)_10%,transparent)]" />
          <section className="ui-surface-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-base-content">
                  Scheduling posture
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] ui-copy-soft">
                  Snapshot
                </div>
              </div>
              <div className="ui-badge-soft">{quickStats.teacherCount} staff</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="ui-stat-card p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ui-copy-soft">
                  Teachers
                </div>
                <div className="mt-2 text-2xl font-black">{quickStats.teacherCount}</div>
              </div>
              <div className="ui-stat-card p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ui-copy-soft">
                  Classes
                </div>
                <div className="mt-2 text-2xl font-black">{quickStats.classCount}</div>
              </div>
              <div className="ui-stat-card p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ui-copy-soft">
                  Days
                </div>
                <div className="mt-2 text-2xl font-black">
                  {quickStats.activeDays.length}
                </div>
              </div>
              <div className="ui-stat-card p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ui-copy-soft">
                  Subjects
                </div>
                <div className="mt-2 text-2xl font-black">
                  {quickStats.subjectCount}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-t border-[color-mix(in_srgb,var(--color-base-content)_10%,transparent)]" />
          <section className="ui-surface-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-base-content">
                  Pressure radar
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] ui-copy-soft">
                  Highest demand
                </div>
              </div>
              <div className="ui-badge-soft">{utilization}% utilized</div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="ui-copy-muted">Heaviest class</span>
                  <span className="font-semibold text-base-content">
                    {highestClassLoad
                      ? `${highestClassLoad.className} (${highestClassLoad.lessonCount})`
                      : "No demand yet"}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-200 inset-neo-soft">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>

              <div className="ui-row-card p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ui-copy-soft">
                  Busiest teacher
                </div>
                <div className="mt-2 text-sm font-semibold text-base-content">
                  {highestTeacherLoad
                    ? `${highestTeacherLoad.name} · ${highestTeacherLoad.lessonCount} lessons`
                    : "No assignments yet"}
                </div>
              </div>

              <div className="ui-row-card p-4">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] ui-copy-soft">
                  Capacity
                </div>
                <div className="mt-2 text-sm font-semibold text-base-content">
                  {quickStats.weeklyCapacityPerClass || 0} teaching slots per class
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
