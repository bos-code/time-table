import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NeumorphicCard from "./neuCard";

/**
 * SubjectClassInput with Edit feature
 * Props:
 *  - dispatch
 *  - teacher
 *  - currentIndex
 *  - totalTeachers
 *  - minYear (default 1) / maxYear (default 12)
 */
export default function SubjectClassInput({
  dispatch,
  teacher = { name: "Unknown", subjects: [] },
  currentIndex = 0,
  totalTeachers = 1,
  minYear = 1,
  maxYear = 12,
}) {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const subjectRef = useRef(null);

  // Edit state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editSubject, setEditSubject] = useState("");
  const [editYear, setEditYear] = useState("");
  const editRef = useRef(null);

  useEffect(() => {
    // autofocus new subject field when teacher changes
    setTimeout(() => subjectRef.current?.focus(), 40);
    // reset edit state when teacher changes
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

  function handleAddSubjects(e) {
    e?.preventDefault();
    setError("");

    const trimmedSubject = (subject || "").trim();
    const trimmedYear = (year || "").trim();

    if (!trimmedSubject) {
      setError("Please enter a subject.");
      subjectRef.current?.focus();
      return;
    }
    if (!trimmedYear) {
      setError(`Please enter a year (${minYear}-${maxYear}).`);
      return;
    }

    const num = Number(trimmedYear);
    if (!Number.isInteger(num) || num < minYear || num > maxYear) {
      setError(`Year must be an integer between ${minYear} and ${maxYear}.`);
      return;
    }

    dispatch({
      type: "ADD_SUBJECT_CLASS",
      payload: { subject: trimmedSubject, class: `Year ${num}` },
    });

    setSubject("");
    setYear("");
    setTimeout(() => subjectRef.current?.focus(), 40);
  }

  function handleRemoveSubject(index) {
    dispatch({
      type: "REMOVE_SUBJECT",
      payload: { teacherIndex: currentIndex, subjectIndex: index },
    });
    // if removing the item being edited, cancel edit
    if (index === editingIndex) cancelEdit();
  }

  function handleBack() {
    dispatch({ type: "PREV_TEACHER" });
  }

  function handleSkipOrNext() {
    dispatch({ type: "NEXT_TEACHER" });
  }

  // Edit handlers
  function startEdit(index) {
    const s = teacher?.subjects?.[index];
    if (!s) return;
    setEditingIndex(index);
    setEditSubject(s.subject ?? "");
    // parse year number from "Year X"
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
    const trimmedSub = (editSubject || "").trim();
    const trimmedYear = (editYear || "").trim();
    if (!trimmedSub) {
      setError("Subject cannot be empty.");
      editRef.current?.focus();
      return;
    }
    if (!trimmedYear) {
      setError(`Please enter a year (${minYear}-${maxYear}).`);
      return;
    }
    const num = Number(trimmedYear);
    if (!Number.isInteger(num) || num < minYear || num > maxYear) {
      setError(`Year must be an integer between ${minYear} and ${maxYear}.`);
      return;
    }

    dispatch({
      type: "EDIT_SUBJECT",
      payload: {
        teacherIndex: currentIndex,
        subjectIndex: index,
        subject: trimmedSub,
        class: `Year ${num}`,
      },
    });
    cancelEdit();
  }

  const subjects = Array.isArray(teacher?.subjects) ? teacher.subjects : [];

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
                — ({Math.min(currentIndex + 1, totalTeachers)} of{" "}
                {Math.max(totalTeachers, 1)})
              </span>
            </h2>
            <p className="mt-1 text-sm text-[#555]">
              Add a subject and pick the Year (e.g. Maths — Year 3). Use Enter
              to add.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 backdrop-blur-sm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14"
                  stroke="#333"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 6l6 6-6 6"
                  stroke="#333"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-[#333]">Skip</span>
            </button>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={handleAddSubjects} className="flex gap-2 items-stretch">
          <input
            ref={subjectRef}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Maths)"
            aria-label="Subject"
            className="flex-1 px-3 py-2 rounded-lg shadow-inner outline-none"
          />

          <div className="flex items-center gap-2">
            <label
              htmlFor="yearInput"
              className="text-sm text-[#444] font-medium"
            >
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add
          </button>
        </form>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {/* Subjects list with edit inline */}
        <div>
          <AnimatePresence>
            {subjects.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-[#666]">
                  No subjects yet for this teacher.
                </p>
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
                          <div className="font-medium text-[#222]">
                            {s.subject}
                          </div>
                          <div className="text-sm text-[#666]">{s.class}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(idx)}
                            aria-label={`Edit ${s.subject}`}
                            className="p-2 rounded-md bg-blue-50"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M3 21v-3.6L14.3 5.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4L6.6 20.6H3z"
                                stroke="#0c4a6e"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M14.7 4.3l4 4"
                                stroke="#0c4a6e"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            aria-label={`Remove ${s.subject}`}
                            className="p-2 rounded-md bg-red-50"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
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
                      /* Inline edit row */
                      <>
                        <div className="flex-1 flex gap-2 items-stretch">
                          <input
                            ref={editRef}
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg shadow-inner outline-none"
                          />
                          <input
                            value={editYear}
                            onChange={(e) =>
                              setEditYear(clampYear(e.target.value))
                            }
                            className="w-24 px-3 py-2 rounded-lg shadow-inner outline-none text-center"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            className="px-3 py-1 rounded-md bg-green-500 text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-3 py-1 rounded-md bg-gray-200"
                          >
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
