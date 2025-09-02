// src/component/summery.jsx
import React, { useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "sweetalert2/dist/sweetalert2.min.css";



 const demoTeachers = [
  {
    id: 1,
    name: "Mr. Johnson",
    periods: 20,
    subjects: [
      { id: 1, subject: "Mathematics", class: "Year 7" },
      { id: 2, subject: "Mathematics", class: "Year 8" },
      { id: 3, subject: "Statistics", class: "Year 9" },
    ],
  },
  {
    id: 2,
    name: "Ms. Carter",
    periods: 18,
    subjects: [
      { id: 1, subject: "English Literature", class: "Year 7" },
      { id: 2, subject: "English Language", class: "Year 9" },
    ],
  },
  {
    id: 3,
    name: "Mr. Alvarez",
    periods: 22,
    subjects: [
      { id: 1, subject: "Physics", class: "Year 8" },
      { id: 2, subject: "Chemistry", class: "Year 10" },
      { id: 3, subject: "General Science", class: "Year 7" },
    ],
  },
  {
    id: 4,
    name: "Mrs. Okafor",
    periods: 15,
    subjects: [
      { id: 1, subject: "Biology", class: "Year 9" },
      { id: 2, subject: "Biology", class: "Year 11" },
    ],
  },
  {
    id: 5,
    name: "Mr. Patel",
    periods: 19,
    subjects: [
      { id: 1, subject: "Geography", class: "Year 7" },
      { id: 2, subject: "Geography", class: "Year 10" },
    ],
  },
  {
    id: 6,
    name: "Ms. Smith",
    periods: 21,
    subjects: [
      { id: 1, subject: "History", class: "Year 8" },
      { id: 2, subject: "History", class: "Year 11" },
    ],
  },
  {
    id: 7,
    name: "Mr. Lee",
    periods: 20,
    subjects: [
      { id: 1, subject: "Computer Science", class: "Year 9" },
      { id: 2, subject: "ICT", class: "Year 10" },
    ],
  },
  {
    id: 8,
    name: "Mrs. Adams",
    periods: 17,
    subjects: [
      { id: 1, subject: "French", class: "Year 7" },
      { id: 2, subject: "French", class: "Year 8" },
    ],
  },
  {
    id: 9,
    name: "Mr. Mensah",
    periods: 16,
    subjects: [
      { id: 1, subject: "Religious Studies", class: "CRS" },
      { id: 2, subject: "Religious Studies", class: "Year 11" },
    ],
  },
  {
    id: 10,
    name: "Ms. Brown",
    periods: 20,
    subjects: [
      { id: 1, subject: "Business Studies", class: "BST" },
      { id: 2, subject: "Economics", class: "Year 10" },
    ],
  },
  {
    id: 11,
    name: "Mr. Ibrahim",
    periods: 14,
    subjects: [
      { id: 1, subject: "Social Studies", class: "SOS" },
      { id: 2, subject: "Social Studies", class: "Year 8" },
    ],
  },
  {
    id: 12,
    name: "Mrs. Green",
    periods: 18,
    subjects: [
      { id: 1, subject: "Music", class: "CCA" },
      { id: 2, subject: "Drama", class: "Year 7" },
    ],
  },
  {
    id: 13,
    name: "Mr. White",
    periods: 20,
    subjects: [
      { id: 1, subject: "Physical Education", class: "Year 7" },
      { id: 2, subject: "Physical Education", class: "Year 9" },
    ],
  },
];


/* -------------------------
   Helpers
   -------------------------*/
const safeGetTeacher = (teachers, i) =>
  Array.isArray(teachers) && i >= 0 && i < teachers.length ? teachers[i] : null;

const notifySuccess = (msg, title = "Success") =>
  Swal.fire({
    icon: "success",
    title,
    text: msg,
    timer: 1000,
    showConfirmButton: false,
  });

const notifyError = (msg, title = "Error") => {
  console.error(title, msg);
  Swal.fire({ icon: "error", title, text: msg });
};

/* -------------------------
   Validation
   -------------------------*/
const classPattern = /^(year\s*\d+|CCA|SOS|CRS|BST)$/i;

function validateSubjectAndClass(subject, className) {
  if (!subject || !subject.trim()) {
    throw new Error("Subject name cannot be empty.");
  }
  if (!classPattern.test(className)) {
    throw new Error(
      "Class must be like: Year 7, Year 8, or valid acronyms (CCA, SOS, CRS, BST)."
    );
  }
  return {
    subject: subject.trim(),
    class: className.trim().replace(/\s+/g, " ").replace(/^year/i, "Year"),
  };
}

/* -------------------------
   Generic IconButton (DRY)
   -------------------------*/
const IconButton = ({
  onClick,
  icon: Icon,
  className = "",
  label = "",
  title = "",
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition ${className}`}
    aria-label={label}
    title={title || label}
    type="button"
  >
    <Icon />
  </button>
);

/* -------------------------
   Teacher & Subject Handlers
   -------------------------*/
async function handleEditTeacher(dispatch, tIdx, currentName) {
  try {
    const result = await Swal.fire({
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
          throw new Error("Teacher name cannot be empty.");
        }
        return String(v).trim();
      },
    });

    if (result.isConfirmed) {
      const newName = result.value;
      if (newName && newName !== currentName) {
        dispatch({
          type: "EDIT_TEACHER",
          payload: { index: tIdx, name: newName },
        });
        notifySuccess("Teacher name updated.");
      }
    }
  } catch (err) {
    notifyError("Could not edit teacher.");
    throw err;
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
      notifySuccess(`${name} removed.`);
    }
  } catch (err) {
    notifyError("Could not remove teacher.");
    throw err;
  }
}

async function handleEditSubject(dispatch, tIdx, sIdx, subj) {
  try {
    const html = `
      <div style="display:flex;flex-direction:column;gap:.5rem;text-align:left">
        <label style="font-size:.875rem;color:#374151">Subject</label>
        <input id="swal-subject" class="swal2-input" placeholder="e.g., Mathematics" value="${(
          subj?.subject ?? ""
        ).replaceAll('"', "&quot;")}" />
        <label style="font-size:.875rem;color:#374151;margin-top:.25rem">Class (e.g., Year 7 or CCA)</label>
        <input id="swal-class" class="swal2-input" placeholder="e.g., Year 7 or CCA" value="${(
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
        try {
          return validateSubjectAndClass(subject, className);
        } catch (err) {
          Swal.showValidationMessage(err.message);
          throw err;
        }
      },
    });

    if (result.isConfirmed) {
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
      notifySuccess("Subject updated.");
    }
  } catch (err) {
    notifyError("Could not edit subject.");
    throw err;
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
      notifySuccess(`${name} removed.`);
    }
  } catch (err) {
    notifyError("Could not remove subject.");
    throw err;
  }
}

