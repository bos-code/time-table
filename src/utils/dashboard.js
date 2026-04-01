const SCREEN_ORDER = [
  "teacher-input",
  "validation",
  "subject-class-input",
  "summary",
  "timetable-generated",
];

export function getActiveDays(validation = {}) {
  return (validation.days || []).filter((day) => day.enabled);
}

export function getTeachingPeriods(validation = {}) {
  return (validation.periods || []).filter((period) => period.type === "teaching");
}

export function getTeacherLoads(teachers = []) {
  return teachers
    .map((teacher) => ({
      name: teacher.name,
      lessonCount: (teacher.subjects || []).reduce(
        (total, entry) => total + (Number(entry.lessonsPerWeek) || 0),
        0
      ),
      assignmentCount: teacher.subjects?.length || 0,
    }))
    .sort((left, right) => right.lessonCount - left.lessonCount);
}

export function getClassLoads(teachers = []) {
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
    .sort((left, right) => right.lessonCount - left.lessonCount);
}

export function getSubjectDemand(teachers = []) {
  const demand = new Map();
  teachers.forEach((teacher) => {
    teacher.subjects?.forEach((entry) => {
      demand.set(
        entry.subject,
        (demand.get(entry.subject) || 0) + (Number(entry.lessonsPerWeek) || 0)
      );
    });
  });

  return Array.from(demand.entries())
    .map(([subject, lessons]) => ({ subject, lessons }))
    .sort((left, right) => right.lessons - left.lessons);
}

