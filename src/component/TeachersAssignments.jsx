import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import NeumorphicCard from "./neuCard";

/**
 * Strict, prop-driven Subject + Year entry with inline edit
 *
 * Props (all optional except dispatch):
 * - dispatch: function (required)  -> action types used: ADD_SUBJECT_CLASS, REMOVE_SUBJECT, EDIT_SUBJECT, PREV_TEACHER, NEXT_TEACHER
 * - teacher: { name, subjects: [{subject, class}] }
 * - currentIndex, totalTeachers
 * - minYear=1, maxYear=12
 *
 * - allowedSubjects?: string[]                 // canonical list to enforce (case-insensitive). If omitted, any subject allowed.
 * - allSubjects?: string[]                     // fallback list for Autocomplete suggestions if allowedSubjects not given.
 *
 * - validateSubjectYear?: (subject, year, ctx) => string|null
 *      // Optional hook for strict subject↔year validation. Return error string to block, or null to allow.
 *      // ctx = { teacher, currentIndex, allTeacherSubjects: teacher?.subjects ?? [] }
 *
 * - subjectYearMap?: Record<string, number[] | {min:number, max:number}>
 *      // Optional alternative to validateSubjectYear. If provided:
 *      //  - If value is array -> allowed years
 *      //  - If value is {min,max} -> allowed inclusive range
 *
 * - allowAcronymHeuristic?: boolean (default true)
 *      // If true, accepts tokens like "CCA", "SOS", "CRS", "BST" even if not in allowedSubjects.
 *
 * - normalizeSubject?: (text) => string
 *      // Optional: supply your own canonicalizer. Default preserves ALL-CAPS acronyms; otherwise Title-Case.
 */