/* -------------------------
   Export & Print Utilities
   -------------------------*/
function downloadJSON(teachers = []) {
  const blob = new Blob([JSON.stringify({ teachers }, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.json";
  link.click();
  notifySuccess("JSON file downloaded.");
}

function exportCSV(teachers = []) {
  const rows = [["Teacher", "Subject", "Class"]];
  teachers.forEach((t) =>
    (t.subjects || []).forEach((s) =>
      rows.push([t.name, s.subject || "", s.class || ""])
    )
  );
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.csv";
  link.click();
  notifySuccess("CSV file downloaded.");
}

function printMovementBook(teachers = []) {
  const htmlParts = [
    `<html><head><title>Movement Book</title><meta charset="utf-8"/></head><body>`,
  ];
  htmlParts.push("<h1>Movement Book</h1>");
  teachers.forEach((t) => {
    htmlParts.push(`<h2>Teacher: ${escapeHtml(t.name)}</h2>`);
    (t.subjects || []).forEach((s) => {
      htmlParts.push(
        `<p>${escapeHtml(s.subject)} - ${escapeHtml(s.class)}</p>`
      );
    });
  });
  htmlParts.push("</body></html>");
  const win = window.open("", "_blank");
  if (!win) {
    notifyError("Popup blocked. Allow popups to print.");
    return;
  }
  win.document.write(htmlParts.join("\n"));
  win.document.close();
  win.print();
  notifySuccess("Movement book sent to printer.");
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* -------------------------
   Main Component
   -------------------------*/
export default function Summary({ teachers = [], dispatch }) {
  const safeTeachers = Array.isArray(demoTeachers) ? demoTeachers : [];
  const [loading, setLoading] = useState(false);

  const chartData = safeTeachers.map((t) => ({
    teacher: t.name || "—",
    subjects: (t.subjects || []).length,
  }));

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
        <div className="text-sm text-gray-500">
          Review & confirm teachers and subject assignments
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-8 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="teacher" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="subjects" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Teachers grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeTeachers.map((teacher, tIdx) => {
          const subs = Array.isArray(teacher?.subjects) ? teacher.subjects : [];
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
                    label={`Edit ${teacher?.name ?? "teacher"}`}
                    title="Edit name"
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
                    label={`Full edit ${teacher?.name ?? "teacher"}`}
                    title="Open full editor"
                  />
                  <IconButton
                    onClick={() =>
                      handleRemoveTeacher(dispatch, safeTeachers, tIdx)
                    }
                    icon={FaTrash}
                    className="bg-red-50 text-red-500 hover:bg-red-100"
                    label={`Remove ${teacher?.name ?? "teacher"}`}
                    title="Remove teacher"
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
                          label={`Edit ${subj?.subject ?? "subject"}`}
                          title="Edit subject"
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
                          label={`Remove ${subj?.subject ?? "subject"}`}
                          title="Remove subject"
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
            type="button"
          >
            <FaArrowLeft /> Back
          </button>

          <button
            onClick={() => downloadJSON(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 hover:bg-base-50"
            type="button"
          >
            <FaFileExport /> JSON
          </button>

          <button
            onClick={() => exportCSV(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 hover:bg-base-50"
            type="button"
          >
            <FaFileExport /> CSV
          </button>

          <button
            onClick={() => printMovementBook(safeTeachers)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-300 bg-base-100 hover:bg-base-50"
            type="button"
          >
            <FaPrint /> Print
          </button>
        </div>

        <button
          onClick={async () => {
            try {
              setLoading(true);

              // --- 1. Strict Validation Before Proceeding ---
              if (!safeTeachers || safeTeachers.length === 0) {
                notifyError("No teacher data to generate timetable.");
                return;
              }

              // const hasEmptySubjects = safeTeachers.some(
              //   (teacher) => !teacher.subject || teacher.subject.trim() === ""
              // );
              // if (hasEmptySubjects) {
              //   notifyError("Some teachers do not have subjects assigned.");
              //   return;
              // }

              const hasInvalidPeriods = safeTeachers.some(
                (teacher) =>
                  !teacher.periods ||
                  isNaN(teacher.periods) ||
                  teacher.periods <= 0
              );
              if (hasInvalidPeriods) {
                notifyError("Some teachers have invalid or missing periods.");
                return;
              }

              // --- 2. Dispatch to Reducer ---
              dispatch({
                type: "CONFIRM_AND_GENERATE",
                payload: { teachers: safeTeachers },
              });

              // --- 3. Send All Data to Backend API ---
              const payload = { teachers: safeTeachers };
              const response = await fetch(
                "https://time-table-production.up.railway.app/api/generate", // adjust if endpoint differs
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "API request failed");
              }

              notifySuccess(
                "Timetable successfully generated and sent to server."
              );

              // --- 4. Optionally navigate to timetable view (if needed) ---
              // navigate("/timetable"); // Uncomment if you have a route
            } catch (err) {
              notifyError(err.message || "Failed to generate timetable.");
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className={`ml-auto px-4 py-2 rounded-lg text-white ${
            loading ? "bg-gray-400" : "bg-primary hover:shadow-lg"
          }`}
          type="button"
        >
          {loading ? "Generating..." : "Generate Timetable"}
        </button>
      </div>
    </NeumorphicCard>
  );
}