export function getDayLessonCounts(assignments = []) {
  const counts = new Map();
  assignments.forEach((assignment) => {
    counts.set(assignment.day, (counts.get(assignment.day) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([day, lessons]) => ({ day, lessons }));
}

export function getAssignmentTeacherLoads(assignments = []) {
  const loads = new Map();
  assignments.forEach((assignment) => {
    loads.set(assignment.teacher, (loads.get(assignment.teacher) || 0) + 1);
  });

  return Array.from(loads.entries())
    .map(([name, lessonCount]) => ({ name, lessonCount }))
    .sort((left, right) => right.lessonCount - left.lessonCount);
}

export function getAssignmentClassLoads(assignments = []) {
  const loads = new Map();
  assignments.forEach((assignment) => {
    loads.set(assignment.className, (loads.get(assignment.className) || 0) + 1);
  });

  return Array.from(loads.entries())
    .map(([className, lessonCount]) => ({ className, lessonCount }))
    .sort((left, right) => right.lessonCount - left.lessonCount);
}

export function buildGenerationPayload(state) {
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

export function getQuickStats(state) {
  const teacherLoads = getTeacherLoads(state.teachers);
  const classLoads = getClassLoads(state.teachers);
  const activeDays = getActiveDays(state.validation);
  const teachingPeriods = getTeachingPeriods(state.validation);
  const totalLessons = teacherLoads.reduce(
    (total, teacher) => total + teacher.lessonCount,
    0
  );

  return {
    teacherLoads,
    classLoads,
    activeDays,
    teachingPeriods,
    totalLessons,
    teacherCount: state.teachers.length,
    classCount: classLoads.length,
    subjectCount: state.validation.subjectsSelected.length,
    weeklyCapacityPerClass: activeDays.length * teachingPeriods.length,
  };
}

export function getScreenMeta(screen, state) {
  const quickStats = getQuickStats(state);
  const activeTeacher =
    state.teachers[state.currentTeacherIndex]?.name || "Current teacher";

  const staticMeta = {
    "teacher-input": {
      eyebrow: "School Setup",
      title: "Build your teaching roster",
      subtitle:
        "Start with the people. Once the team is in place, the scheduler can reason about conflicts, workload, and capacity.",
    },
    validation: {
      eyebrow: "School Week",
      title: "Shape the week before you solve it",
      subtitle:
        "Lock in days, periods, class range, and subject availability so the solver works inside real school constraints.",
    },
    "subject-class-input": {
      eyebrow: "Teacher Workload",
      title: `Map subjects for ${activeTeacher}`,
      subtitle:
        "Add each subject-class pairing with lessons per week so the engine can turn workload into an actual timetable.",
    },
    summary: {
      eyebrow: "Review",
      title: "Stress-test the weekly demand",
      subtitle:
        "Check teacher load, class pressure, and subject mix before asking OR-Tools to generate the schedule.",
    },
    "timetable-generated": {
      eyebrow: "Output",
      title: "Explore the generated timetable",
      subtitle:
        "Inspect the solved schedule, compare teacher and class views, and download the final output for operations.",
    },
  };

  return {
    ...staticMeta[screen],
    progress:
      (SCREEN_ORDER.indexOf(screen) + 1) / Math.max(SCREEN_ORDER.length, 1),
    quickStats,
  };
}

function downloadBlob(filename, blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(filename, blob);
}

function rowsToCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export function downloadCsv(filename, rows) {
  const blob = new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8;" });
  downloadBlob(filename, blob);
}

export function buildTeacherWorkloadCsvRows(teachers = []) {
  const rows = [["Teacher", "Subject", "Class", "Lessons Per Week"]];
  teachers.forEach((teacher) => {
    if (!teacher.subjects?.length) {
      rows.push([teacher.name, "", "", 0]);
      return;
    }
    teacher.subjects.forEach((entry) => {
      rows.push([
        teacher.name,
        entry.subject,
        entry.class,
        Number(entry.lessonsPerWeek) || 0,
      ]);
    });
  });
  return rows;
}

export function buildClassDemandCsvRows(classLoads = []) {
  return [
    ["Class", "Lessons Requested"],
    ...classLoads.map((entry) => [entry.className, entry.lessonCount]),
  ];
}

export function buildTimetableCsvRows(assignments = []) {
  return [
    ["Day", "Period", "Start", "End", "Class", "Subject", "Teacher"],
    ...assignments.map((assignment) => [
      assignment.day,
      assignment.period,
      assignment.start,
      assignment.end,
      assignment.className,
      assignment.subject,
      assignment.teacher,
    ]),
  ];
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function printTimetableReport(timetable) {
  const assignments = timetable?.assignments || [];
  const meta = timetable?.meta || {};
  const rows = assignments
    .map(
      (assignment) => `
        <tr>
          <td>${escapeHtml(assignment.day)}</td>
          <td>${escapeHtml(assignment.period)}</td>
          <td>${escapeHtml(assignment.start)} - ${escapeHtml(assignment.end)}</td>
          <td>${escapeHtml(assignment.className)}</td>
          <td>${escapeHtml(assignment.subject)}</td>
          <td>${escapeHtml(assignment.teacher)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>Generated Timetable</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
          h1 { margin-bottom: 0.35rem; }
          p { color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
          th { background: #eff6ff; }
        </style>
      </head>
      <body>
        <h1>Generated Timetable</h1>
        <p>Status: ${escapeHtml(meta.solverStatus || "Unknown")} | Lessons: ${escapeHtml(
    meta.lessonsScheduled || assignments.length
  )}</p>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Period</th>
              <th>Time</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function filterSchedules(schedules = [], query = "") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return schedules;
  }

  return schedules.filter((schedule) => {
    if (schedule.name.toLowerCase().includes(normalized)) {
      return true;
    }

    return schedule.rows.some((row) =>
      row.cells.some((cell) => {
        const entry = cell.entry;
        if (!entry) {
          return false;
        }
        return [entry.subject, entry.secondaryLabel, row.period.label, cell.day.label]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
    );
  });
}

export function filterAssignments(assignments = [], query = "") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return assignments;
  }

  return assignments.filter((assignment) =>
    [
      assignment.day,
      assignment.period,
      assignment.className,
      assignment.subject,
      assignment.teacher,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}
