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

/* -------------------------
   Helpers
   -------------------------*/
const safeGetTeacher = (teachers, i) =>
  Array.isArray(teachers) && i >= 0 && i < teachers.length ? teachers[i] : null;

/* -------------------------
   Generic IconButton (removes repetition)
   -------------------------*/
const IconButton = ({ onClick, icon: Icon, className = "", label, title }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition ${className}`}
    aria-label={label}
    title={title || label}
  >
    <Icon />
  </button>
);

/* -------------------------
   Teacher & Subject Handlers
   -------------------------*/
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
    if (isConfirmed && newName !== currentName) {
      dispatch({
        type: "EDIT_TEACHER",
        payload: { index: tIdx, name: newName },
      });
      Swal.fire({
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
    });
    if (res.isConfirmed) {
      dispatch({ type: "REMOVE_TEACHER", payload: { index: tIdx } });
      Swal.fire({
        icon: "success",
        title: "Removed",
        text: `${name} removed.`,
        timer: 1000,
        showConfirmButton: false,
      });
    }
  } catch (err) {
    console.error("handleRemoveTeacher:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not remove teacher.",
    });
  }
}

async function handleEditSubject(dispatch, tIdx, sIdx, subj) {
  try {
    const html = `
      <div style="display:flex;flex-direction:column;gap:.5rem;text-align:left">
        <label>Subject</label>
        <input id="swal-subject" class="swal2-input" placeholder="e.g., Mathematics" value="${
          subj?.subject ?? ""
        }" />
        <label>Class (e.g., Year 3)</label>
        <input id="swal-class" class="swal2-input" placeholder="e.g., Year 3" value="${
          subj?.class ?? ""
        }" />
      </div>
    `;
    const result = await Swal.fire({
      title: "Edit subject",
      html,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        const subject = document.getElementById("swal-subject")?.value.trim();
        const className = document.getElementById("swal-class")?.value.trim();
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
        return {
          subject,
          class: className.replace(/\s+/g, " ").replace(/^year/i, "Year"),
        };
      },
    });
    if (result.isConfirmed) {
      dispatch({
        type: "EDIT_SUBJECT",
        payload: { teacherIndex: tIdx, subjectIndex: sIdx, ...result.value },
      });
      Swal.fire({
        icon: "success",
        title: "Saved",
        timer: 800,
        showConfirmButton: false,
      });
    }
  } catch (err) {
    console.error("handleEditSubject:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not edit subject.",
    });
  }
}

async function handleRemoveSubject(dispatch, teachers, tIdx, sIdx) {
  try {
    const subj = teachers?.[tIdx]?.subjects?.[sIdx];
    const name = subj?.subject ?? "this subject";
    const res = await Swal.fire({
      title: `Remove ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
    });
    if (res.isConfirmed) {
      dispatch({
        type: "REMOVE_SUBJECT",
        payload: { teacherIndex: tIdx, subjectIndex: sIdx },
      });
      Swal.fire({
        icon: "success",
        title: "Removed",
        text: `${name} removed.`,
        timer: 900,
        showConfirmButton: false,
      });
    }
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
   Export & Print Utilities
   -------------------------*/
function downloadJSON(teachers) {
  const blob = new Blob([JSON.stringify({ teachers }, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.json";
  link.click();
  Swal.fire("Exported", "JSON file downloaded!", "success");
}

function exportCSV(teachers) {
  const rows = [["Teacher", "Subject", "Class"]];
  teachers.forEach((t) =>
    (t.subjects || []).forEach((s) =>
      rows.push([t.name, s.subject || "", s.class || ""])
    )
  );
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.csv";
  link.click();
  Swal.fire("Exported", "CSV file downloaded!", "success");
}

function printMovementBook(teachers) {
  const win = window.open("", "_blank");
  win.document.write("<h1>Movement Book</h1>");
  teachers.forEach((t) => {
    win.document.write(`<h2>Teacher: ${t.name}</h2>`);
    (t.subjects || []).forEach((s) => {
      win.document.write(`<p>${s.subject} - ${s.class}</p>`);
    });
  });
  win.print();
  Swal.fire("Printed", "Movement book sent to printer!", "success");
}

/* -------------------------
   Main Component
   -------------------------*/
export default function Summary({ teachers = [], dispatch }) {
  const safeTeachers = Array.isArray(teachers) ? teachers : [];

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
        <div className="text-sm text-gray-500">
          Review & confirm teachers and subject assignments
        </div>
      </div>

      {/* Teachers grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeTeachers.map((teacher, tIdx) => {
          const subs = teacher?.subjects || [];
          return (
            <div
              key={teacher?.id ?? tIdx}
              className="relative p-5 rounded-xl shadow-lg bg-gradient-to-br from-base-100 to-base-200 border border-base-300 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Badge */}
              <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {subs.length}
              </div>

              {/* Teacher header */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  {teacher?.name ?? "—"}
                </h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    onClick={() =>
                      handleEditTeacher(dispatch, tIdx, teacher?.name)
                    }
                    icon={FaEdit}
                    className="bg-blue-50 text-blue-500 hover:bg-blue-100"
                    label={`Edit ${teacher?.name}`}
                  />
                  <IconButton
                    onClick={() =>
                      dispatch({
                        type: "EDIT_TEACHER_START",
                        payload: { index: tIdx },
                      })
                    }
                    icon={FaPlay}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    label={`Full edit ${teacher?.name}`}
                  />
                  <IconButton
                    onClick={() =>
                      handleRemoveTeacher(dispatch, safeTeachers, tIdx)
                    }
                    icon={FaTrash}
                    className="bg-red-50 text-red-500 hover:bg-red-100"
                    label={`Remove ${teacher?.name}`}
                  />
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
                      className="flex justify-between items-center px-4 py-2 rounded-lg shadow-sm bg-gradient-to-r from-base-100 to-base-200 group hover:shadow-md transition-all"
                    >
                      <span>
                        {subj?.subject ?? "—"}{" "}
                        <span className="text-gray-500">
                          - {subj?.class ?? "—"}
                        </span>
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                          onClick={() =>
                            handleEditSubject(dispatch, tIdx, sIdx, subj)
                          }
                          icon={FaEdit}
                          className="bg-blue-50 text-blue-500 hover:bg-blue-100"
                          label={`Edit ${subj?.subject}`}
                        />
                        <IconButton
                          onClick={() =>
                            handleRemoveSubject(
                              dispatch,
                              safeTeachers,
                              tIdx,
                              sIdx
                            )
                          }
                          icon={FaTrash}
                          className="bg-red-50 text-red-500 hover:bg-red-100"
                          label={`Remove ${subj?.subject}`}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              dispatch({ type: "GOTO_TEACHER_INPUT" });
              dispatch({ type: "GO_BACK" });
              dispatch({ type: "PREV" });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-200 hover:bg-base-100"
          >
            <FaArrowLeft /> Back
          </button>
          <button
            onClick={() => downloadJSON(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 hover:bg-base-50"
          >
            <FaFileExport /> JSON
          </button>
          <button
            onClick={() => exportCSV(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 hover:bg-base-50"
          >
            <FaFileExport /> CSV
          </button>
          <button
            onClick={() => printMovementBook(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 hover:bg-base-50"
          >
            <FaPrint /> Print
          </button>
        </div>
        <button
          onClick={() => dispatch({ type: "CONFIRM_AND_GENERATE" })}
          className="ml-auto px-4 py-2 rounded-lg bg-primary text-primary-content hover:shadow-lg"
        >
          Generate Timetable
        </button>
      </div>
    </NeumorphicCard>
  );
}
