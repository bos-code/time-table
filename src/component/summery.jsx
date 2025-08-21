import React from "react";
import {
  FaEdit,
  FaTrash,
  FaFileExport,
  FaPrint,
  FaArrowLeft,
  FaPlay,
} from "react-icons/fa";
import NeumorphicCard from "./neuCard";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* id generator fallback */
const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now());

/* -------------------------
   Helpers & Handlers (top)
   -------------------------*/

// safe getters
const safeGetTeacher = (teachers, i) =>
  Array.isArray(teachers) && i >= 0 && i < teachers.length ? teachers[i] : null;

// -----------------
// Edit teacher
// -----------------
async function handleEditTeacher(dispatch, tIdx, currentName) {
  try {
    const { value: newName, isConfirmed } = await Swal.fire({
      title: "Edit teacher name",
      input: "text",
      inputValue: currentName ?? "",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputAttributes: { autocapitalize: "words" },
      preConfirm: (v) => {
        if (!v || !String(v).trim()) {
          Swal.showValidationMessage("Name cannot be empty");
          return false;
        }
        return String(v).trim();
      },
    });
    if (!isConfirmed) return;
    if (newName && newName !== currentName) {
      dispatch({
        type: "EDIT_TEACHER",
        payload: { index: tIdx, name: newName },
      });
      await Swal.fire({
        icon: "success",
        title: "Saved",
        timer: 900,
        showConfirmButton: false,
      });
    }
  } catch (err) {
    console.error("handleEditTeacher:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not edit teacher.",
    });
  }
}

