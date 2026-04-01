import React, { useMemo, useState } from "react";
import NeumorphicCard from "./neuCard";

function ScheduleGrid({ title, schedules = [] }) {
  if (!schedules.length) {
    return (
      <div className="rounded-2xl border bg-base-100 px-4 py-4 text-sm text-gray-500">
        No schedule data available for {title.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {schedules.map((schedule) => (
        <div key={schedule.name} className="ui-surface-card mb-6">
          <h3 className="text-lg font-semibold mb-3">{schedule.name}</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-base-100 border px-4 py-2 text-left">
                    Period
                  </th>
                  {schedule.days.map((day) => (
                    <th key={day.id} className="border px-4 py-2 text-left">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.rows.map((row) => (
                  <tr key={row.period.id}>
                    <th className="sticky left-0 z-10 bg-base-100 border px-4 py-3 text-left align-top min-w-40">
                      <div className="font-medium">{row.period.label}</div>
                      <div className="text-xs text-gray-500">
                        {row.period.start} - {row.period.end}
                      </div>
                    </th>
                    {row.cells.map((cell) => (
                      <td
                        key={`${row.period.id}-${cell.day.id}`}
                        className="border px-4 py-3 min-w-44 align-top"
                      >
                        {cell.entry ? (
                          <div className="space-y-1">
                            <div className="font-medium">{cell.entry.subject}</div>
                            <div className="text-sm text-gray-600">
                              {cell.entry.secondaryLabel}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Free</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TimetableView({ timetable, dispatch }) {
  const [activeView, setActiveView] = useState("class");

  const assignments = timetable?.assignments || [];
  const stats = timetable?.meta || {};
  const scheduleOptions = useMemo(
    () => ({
      class: timetable?.scheduleByClass || [],
      teacher: timetable?.scheduleByTeacher || [],
    }),
    [timetable]
  );

  if (!timetable) {
    return (
      <NeumorphicCard className="w-full">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Generated Timetable</h2>
          <p className="text-sm text-gray-500">
            No generated timetable is loaded yet.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "VIEW_SUMMARY" })}
            className="ui-button ui-button-soft"
          >
            Back to Summary
          </button>
        </div>
      </NeumorphicCard>
    );
  }

  return (
    <NeumorphicCard className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Generated Timetable</h2>
            <p className="text-sm text-gray-500">
              OR-Tools solved {stats.lessonsScheduled || assignments.length} lessons
              across {stats.dayCount || 0} day{stats.dayCount === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveView("class")}
              className={`ui-button ${
                activeView === "class" ? "ui-button-secondary" : "ui-button-soft"
              }`}
            >
              By Class
            </button>
            <button
              type="button"
              onClick={() => setActiveView("teacher")}
              className={`ui-button ${
                activeView === "teacher" ? "ui-button-secondary" : "ui-button-soft"
              }`}
            >
              By Teacher
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "VIEW_SUMMARY" })}
              className="ui-button ui-button-soft"
            >
              Back to Summary
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET" })}
              className="ui-button ui-button-primary"
            >
              Start Over
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="ui-stat-card">
            <div className="text-sm ui-copy-muted">Solver status</div>
            <div className="text-2xl font-semibold">{stats.solverStatus || "Unknown"}</div>
          </div>
          <div className="ui-stat-card">
            <div className="text-sm ui-copy-muted">Teachers</div>
            <div className="text-2xl font-semibold">{stats.teacherCount || 0}</div>
          </div>
          <div className="ui-stat-card">
            <div className="text-sm ui-copy-muted">Classes</div>
            <div className="text-2xl font-semibold">{stats.classCount || 0}</div>
          </div>
          <div className="ui-stat-card">
            <div className="text-sm ui-copy-muted">Objective score</div>
            <div className="text-2xl font-semibold">
              {stats.objectiveValue ?? "n/a"}
            </div>
          </div>
        </section>

        <ScheduleGrid
          title={activeView === "class" ? "Classes" : "Teachers"}
          schedules={scheduleOptions[activeView]}
        />

        <div className="ui-surface-card mt-6">
          <h3 className="text-lg font-semibold mb-3">Lesson Placements</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {["Day", "Period", "Class", "Subject", "Teacher"].map((heading) => (
                    <th key={heading} className="border px-4 py-2 text-left">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={`${assignment.day}-${assignment.period}-${assignment.className}-${index}`}>
                    <td className="border px-4 py-2">{assignment.day}</td>
                    <td className="border px-4 py-2">
                      {assignment.period}
                      <div className="text-xs text-gray-500">
                        {assignment.start} - {assignment.end}
                      </div>
                    </td>
                    <td className="border px-4 py-2">{assignment.className}</td>
                    <td className="border px-4 py-2">{assignment.subject}</td>
                    <td className="border px-4 py-2">{assignment.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
}
