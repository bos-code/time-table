import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import NeumorphicCard from "./neuCard";

const MAX_LESSONS_PER_WEEK = 15;

function formatClassName(prefix, year) {
  const rawPrefix = String(prefix || "Year ");
  const separator = /\s$|[-/]$/.test(rawPrefix) ? "" : " ";
  return `${rawPrefix}${separator}${year}`.trim();
}

export default function SubjectClassInput({
  dispatch,
  teacher = { name: "Unknown", subjects: [] },
  currentIndex = 0,
  totalTeachers = 1,
  minYear = 1,
  maxYear = 12,
  classPrefix = "Year ",
  allowedSubjects,
  allSubjects,
  validateSubjectYear,
  subjectYearMap,
  allowAcronymHeuristic = true,
  normalizeSubject,
}) {
  const subjectOptions = useMemo(() => {
    const source =
      Array.isArray(allowedSubjects) && allowedSubjects.length
        ? allowedSubjects
        : Array.isArray(allSubjects)
        ? allSubjects
        : [];

    return Array.from(
      new Set(source.map((value) => (value || "").trim()).filter(Boolean))
    );
  }, [allowedSubjects, allSubjects]);

  const isAcronym = (value) => !!value && /^[A-Z]{2,8}$/.test(value.trim());

  const defaultNormalize = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "";
    }
    if (isAcronym(trimmed)) {
      return trimmed;
    }
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const norm = normalizeSubject || defaultNormalize;

  const ciEq = (left, right) =>
    (left || "").trim().toLowerCase() === (right || "").trim().toLowerCase();

  const canonicalFromOptions = (value) => {
    const trimmed = (value || "").trim().toLowerCase();
    return subjectOptions.find((option) => option.toLowerCase() === trimmed) || null;
  };

  const inAllowed = (value) => {
    if (!subjectOptions.length) {
      return true;
    }

    if (canonicalFromOptions(value)) {
      return true;
    }

    return allowAcronymHeuristic && isAcronym(value);
  };

  const yearAllowedByMap = (subjectText, yearValue) => {
    if (!subjectYearMap) {
      return true;
    }

    const key = Object.keys(subjectYearMap).find((entry) => ciEq(entry, subjectText));
    if (!key) {
      return true;
    }

    const rule = subjectYearMap[key];
    if (Array.isArray(rule)) {
      return rule.includes(yearValue);
    }
    if (rule && typeof rule === "object") {
      const { min, max } = rule;
      if (typeof min === "number" && yearValue < min) {
        return false;
      }
      if (typeof max === "number" && yearValue > max) {
        return false;
      }
    }
    return true;
  };

  const subjectYearCustomCheck = (subjectText, yearValue) => {
    if (typeof validateSubjectYear !== "function") {
      return null;
    }

    return validateSubjectYear(subjectText, yearValue, {
      teacher,
      currentIndex,
      allTeacherSubjects: Array.isArray(teacher?.subjects) ? teacher.subjects : [],
    });
  };

  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [lessonsPerWeek, setLessonsPerWeek] = useState("3");
  const [error, setError] = useState("");
  const subjectInputRef = useRef(null);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [editSubject, setEditSubject] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editLessonsPerWeek, setEditLessonsPerWeek] = useState("3");
  const editRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const input =
        subjectInputRef.current?.querySelector("input") || subjectInputRef.current;
      input?.focus?.();
    }, 40);
    setEditingIndex(-1);
  }, [teacher?.name, currentIndex]);

  const clampYear = (value) => {
    const parsed = Number(value);
    if (value === "") {
      return "";
    }
    if (Number.isNaN(parsed)) {
      return "";
    }
    if (parsed < minYear) {
      return String(minYear);
    }
    if (parsed > maxYear) {
      return String(maxYear);
    }
    return String(Math.floor(parsed));
  };

  const clampLessons = (value) => {
    const parsed = Number(value);
    if (value === "") {
      return "";
    }
    if (Number.isNaN(parsed)) {
      return "";
    }
    if (parsed < 1) {
      return "1";
    }
    if (parsed > MAX_LESSONS_PER_WEEK) {
      return String(MAX_LESSONS_PER_WEEK);
    }
    return String(Math.floor(parsed));
  };

  const subjects = Array.isArray(teacher?.subjects) ? teacher.subjects : [];

  const validatePair = (
    rawSubject,
    rawYear,
    rawLessons,
    { editing = false, excludeIndex = -1 } = {}
  ) => {
    const trimmedSubject = (rawSubject || "").trim();
    const trimmedYear = (rawYear || "").trim();
    const trimmedLessons = (rawLessons || "").trim();

    if (!trimmedSubject) {
      return "Please enter a subject.";
    }
    if (!inAllowed(trimmedSubject)) {
      return `"${trimmedSubject}" is not in the allowed subject list.`;
    }

    if (!trimmedYear) {
      return `Please enter a class year between ${minYear} and ${maxYear}.`;
    }

    const yearValue = Number(trimmedYear);
    if (!Number.isInteger(yearValue) || yearValue < minYear || yearValue > maxYear) {
      return `Year must be a whole number between ${minYear} and ${maxYear}.`;
    }

    if (!trimmedLessons) {
      return "Please enter lessons per week.";
    }

    const lessonsValue = Number(trimmedLessons);
    if (
      !Number.isInteger(lessonsValue) ||
      lessonsValue < 1 ||
      lessonsValue > MAX_LESSONS_PER_WEEK
    ) {
      return `Lessons per week must be between 1 and ${MAX_LESSONS_PER_WEEK}.`;
    }

    const displaySubject = norm(trimmedSubject);
    if (!yearAllowedByMap(displaySubject, yearValue)) {
      return `${displaySubject} is not offered for that year.`;
    }

    const customMessage = subjectYearCustomCheck(displaySubject, yearValue);
    if (typeof customMessage === "string" && customMessage.trim()) {
      return customMessage.trim();
    }

    const className = formatClassName(classPrefix, yearValue);
    const duplicate = subjects.some((entry, index) => {
      if (editing && index === excludeIndex) {
        return false;
      }
      return ciEq(entry.subject, displaySubject) && ciEq(entry.class, className);
    });

    if (duplicate) {
      return `Duplicate assignment: ${displaySubject} already exists for ${className}.`;
    }

    return null;
  };

  function handleAddSubjects(event) {
    event?.preventDefault();
    setError("");

    const message = validatePair(subject, year, lessonsPerWeek);
    if (message) {
      setError(message);
      return;
    }

    const yearValue = Number(year.trim());
    dispatch({
      type: "ADD_SUBJECT_CLASS",
      payload: {
        subject: norm(subject),
        class: formatClassName(classPrefix, yearValue),
        lessonsPerWeek: Number(lessonsPerWeek.trim()),
      },
    });

    setSubject("");
    setYear("");
    setLessonsPerWeek("3");
    setTimeout(() => {
      const input =
        subjectInputRef.current?.querySelector("input") || subjectInputRef.current;
      input?.focus?.();
    }, 40);
  }

  function handleRemoveSubject(index) {
    dispatch({
      type: "REMOVE_SUBJECT",
      payload: { teacherIndex: currentIndex, subjectIndex: index },
    });

    if (index === editingIndex) {
      cancelEdit();
    }
  }

  function startEdit(index) {
    const entry = teacher?.subjects?.[index];
    if (!entry) {
      return;
    }

    setEditingIndex(index);
    setEditSubject(entry.subject ?? "");
    const yearMatch = (entry.class || "").match(/(\d+)/);
    setEditYear(yearMatch ? yearMatch[1] : "");
    setEditLessonsPerWeek(String(entry.lessonsPerWeek ?? 3));
    setTimeout(() => editRef.current?.focus(), 50);
    setError("");
  }

  function cancelEdit() {
    setEditingIndex(-1);
    setEditSubject("");
    setEditYear("");
    setEditLessonsPerWeek("3");
    setError("");
  }

  function saveEdit(index) {
    setError("");

    const message = validatePair(editSubject, editYear, editLessonsPerWeek, {
      editing: true,
      excludeIndex: index,
    });
    if (message) {
      setError(message);
      return;
    }

    const yearValue = Number(editYear.trim());
    dispatch({
      type: "EDIT_SUBJECT",
      payload: {
        teacherIndex: currentIndex,
        subjectIndex: index,
        subject: norm(editSubject),
        class: formatClassName(classPrefix, yearValue),
        lessonsPerWeek: Number(editLessonsPerWeek.trim()),
      },
    });
    cancelEdit();
  }

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #ff4c60 0%, #ff8aa1 40%, #a18cd1 100%)",
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
              Add Subjects for {teacher?.name ?? "Unknown"}
              <span className="text-sm font-medium text-[#666] ml-2">
                ({Math.min(currentIndex + 1, totalTeachers)} of {Math.max(totalTeachers, 1)})
              </span>
            </h2>
            <p className="mt-1 text-sm text-[#555]">
              Add each teacher-class assignment with the number of lessons it should
              appear every week.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "PREV_TEACHER" })}
              aria-label="Go back"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/40 backdrop-blur-sm"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: "NEXT_TEACHER" })}
              aria-label="Skip or next"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100"
            >
              Skip
            </button>
          </div>
        </div>

        <form onSubmit={handleAddSubjects} className="grid gap-3 lg:grid-cols-[2fr,120px,140px,auto]">
          <div className="relative" ref={subjectInputRef}>
            <Autocomplete
              freeSolo
              options={subjectOptions}
              inputValue={subject}
              onInputChange={(_, newInput) => {
                setSubject(newInput ?? "");
                setError("");
              }}
              onChange={(_, newValue) => {
                if (typeof newValue === "string") {
                  setSubject(newValue);
                } else if (newValue) {
                  setSubject(String(newValue));
                } else {
                  setSubject("");
                }
              }}
              autoHighlight
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Subject"
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

          <label className="flex flex-col gap-1 text-sm text-[#444]">
            <span>Year</span>
            <input
              type="number"
              inputMode="numeric"
              min={minYear}
              max={maxYear}
              value={year}
              onChange={(event) => setYear(clampYear(event.target.value))}
              className="px-3 py-3 rounded-lg shadow-inner outline-none text-center"
              aria-label="Year number"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#444]">
            <span>Lessons / week</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_LESSONS_PER_WEEK}
              value={lessonsPerWeek}
              onChange={(event) => setLessonsPerWeek(clampLessons(event.target.value))}
              className="px-3 py-3 rounded-lg shadow-inner outline-none text-center"
              aria-label="Lessons per week"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg"
            aria-label="Add subject"
          >
            Add
          </button>
        </form>

        <div className="text-xs text-[#666]">
          Classes will be saved as {formatClassName(classPrefix, minYear)} to{" "}
          {formatClassName(classPrefix, maxYear)}.
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

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
                  No subject assignments yet for this teacher.
                </p>
              </motion.div>
            ) : (
              subjects.map((entry, index) => {
                const isEditing = index === editingIndex;
                return (
                  <motion.div
                    key={`${entry.subject}-${entry.class}-${index}`}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-between gap-3 px-3 py-3 mb-2 rounded-lg bg-white/30"
                  >
                    {!isEditing ? (
                      <>
                        <div>
                          <div className="font-medium text-[#222]">{entry.subject}</div>
                          <div className="text-sm text-[#666]">
                            {entry.class} · {entry.lessonsPerWeek} lesson
                            {entry.lessonsPerWeek === 1 ? "" : "s"} per week
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(index)}
                            aria-label={`Edit ${entry.subject}`}
                            className="p-2 rounded-md bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(index)}
                            aria-label={`Remove ${entry.subject}`}
                            className="p-2 rounded-md bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 grid gap-2 lg:grid-cols-[2fr,110px,130px]">
                          <input
                            ref={editRef}
                            value={editSubject}
                            onChange={(event) => setEditSubject(event.target.value)}
                            className="px-3 py-2 rounded-lg shadow-inner outline-none"
                            aria-label="Edit subject"
                          />
                          <input
                            value={editYear}
                            onChange={(event) => setEditYear(clampYear(event.target.value))}
                            className="px-3 py-2 rounded-lg shadow-inner outline-none text-center"
                            aria-label="Edit year"
                          />
                          <input
                            value={editLessonsPerWeek}
                            onChange={(event) =>
                              setEditLessonsPerWeek(clampLessons(event.target.value))
                            }
                            className="px-3 py-2 rounded-lg shadow-inner outline-none text-center"
                            aria-label="Edit lessons per week"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(index)}
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
            onClick={() => dispatch({ type: "NEXT_TEACHER" })}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
            aria-label="Next teacher"
          >
            {currentIndex + 1 >= totalTeachers ? "Finish Assignments" : "Next Teacher"}
          </button>
        </div>
      </div>
    </NeumorphicCard>
  );
}
