import React, { useMemo } from "react";
import { FaCheckCircle, FaLock, FaUsers, FaClock, FaBook, FaClipboardList, FaTable } from "react-icons/fa";

export default function RightSidebar({ state }) {
  const quickStats = useMemo(() => {
    let totalLessons = 0;
    state.teachers.forEach((t) => {
      t.subjects.forEach((s) => {
        totalLessons += s.periodCount;
      });
    });

    const definedPeriods = state.validation.periods.filter(
      (p) => p.type === "teaching"
    ).length;
    const activeDays = state.validation.days.length;
    const capacity = definedPeriods * activeDays;
    const utilization = capacity > 0 ? (totalLessons / capacity) * 100 : 0;

    return { totalLessons, capacity, utilization };
  }, [state.teachers, state.validation]);

  return (
    <aside className="p-4 h-full flex flex-col gap-6 w-[280px] lg:w-[320px]">
      <section className="ui-surface-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="ui-eyebrow">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Overview
            </div>
            <h1 className="mt-2 text-2xl font-heading font-extrabold text-base-content">
              Summary
            </h1>
          </div>
          <div className="rounded-2xl bg-base-100 shadow-neo px-4 py-3 text-right">
            <div className="ui-label text-right mb-1">Live</div>
            <div className="text-3xl font-heading font-black text-primary">
              {quickStats.totalLessons}
            </div>
            <div className="text-xs ui-copy-muted">weekly lessons</div>
          </div>
        </div>
      </section>

      <section className="ui-surface-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base-content">
              Scheduling Posture
            </h3>
            <p className="mt-1 text-xs ui-copy-muted">
              {state.teachers.length} active teachers
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-100 shadow-neo text-primary">
            <FaClock className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-base-content">
                System Capacity
              </span>
              <span className="font-bold text-base-content">
                {quickStats.capacity} slots
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-base-content">
                Pressure Radar
              </span>
              <span className="font-bold text-base-content">
                {quickStats.totalLessons > 0
                  ? `${Math.round(quickStats.utilization)}%`
                  : "No demand"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-200 inset-neo-soft">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(quickStats.utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="ui-surface-card flex-1">
        <h3 className="font-heading font-bold text-base-content mb-3">Solver Notes</h3>
        <ul className="space-y-3 text-sm ui-copy-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Hard constraints: A teacher can only teach one class per period.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Capacity limits apply strictly per class block.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Double periods are handled dynamically where specified.
          </li>
        </ul>
      </section>
    </aside>
  );
}
