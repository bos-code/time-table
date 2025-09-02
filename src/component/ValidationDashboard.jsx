// ValidationDashboard.jsx
import React, { useMemo, useState } from "react";
import { FaCheck, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import NeumorphicCard from "./neuCard";

export default function ValidationDashboard({ state, dispatch }) {
  const [banner, setBanner] = useState(null); // {type:'error'|'success'|'info', msg:string}
  const v = state.validation;
  const catalogs = useMemo(() => {
    const {
      primary = [],
      jss = [],
      sss = [],
      custom = [],
    } = v.subjectsCatalog || {};
    return { primary, jss, sss, custom };
  }, [v.subjectsCatalog]);

  function tryOrBanner(fn, onSuccess) {
    setBanner(null);
    try {
      const result = fn();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setBanner({ type: "error", msg: err?.message || "An error occurred." });
    }
  }

  function handleConfirm() {
    tryOrBanner(() => {
      dispatch({ type: "VALIDATION_CONFIRM" });
      setBanner({
        type: "success",
        msg: "Validated. Proceed to assign subjects to teachers.",
      });
    });
  }

  // --- SUBJECTS
  const allSubjects = useMemo(() => {
  const pool = [];
    if (v.levels.primary) pool.push(...catalogs.primary);
    if (v.levels.jss) pool.push(...catalogs.jss);
    if (v.levels.sss) pool.push(...catalogs.sss);
    pool.push(...(catalogs.custom || []));
    return Array.from(new Set(pool)).sort((a, b) => a.localeCompare(b));
  }, [v.levels, catalogs]);

  const isChecked = (s) => v.subjectsSelected.includes(s);

  // --- PERIODS edit helpers
  function updatePeriod(idx, patch) {
    const next = v.periods.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    tryOrBanner(() =>
      dispatch({ type: "VALIDATION_SET_PERIODS", payload: next })
    );
  }
  function addPeriod() {
    const last = v.periods[v.periods.length - 1];
    const newP = {
      id: `p${Math.random().toString(36).slice(2, 7)}`,
      label: "New Period",
      start: last?.end || "15:00",
      end: "15:40",
      type: "teaching",
    };
    tryOrBanner(() =>
      dispatch({
        type: "VALIDATION_SET_PERIODS",
        payload: [...v.periods, newP],
      })
    );
  }
  function removePeriod(idx) {
    const next = v.periods.filter((_, i) => i !== idx);
    tryOrBanner(() =>
      dispatch({ type: "VALIDATION_SET_PERIODS", payload: next })
    );
  }

  // --- CLASS RANGE
  function setRange(patch) {
    tryOrBanner(() =>
      dispatch({ type: "VALIDATION_SET_CLASS_RANGE", payload: patch })
    );
  }

  // --- ADD CUSTOM SUBJECT
  const [newSubject, setNewSubject] = useState("");
  function addCustomSubject() {
    const s = newSubject.trim();
    if (!s) return;
    tryOrBanner(
      () => dispatch({ type: "VALIDATION_ADD_SUBJECT", payload: s }),
      () => setNewSubject("")
    );
  }

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Validation</h2>
        {banner && (
          <div
            className={`px-3 py-2 rounded-lg border text-sm ${
              banner.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : banner.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            {banner.type === "error" && (
              <FaExclamationTriangle className="inline mr-2" />
            )}
            {banner.msg}
          </div>
        )}
      </div>

      {/* Levels */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">School Levels</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { key: "primary", label: "Primary (Year 1–6)" },
            { key: "jss", label: "Junior Secondary (Year 7–9)" },
            { key: "sss", label: "Senior Secondary (Year 10–12)" },
          ].map((lvl) => (
            <button
              key={lvl.key}
              onClick={() =>
                dispatch({
                  type: "VALIDATION_TOGGLE_LEVEL",
                  payload: { level: lvl.key, value: !v.levels[lvl.key] },
                })
              }
              className={`px-3 py-2 rounded-xl border hover:shadow ${
                v.levels[lvl.key] ? "bg-base-100" : "bg-base-200"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {v.levels[lvl.key] && <FaCheck />}
                {lvl.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Class Range */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Class Range (default Year 7–12)</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">From</label>
            <input
              type="number"
              min={1}
              value={v.classRange.from}
              onChange={(e) =>
                setRange({ from: parseInt(e.target.value || "0", 10) })
              }
              className="px-2 py-1 rounded-md border"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">To</label>
            <input
              type="number"
              min={v.classRange.from}
              value={v.classRange.to}
              onChange={(e) =>
                setRange({ to: parseInt(e.target.value || "0", 10) })
              }
              className="px-2 py-1 rounded-md border"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Prefix</label>
            <input
              value={v.classRange.prefix}
              onChange={(e) => setRange({ prefix: e.target.value })}
              className="px-2 py-1 rounded-md border"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {v.classes.map((c) => (
            <span
              key={c}
              className="px-2 py-1 text-xs rounded-md border bg-base-100"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Subjects checklist */}
      <section className="mb-6">
        <h3 className="font-semibold mb-3">
          Subjects (Lagos + Your Defaults; uncheck to exclude)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {allSubjects.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-base-100"
            >
              <input
                type="checkbox"
                checked={isChecked(s)}
                onChange={() =>
                  dispatch({ type: "VALIDATION_TOGGLE_SUBJECT", payload: s })
                }
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            placeholder="Add custom subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
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

      {/* Periods */}
      <section className="mb-6">
        <h3 className="font-semibold mb-3">Periods (editable)</h3>
        <div className="space-y-2">
          {v.periods.map((p, idx) => (
            <div
              key={p.id || idx}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center px-3 py-2 rounded-xl border bg-base-100"
            >
              <input
                value={p.label}
                onChange={(e) => updatePeriod(idx, { label: e.target.value })}
                className="px-2 py-1 rounded-md border"
                placeholder="Label"
              />
              <input
                value={p.start}
                onChange={(e) => updatePeriod(idx, { start: e.target.value })}
                className="px-2 py-1 rounded-md border"
                placeholder="HH:MM"
              />
              <input
                value={p.end}
                onChange={(e) => updatePeriod(idx, { end: e.target.value })}
                className="px-2 py-1 rounded-md border"
                placeholder="HH:MM"
              />
              <select
                value={p.type}
                onChange={(e) => updatePeriod(idx, { type: e.target.value })}
                className="px-2 py-1 rounded-md border"
              >
                <option value="teaching">Teaching</option>
                <option value="non-teaching">Non-Teaching</option>
              </select>
              <button
                onClick={() => removePeriod(idx)}
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
            <FaPlus className="inline mr-2" /> Add Period
          </button>
        </div>
      </section>

          <div className="flex justify-end">
              
        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded-lg border bg-base-100 hover:shadow"
        >
          Continue to Assignments
        </button>
      </div>
    </NeumorphicCard>
  );
}