export default function SubjectClassInput({
  dispatch,
  teacher = { name: "Unknown", subjects: [] },
  currentIndex = 0,
  totalTeachers = 1,
  minYear = 1,
  maxYear = 12,
  allowedSubjects,
  allSubjects,
  validateSubjectYear,
  subjectYearMap,
  allowAcronymHeuristic = true,
  normalizeSubject,
}) {
  // ---------- options (unique + trimmed) ----------
  const subjectOptions = useMemo(() => {
    const src =
      Array.isArray(allowedSubjects) && allowedSubjects.length
        ? allowedSubjects
        : Array.isArray(allSubjects)
        ? allSubjects
        : [];
    return Array.from(new Set(src.map((s) => (s || "").trim()).filter(Boolean)));
  }, [allowedSubjects, allSubjects]);

  // ---------- helpers ----------
  const isAcronym = (s) =>
    !!s && /^[A-Z]{2,8}$/.test(s.trim()); // heuristic-only, no hardcoding

  const defaultNormalize = (s) => {
    const t = (s || "").trim();
    if (!t) return "";
    if (isAcronym(t)) return t; // keep real acronyms (CCA, SOS, CRS, BST...)
    // Title Case (simple)
    return t
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };
  const norm = normalizeSubject || defaultNormalize;

  const ciEq = (a, b) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

  const canonicalFromOptions = (text) => {
    const t = (text || "").trim().toLowerCase();
    const found = subjectOptions.find((o) => o.toLowerCase() === t);
    return found || null;
  };

  const inAllowed = (text) => {
    if (!Array.isArray(subjectOptions) || subjectOptions.length === 0) return true; // nothing to enforce
    const hit = canonicalFromOptions(text);
    if (hit) return true;
    if (allowAcronymHeuristic && isAcronym(text)) return true; // allow real acronyms even if not in list
    return false;
  };

  const yearAllowedByMap = (subjectText, yr) => {
    if (!subjectYearMap) return true;
    const key = Object.keys(subjectYearMap).find((k) => ciEq(k, subjectText));
    if (!key) return true; // subject not constrained
    const rule = subjectYearMap[key];
    if (Array.isArray(rule)) return rule.includes(yr);
    if (rule && typeof rule === "object") {
      const { min, max } = rule;
      if (typeof min === "number" && yr < min) return false;
      if (typeof max === "number" && yr > max) return false;
    }
    return true;
  };

  const subjectYearCustomCheck = (subjectText, yr) => {
    if (typeof validateSubjectYear === "function") {
      return validateSubjectYear(subjectText, yr, {
        teacher,
        currentIndex,
        allTeacherSubjects: Array.isArray(teacher?.subjects) ? teacher.subjects : [],
      });
    }
    return null;
  };

  // ---------- state ----------
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const subjectInputRef = useRef(null);

  // Edit state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editSubject, setEditSubject] = useState("");
  const [editYear, setEditYear] = useState("");
  const editRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const el =
        subjectInputRef.current?.querySelector("input") || subjectInputRef.current;
      el?.focus?.();
    }, 40);
    setEditingIndex(-1);
  }, [teacher?.name, currentIndex]);

  const clampYear = (val) => {
    const n = Number(val);
    if (val === "") return "";
    if (Number.isNaN(n)) return "";
    if (n < minYear) return String(minYear);
    if (n > maxYear) return String(maxYear);
    return String(Math.floor(n));
  };

  const subjects = Array.isArray(teacher?.subjects) ? teacher.subjects : [];

  // ---------- unified validation ----------
  const validatePair = (rawSubject, rawYear, { editing = false, excludeIndex = -1 } = {}) => {
    const trimmedSub = (rawSubject || "").trim();
    const trimmedYr = (rawYear || "").trim();

    if (!trimmedSub) return "Please enter a subject.";
    if (!inAllowed(trimmedSub)) return `"${trimmedSub}" is not an allowed subject. Choose from the list.`;

    if (!trimmedYr) return `Please enter a year (${minYear}-${maxYear}).`;
    const num = Number(trimmedYr);
    if (!Number.isInteger(num) || num < minYear || num > maxYear)
      return `Year must be an integer between ${minYear} and ${maxYear}.`;

    const displaySub = norm(trimmedSub);

    // subject↔year map (if provided)
    if (!yearAllowedByMap(displaySub, num))
      return `“${displaySub}” is not offered for Year ${num}.`;

    // custom hook (if provided)
    const customMsg = subjectYearCustomCheck(displaySub, num);
    if (typeof customMsg === "string" && customMsg.trim()) return customMsg.trim();

    // duplicates (case-insensitive subject + exact year)
    const dup = subjects.some((p, i) => {
      if (editing && i === excludeIndex) return false;
      const yr = parseInt(String(p.class || "").match(/\d+/)?.[0] || "", 10);
      return ciEq(p.subject, displaySub) && yr === num;
    });
    if (dup) return `Duplicate: ${displaySub} — Year ${num} already exists for this teacher.`;

    return null; // OK
  };

  // ---------- actions ----------
  function handleAddSubjects(e) {
    e?.preventDefault();
    setError("");

    const msg = validatePair(subject, year);
    if (msg) {
      setError(msg);
      return;
    }

    const num = Number(year.trim());
    const displaySub = norm(subject);

    dispatch({
      type: "ADD_SUBJECT_CLASS",
      payload: { subject: displaySub, class: `Year ${num}` },
    });

    setSubject("");
    setYear("");
    setTimeout(() => {
      const el =
        subjectInputRef.current?.querySelector("input") || subjectInputRef.current;
      el?.focus?.();
    }, 40);
  }

  function handleRemoveSubject(index) {
    dispatch({
      type: "REMOVE_SUBJECT",
      payload: { teacherIndex: currentIndex, subjectIndex: index },
    });
    if (index === editingIndex) cancelEdit();
  }

  function handleBack() {
    dispatch({ type: "PREV_TEACHER" });
  }

  function handleSkipOrNext() {
    dispatch({ type: "NEXT_TEACHER" });
  }

  // ---------- edit handlers ----------
  function startEdit(index) {
    const s = teacher?.subjects?.[index];
    if (!s) return;
    setEditingIndex(index);
    setEditSubject(s.subject ?? "");
    const match = (s.class || "").match(/(\d+)/);
    setEditYear(match ? match[1] : "");
    setTimeout(() => editRef.current?.focus(), 50);
    setError("");
  }

  function cancelEdit() {
    setEditingIndex(-1);
    setEditSubject("");
    setEditYear("");
    setError("");
  }

  function saveEdit(index) {
    setError("");

    const msg = validatePair(editSubject, editYear, { editing: true, excludeIndex: index });
    if (msg) {
      setError(msg);
      return;
    }

    const num = Number((editYear || "").trim());
    const displaySub = norm(editSubject);

    dispatch({
      type: "EDIT_SUBJECT",
      payload: {
        teacherIndex: currentIndex,
        subjectIndex: index,
        subject: displaySub,
        class: `Year ${num}`,
      },
    });
    cancelEdit();
  }

  const gradientTextStyle = {
    background: "linear-gradient(90deg,#ff4c60 0%, #ff8aa1 40%, #a18cd1 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

  return (
    <NeumorphicCard className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-bold leading-tight"
              style={gradientTextStyle}
              aria-live="polite"
            >
              Add Subjects for {teacher?.name ?? "—"}{" "}
              <span className="text-sm font-medium text-[#666]">
                — ({Math.min(currentIndex + 1, totalTeachers)} of {Math.max(totalTeachers, 1)})
              </span>
            </h2>
            <p className="mt-1 text-sm text-[#555]">
              Add a subject and pick the Year (e.g. Maths — Year 3). Use Enter to add.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 backdrop-blur-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="#333"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-[#333]">Back</span>
            </button>

            <button
              type="button"
              onClick={handleSkipOrNext}
              aria-label="Skip or Next"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 6l6 6-6 6" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-[#333]">Skip</span>
            </button>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={handleAddSubjects} className="flex gap-2 items-stretch">
          {/* SUBJECT with MUI Autocomplete */}
          <div className="relative flex-1" ref={subjectInputRef}>
            <Autocomplete
              freeSolo // we still validate; allows acronyms not in list
              options={subjectOptions}
              inputValue={subject}
              onInputChange={(_, newInput) => {
                setSubject(newInput ?? "");
                setError("");
              }}
              onChange={(_, newValue) => {
                if (typeof newValue === "string") setSubject(newValue);
                else if (newValue) setSubject(String(newValue));
                else setSubject("");
              }}
              autoHighlight
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Subject (e.g. Maths, CCA)"
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": "Subject",
                    autoComplete: "on",
                  }}
                  autoFocus
                  className="bg-white rounded-lg"
                />
              )}
            />
          </div>

          {/* YEAR */}
          <div className="flex items-center gap-2">
            <label htmlFor="yearInput" className="text-sm text-[#444] font-medium">
              Year
            </label>
            <input
              id="yearInput"
              type="number"
              inputMode="numeric"
              min={minYear}
              max={maxYear}
              value={year}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setYear("");
                  return;
                }
                setYear(clampYear(val));
              }}
              className="w-24 px-3 py-2 rounded-lg shadow-inner outline-none text-center"
              aria-label="Year number"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"
            aria-label="Add subject"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add
          </button>
        </form>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {/* Subjects list with edit inline */}
        <div>
          <AnimatePresence>
            {subjects.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm text-[#666]">No subjects yet for this teacher.</p>
              </motion.div>
            ) : (
              subjects.map((s, idx) => {
                const isEditing = idx === editingIndex;
                return (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-between gap-3 px-3 py-2 mb-2 rounded-lg bg-white/30"
                  >
                    {!isEditing ? (
                      <>
                        <div>
                          <div className="font-medium text-[#222]">{s.subject}</div>
                          <div className="text-sm text-[#666]">{s.class}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(idx)}
                            aria-label={`Edit ${s.subject}`}
                            className="p-2 rounded-md bg-blue-50"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M3 21v-3.6L14.3 5.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4L6.6 20.6H3z"
                                stroke="#0c4a6e"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path d="M14.7 4.3l4 4" stroke="#0c4a6e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            aria-label={`Remove ${s.subject}`}
                            className="p-2 rounded-md bg-red-50"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6"
                                stroke="#c53030"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      // Inline edit row
                      <>
                        <div className="flex-1 flex gap-2 items-stretch">
                          <input
                            ref={editRef}
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg shadow-inner outline-none"
                            aria-label="Edit subject"
                          />
                          <input
                            value={editYear}
                            onChange={(e) => setEditYear(clampYear(e.target.value))}
                            className="w-24 px-3 py-2 rounded-lg shadow-inner outline-none text-center"
                            aria-label="Edit year"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => saveEdit(idx)} className="px-3 py-1 rounded-md bg-green-500 text-white">
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit} className="px-3 py-1 rounded-md bg-gray-200">
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleSkipOrNext}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
            aria-label="Next teacher"
          >
            {currentIndex + 1 >= totalTeachers ? "Finish" : "Next Teacher"}
          </button>
        </div>
      </div>
    </NeumorphicCard>
  );
}
  