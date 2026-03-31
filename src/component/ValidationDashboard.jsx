import React, { useMemo, useState } from "react";
import { FaCheck, FaExclamationTriangle, FaPlus } from "react-icons/fa";
import NeumorphicCard from "./neuCard";

export default function ValidationDashboard({ state, dispatch }) {
  const [banner, setBanner] = useState(null);
  const [newSubject, setNewSubject] = useState("");
  const validation = state.validation;

  const catalogs = useMemo(() => {
    const {
      primary = [],
      jss = [],
      sss = [],
      custom = [],
    } = validation.subjectsCatalog || {};

    return { primary, jss, sss, custom };
  }, [validation.subjectsCatalog]);

  const allSubjects = useMemo(() => {
    const pool = [];
    if (validation.levels.primary) {
      pool.push(...catalogs.primary);
    }
    if (validation.levels.jss) {
      pool.push(...catalogs.jss);
    }
    if (validation.levels.sss) {
      pool.push(...catalogs.sss);
    }
    pool.push(...catalogs.custom);

    return Array.from(new Set(pool)).sort((left, right) => left.localeCompare(right));
  }, [catalogs, validation.levels]);

  const activeDays = useMemo(
    () => validation.days.filter((day) => day.enabled),
    [validation.days]
  );
  const teachingPeriods = useMemo(
    () => validation.periods.filter((period) => period.type === "teaching"),
    [validation.periods]
  );
  const perClassCapacity = activeDays.length * teachingPeriods.length;

  function tryOrBanner(fn, onSuccess) {
    setBanner(null);
    try {
      const result = fn();
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      setBanner({ type: "error", msg: error?.message || "Something went wrong." });
    }
  }

  function handleConfirm() {
    tryOrBanner(
      () => dispatch({ type: "VALIDATION_CONFIRM" }),
      () =>
        setBanner({
          type: "success",
          msg: "Validation passed. You can now assign teacher workloads.",
        })
    );
  }

  function updatePeriod(index, patch) {
    const nextPeriods = validation.periods.map((period, currentIndex) =>
      currentIndex === index ? { ...period, ...patch } : period
    );
    tryOrBanner(() =>
      dispatch({ type: "VALIDATION_SET_PERIODS", payload: nextPeriods })
    );
  }

  function addPeriod() {
    const lastPeriod = validation.periods[validation.periods.length - 1];
    const newPeriod = {
      id: `p${Math.random().toString(36).slice(2, 7)}`,
      label: "New Period",
      start: lastPeriod?.end || "15:00",
      end: "15:40",
      type: "teaching",
    };

    tryOrBanner(() =>
      dispatch({
        type: "VALIDATION_SET_PERIODS",
        payload: [...validation.periods, newPeriod],
      })
    );
  }

  function removePeriod(index) {
    const nextPeriods = validation.periods.filter((_, currentIndex) => currentIndex !== index);
    tryOrBanner(() =>
      dispatch({ type: "VALIDATION_SET_PERIODS", payload: nextPeriods })
    );
  }

  function setRange(patch) {
    tryOrBanner(() =>
      dispatch({ type: "VALIDATION_SET_CLASS_RANGE", payload: patch })
    );
  }

  function addCustomSubject() {
    const subject = newSubject.trim();
    if (!subject) {
      return;
    }

    tryOrBanner(
      () => dispatch({ type: "VALIDATION_ADD_SUBJECT", payload: subject }),
      () => setNewSubject("")
    );
  }

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Validation</h2>
          <p className="text-sm text-gray-500">
            Finalize the school week before assigning teacher lessons.
          </p>
        </div>

        {banner && (
          <div
            className={`px-3 py-2 rounded-lg border text-sm ${
              banner.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {banner.type === "error" && (
              <FaExclamationTriangle className="inline mr-2" />
            )}
            {banner.msg}
          </div>
        )}
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Active days</div>
          <div className="text-2xl font-semibold">{activeDays.length}</div>
        </div>
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Teaching periods / day</div>
          <div className="text-2xl font-semibold">{teachingPeriods.length}</div>
        </div>
        <div className="rounded-2xl border bg-base-100 px-4 py-3">
          <div className="text-sm text-gray-500">Slots per class / week</div>
          <div className="text-2xl font-semibold">{perClassCapacity}</div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">School Levels</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { key: "primary", label: "Primary (Year 1-6)" },
            { key: "jss", label: "Junior Secondary (Year 7-9)" },
            { key: "sss", label: "Senior Secondary (Year 10-12)" },
          ].map((level) => (
            <button
              key={level.key}
              onClick={() =>
                dispatch({
                  type: "VALIDATION_TOGGLE_LEVEL",
                  payload: {
                    level: level.key,
                    value: !validation.levels[level.key],
                  },
                })
              }
              className={`px-3 py-2 rounded-xl border hover:shadow ${
                validation.levels[level.key] ? "bg-base-100" : "bg-base-200"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {validation.levels[level.key] && <FaCheck />}
                {level.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">School Days</h3>
        <div className="flex flex-wrap gap-3">
          {validation.days.map((day) => (
            <button
              key={day.id}
              onClick={() =>
                dispatch({ type: "VALIDATION_TOGGLE_DAY", payload: day.id })
              }
              className={`px-3 py-2 rounded-xl border hover:shadow ${
                day.enabled ? "bg-base-100" : "bg-base-200 text-gray-400"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {day.enabled && <FaCheck />}
                {day.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Class Range</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span>From</span>
            <input
              type="number"
              min={1}
              value={validation.classRange.from}
              onChange={(event) =>
                setRange({ from: parseInt(event.target.value || "0", 10) })
              }
              className="px-2 py-2 rounded-md border"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>To</span>
            <input
              type="number"
              min={validation.classRange.from}
              value={validation.classRange.to}
              onChange={(event) =>
                setRange({ to: parseInt(event.target.value || "0", 10) })
              }
              className="px-2 py-2 rounded-md border"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Prefix</span>
            <input
              value={validation.classRange.prefix}
              onChange={(event) => setRange({ prefix: event.target.value })}
              className="px-2 py-2 rounded-md border"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {validation.classes.map((className) => (
            <span
              key={className}
              className="px-2 py-1 text-xs rounded-md border bg-base-100"
            >
              {className}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-3">
          Subjects (checked subjects become available for teacher assignments)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {allSubjects.map((subject) => (
            <label
              key={subject}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-base-100"
            >
              <input
                type="checkbox"
                checked={validation.subjectsSelected.includes(subject)}
                onChange={() =>
                  dispatch({
                    type: "VALIDATION_TOGGLE_SUBJECT",
                    payload: subject,
                  })
                }
              />
              <span className="text-sm">{subject}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            placeholder="Add custom subject"
            value={newSubject}
            onChange={(event) => setNewSubject(event.target.value)}
            className="px-3 py-2 rounded-lg border flex-1"
          />
          <button
            onClick={addCustomSubject}
            className="px-3 py-2 rounded-lg border bg-base-100"
          >
            <FaPlus className="inline mr-2" />
            Add
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-3">Daily Periods</h3>
        <div className="space-y-2">
          {validation.periods.map((period, index) => (
            <div
              key={period.id || index}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center px-3 py-2 rounded-xl border bg-base-100"
            >
              <input
                value={period.label}
                onChange={(event) =>
                  updatePeriod(index, { label: event.target.value })
                }
                className="px-2 py-1 rounded-md border"
                placeholder="Label"
              />
              <input
                value={period.start}
                onChange={(event) =>
                  updatePeriod(index, { start: event.target.value })
                }
                className="px-2 py-1 rounded-md border"
                placeholder="HH:MM"
              />
              <input
                value={period.end}
                onChange={(event) =>
                  updatePeriod(index, { end: event.target.value })
                }
                className="px-2 py-1 rounded-md border"
                placeholder="HH:MM"
              />
              <select
                value={period.type}
                onChange={(event) =>
                  updatePeriod(index, { type: event.target.value })
                }
                className="px-2 py-1 rounded-md border"
              >
                <option value="teaching">Teaching</option>
                <option value="non-teaching">Non-Teaching</option>
              </select>
              <button
                onClick={() => removePeriod(index)}
                className="px-2 py-1 rounded-md border hover:shadow"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button
            onClick={addPeriod}
            className="px-3 py-2 rounded-lg border bg-base-100"
          >
            <FaPlus className="inline mr-2" />
            Add Period
          </button>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded-lg border bg-base-100 hover:shadow"
        >
          Continue to Teacher Workloads
        </button>
      </div>
    </NeumorphicCard>
  );
}
