import React, { useMemo } from "react";
import NeumorphicCard from "./neuCard";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildPayload(state) {
  return {
    teachers: state.teachers.map((teacher) => ({
      name: teacher.name,
      subjects: teacher.subjects.map((entry) => ({
        subject: entry.subject,
        class: entry.class,
        lessonsPerWeek: entry.lessonsPerWeek,
      })),
    })),
    validation: {
      days: state.validation.days,
      periods: state.validation.periods,
      classes: state.validation.classes,
      selectedSubjects: state.validation.subjectsSelected,
    },
  };
}

async function readErrorMessage(response) {
  const text = await response.text();
  if (!text) {
    return "The timetable request failed.";
  }

  try {
    const payload = JSON.parse(text);
    if (typeof payload?.detail === "string") {
      return payload.detail;
    }
    if (Array.isArray(payload?.detail)) {
      return payload.detail
        .map((entry) => entry?.msg || JSON.stringify(entry))
        .join(". ");
    }
  } catch (error) {
    return text;
  }

  return text;
}

export default function Summary({ state, dispatch, teachers = [] }) {
  const activeDays = useMemo(
    () => state.validation.days.filter((day) => day.enabled),
    [state.validation.days]
  );
  const teachingPeriods = useMemo(
    () => state.validation.periods.filter((period) => period.type === "teaching"),
    [state.validation.periods]
  );

  const teacherLoads = useMemo(
    () =>
      teachers.map((teacher) => ({
        name: teacher.name,
        lessonCount: (teacher.subjects || []).reduce(
          (total, entry) => total + (Number(entry.lessonsPerWeek) || 0),
          0
        ),
        assignmentCount: teacher.subjects?.length || 0,
      })),
    [teachers]
  );

  const classLoads = useMemo(() => {
    const loads = new Map();
    teachers.forEach((teacher) => {
      teacher.subjects?.forEach((entry) => {
        loads.set(
          entry.class,
          (loads.get(entry.class) || 0) + (Number(entry.lessonsPerWeek) || 0)
        );
      });
    });

    return Array.from(loads.entries())
      .map(([className, lessonCount]) => ({ className, lessonCount }))
      .sort((left, right) => left.className.localeCompare(right.className));
  }, [teachers]);

  const totalWeeklyLessons = teacherLoads.reduce(
    (total, teacher) => total + teacher.lessonCount,
    0
  );
  const classCapacity = activeDays.length * teachingPeriods.length;
  const overloadedTeachers = teacherLoads.filter(
    (teacher) => teacher.lessonCount > classCapacity
  );
  const overloadedClasses = classLoads.filter(
    (entry) => entry.lessonCount > classCapacity
  );

  async function handleGenerate() {
    if (teachers.length === 0) {
      dispatch({
        type: "GENERATE_TIMETABLE_FAILURE",
        payload: "Add at least one teacher before generating a timetable.",
      });
      return;
    }

    if (totalWeeklyLessons === 0) {
      dispatch({
        type: "GENERATE_TIMETABLE_FAILURE",
        payload: "Add at least one teacher assignment with lessons per week.",
      });
      return;
    }

    dispatch({ type: "GENERATE_TIMETABLE_START" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(state)),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const timetable = await response.json();
      dispatch({ type: "GENERATE_TIMETABLE_SUCCESS", payload: timetable });
    } catch (error) {
      dispatch({
        type: "GENERATE_TIMETABLE_FAILURE",
        payload: error.message || "Failed to generate timetable.",
      });
    }
  }

  return (
    <NeumorphicCard className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Review and Generate</h2>
          <p className="text-sm text-gray-500">
            Check the requested weekly load before the OR-Tools solver runs.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {activeDays.length} days · {teachingPeriods.length} teaching periods/day
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Teachers</div>
          <div className="text-2xl font-semibold">{teachers.length}</div>
        </div>
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Class groups</div>
          <div className="text-2xl font-semibold">{classLoads.length}</div>
        </div>
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Weekly lessons requested</div>
          <div className="text-2xl font-semibold">{totalWeeklyLessons}</div>
        </div>
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Capacity per class</div>
          <div className="text-2xl font-semibold">{classCapacity}</div>
        </div>
      </section>

      {state.generation.error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.generation.error}
        </div>
      )}

      {(overloadedTeachers.length > 0 || overloadedClasses.length > 0) && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {overloadedTeachers.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <h3 className="font-semibold text-amber-900 mb-2">
                Teachers over weekly capacity
              </h3>
              <div className="space-y-1 text-sm text-amber-800">
                {overloadedTeachers.map((teacher) => (
                  <div key={teacher.name}>
                    {teacher.name}: {teacher.lessonCount} lessons requested
                  </div>
                ))}
              </div>
            </div>
          )}

          {overloadedClasses.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <h3 className="font-semibold text-amber-900 mb-2">
                Classes over weekly capacity
              </h3>
              <div className="space-y-1 text-sm text-amber-800">
                {overloadedClasses.map((entry) => (
                  <div key={entry.className}>
                    {entry.className}: {entry.lessonCount} lessons requested
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {teachers.map((teacher) => {
            const lessonCount = (teacher.subjects || []).reduce(
              (total, entry) => total + (Number(entry.lessonsPerWeek) || 0),
              0
            );

            return (
              <div
                key={teacher.name}
                className="rounded-2xl border bg-base-100 px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">
                      {teacher.subjects.length} assignment
                      {teacher.subjects.length === 1 ? "" : "s"} · {lessonCount} lessons/week
                    </p>
                  </div>
                </div>

                {teacher.subjects.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No assignments yet for this teacher.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {teacher.subjects.map((entry, index) => (
                      <div
                        key={`${entry.subject}-${entry.class}-${index}`}
                        className="rounded-xl border bg-base-200/50 px-3 py-2 text-sm"
                      >
                        <div className="font-medium">{entry.subject}</div>
                        <div className="text-gray-500">
                          {entry.class} · {entry.lessonsPerWeek} lesson
                          {entry.lessonsPerWeek === 1 ? "" : "s"} per week
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-base-100 px-4 py-4">
            <h3 className="font-semibold mb-3">Class Load Snapshot</h3>
            <div className="space-y-2 text-sm">
              {classLoads.length === 0 ? (
                <div className="text-gray-500">No class loads yet.</div>
              ) : (
                classLoads.map((entry) => (
                  <div
                    key={entry.className}
                    className="flex items-center justify-between rounded-xl bg-base-200/50 px-3 py-2"
                  >
                    <span>{entry.className}</span>
                    <span className="font-medium">{entry.lessonCount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-base-100 px-4 py-4">
            <h3 className="font-semibold mb-3">Solver Notes</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Each assignment becomes a weekly lesson demand that OR-Tools places
                into the enabled teaching slots.
              </p>
              <p>
                The solver blocks teacher clashes and class clashes, then tries to
                spread lessons across the week.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <button
          onClick={() => dispatch({ type: "BACK_TO_ASSIGNMENTS" })}
          className="px-4 py-2 rounded-lg border bg-base-100 hover:shadow"
          type="button"
        >
          Back to Assignments
        </button>

        <button
          onClick={handleGenerate}
          disabled={state.generation.loading}
          className={`px-4 py-2 rounded-lg text-white ${
            state.generation.loading
              ? "bg-gray-400"
              : "bg-primary hover:shadow-lg"
          }`}
          type="button"
        >
          {state.generation.loading ? "Generating..." : "Generate Timetable"}
        </button>
      </div>
    </NeumorphicCard>
  );
}