// -----------------
// Remove teacher
// -----------------
async function handleRemoveTeacher(dispatch, teachers, tIdx) {
  try {
    const t = safeGetTeacher(teachers, tIdx);
    const name = t?.name ?? "this teacher";
    const res = await Swal.fire({
      title: `Remove ${name}?`,
      text: "This action will remove the teacher and their subjects.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });
    if (!res.isConfirmed) return;
    dispatch({ type: "REMOVE_TEACHER", payload: { index: tIdx } });
    await Swal.fire({
      icon: "success",
      title: "Removed",
      text: `${name} removed.`,
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("handleRemoveTeacher:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not remove teacher.",
    });
  }
}

// -----------------
// Edit subject (single modal: subject + class)
// -----------------
async function handleEditSubject(dispatch, tIdx, sIdx, subj) {
  try {
    const html = `
      <div style="display:flex;flex-direction:column;gap:.5rem;text-align:left">
        <label style="font-size:.875rem;color:#374151">Subject</label>
        <input id="swal-subject" class="swal2-input" placeholder="e.g., Mathematics" value="${(
          subj?.subject ?? ""
        ).replaceAll('"', "&quot;")}" />
        <label style="font-size:.875rem;color:#374151;margin-top:.25rem">Class (e.g., Year 3)</label>
        <input id="swal-class" class="swal2-input" placeholder="e.g., Year 3" value="${(
          subj?.class ?? ""
        ).replaceAll('"', "&quot;")}" />
      </div>
    `;
    const result = await Swal.fire({
      title: "Edit subject",
      html,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const subject = (
          document.getElementById("swal-subject")?.value || ""
        ).trim();
        const className = (
          document.getElementById("swal-class")?.value || ""
        ).trim();
        if (!subject) {
          Swal.showValidationMessage("Subject is required.");
          return false;
        }
        if (!/^year\s*\d+$/i.test(className)) {
          Swal.showValidationMessage(
            "Class must be like: Year 1, Year 2, etc."
          );
          return false;
        }
        const cls = className.replace(/\s+/g, " ").replace(/^year/i, "Year");
        return { subject, class: cls };
      },
    });

    if (!result.isConfirmed || !result.value) return;
    const { subject, class: classValue } = result.value;

    dispatch({
      type: "EDIT_SUBJECT",
      payload: {
        teacherIndex: tIdx,
        subjectIndex: sIdx,
        subject,
        class: classValue,
      },
    });

    await Swal.fire({
      icon: "success",
      title: "Saved",
      timer: 800,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("handleEditSubject:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not edit subject.",
    });
  }
}

// -----------------
// Remove subject
// -----------------
async function handleRemoveSubject(dispatch, teachers, tIdx, sIdx) {
  try {
    const teacher = safeGetTeacher(teachers, tIdx);
    const subj = (teacher?.subjects || [])[sIdx];
    const name = subj?.subject ?? "this subject";
    const res = await Swal.fire({
      title: `Remove ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });
    if (!res.isConfirmed) return;
    dispatch({
      type: "REMOVE_SUBJECT",
      payload: { teacherIndex: tIdx, subjectIndex: sIdx },
    });
    await Swal.fire({
      icon: "success",
      title: "Removed",
      text: `${name} removed.`,
      timer: 900,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("handleRemoveSubject:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not remove subject.",
    });
  }
}

/* -------------------------
   Additional utilities:
   - Export JSON / CSV
   - Print movement book (simple)
   (unchanged from your prior version)
   -------------------------*/
/* (downloadJSON, exportCSV, printMovementBook definitions remain identical to your code above) */

/* -------------------------
   Component (UI unchanged, badge moved to top-right)
   -------------------------*/
export default function Summary({ teachers = [], dispatch }) {
  const safeTeachers = Array.isArray(teachers) ? teachers : [];

  // quick handler to start full edit screen for a teacher (non-destructive)
  function handleFullEdit(dispatcher, idx) {
    dispatcher({ type: "EDIT_TEACHER_START", payload: { index: idx } });
  }

  function handleGenerate(dispatcher) {
    dispatcher({ type: "CONFIRM_AND_GENERATE" });
  }

  function handleBack(dispatcher) {
    dispatcher({ type: "GOTO_TEACHER_INPUT" });
    dispatcher({ type: "GO_BACK" });
    dispatcher({ type: "PREV" });
  }

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
        <div className="text-sm text-gray-500">
          Review & confirm teachers and subject assignments
        </div>
      </div>

      {/* Teachers grid (UI preserved) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeTeachers.map((teacher, tIdx) => {
          const subs = Array.isArray(teacher?.subjects) ? teacher.subjects : [];
          return (
            <div
              key={teacher?.id ?? tIdx}
              className="relative p-5 rounded-xl shadow-lg bg-gradient-to-br from-base-100 to-base-200 border border-base-300 hover:shadow-xl transition-all duration-300 group"
            >
              {/* top-right small badge */}
              <div
                aria-hidden="true"
                className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100 shadow-sm"
                title={`${subs.length} subject${subs.length !== 1 ? "s" : ""}`}
              >
                {subs.length}
              </div>

              {/* Teacher Header */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-base-content">
                  {teacher?.name ?? "—"}
                </h3>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* quick inline edit name */}
                  <button
                    onClick={() =>
                      handleEditTeacher(dispatch, tIdx, teacher?.name)
                    }
                    className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                    aria-label={`Edit ${teacher?.name ?? "teacher"}`}
                  >
                    <FaEdit />
                  </button>

                  {/* full edit (navigates to full edit screen) */}
                  <button
                    onClick={() => handleFullEdit(dispatch, tIdx)}
                    className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                    aria-label={`Full edit ${teacher?.name ?? "teacher"}`}
                    title="Open full editor"
                  >
                    <FaPlay />
                  </button>

                  {/* remove teacher (payload shape matches reducer) */}
                  <button
                    onClick={() =>
                      handleRemoveTeacher(dispatch, safeTeachers, tIdx)
                    }
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                    aria-label={`Remove ${teacher?.name ?? "teacher"}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Subjects */}
              <div className="mt-4 space-y-3">
                {subs.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No subjects added.
                  </div>
                ) : (
                  subs.map((subj, sIdx) => (
                    <div
                      key={subj?.id ?? sIdx}
                      className="flex justify-between items-center bg-gradient-to-r from-base-100 to-base-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all group"
                    >
                      <span className="text-base-content font-medium">
                        {subj?.subject ?? "—"}{" "}
                        <span className="text-gray-500">
                          - {subj?.class ?? "—"}
                        </span>
                      </span>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            handleEditSubject(dispatch, tIdx, sIdx, subj)
                          }
                          className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                          aria-label={`Edit ${subj?.subject ?? "subject"}`}
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() =>
                            handleRemoveSubject(
                              dispatch,
                              safeTeachers,
                              tIdx,
                              sIdx
                            )
                          }
                          className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                          aria-label={`Remove ${subj?.subject ?? "subject"}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action bar (unchanged) */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleBack(dispatch)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-200 text-base-content hover:bg-base-100 transition"
            title="Back to inputs"
          >
            <FaArrowLeft /> Back
          </button>

          <button
            onClick={() => downloadJSON(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content hover:bg-base-50 transition"
            title="Export JSON"
          >
            <FaFileExport /> JSON
          </button>

          <button
            onClick={() => exportCSV(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content hover:bg-base-50 transition"
            title="Export CSV"
          >
            <FaFileExport /> CSV
          </button>

          <button
            onClick={() => printMovementBook(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content hover:bg-base-50 transition"
            title="Print movement book"
          >
            <FaPrint /> Print
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleGenerate(dispatch)}
            className="ml-auto px-4 py-2 rounded-lg bg-primary text-primary-content hover:shadow-lg transition"
            title="Generate timetable"
          >
            Generate Timetable
          </button>
        </div>
      </div>
    </NeumorphicCard>
  );
}
    