// reducer.js
export const initialState = {
  // teachers: array of { id, name, subjects: [ { id, subject, class } ] }
  teachers: [],
  // generic lists (kept for backward compatibility / export)
  subjects: [],
  classes: [],

  // UI / flow
  currentTeacherIndex: 0,
  screen: "teacher-input", // 'teacher-input' | 'subject-class-input' | 'summary' | 'generate'
  editingTeacherIndex: null, // used by EDIT_TEACHER_START to open full editor
  generated: false,
};

// helper: stable id generator (uses crypto.randomUUID when available)
function makeId() {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  // fallback
  return `id_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

// normalize class strings to "Year N"
function normalizeClassName(raw = "") {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  // allow "1" -> "Year 1", or "year 1" -> "Year 1", or "Year1" -> "Year 1"
  const m = trimmed.match(/(\d{1,2})/);
  if (m) {
    return `Year ${m[1]}`;
  }
  // fall back to cleaned string (capitalize first letter)
  return trimmed.replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function timetableReducer(state = initialState, action) {
  // small helpers
  const clampIndex = (i, arr) => {
    const length = Array.isArray(arr) ? arr.length : 0;
    const max = Math.max(0, length - 1);
    if (length === 0) return 0;
    const idx = typeof i === "number" ? i : 0;
    return Math.max(0, Math.min(idx, max));
  };

  const safeTeachers = Array.isArray(state.teachers) ? state.teachers : [];

  switch (action?.type) {
    // ----------------------
    // Teacher management
    // ----------------------
    case "ADD_TEACHER": {
      const name =
        action?.payload?.name ??
        (typeof action.payload === "string" ? action.payload : "");
      if (!name || !String(name).trim()) return state;
      const newTeacher = {
        id: makeId(),
        name: String(name).trim(),
        subjects: [],
      };
      const teachers = [...safeTeachers, newTeacher];
      return {
        ...state,
        teachers,
        currentTeacherIndex: clampIndex(
          state.currentTeacherIndex ?? teachers.length - 1,
          teachers
        ),
      };
    }

    case "REMOVE_TEACHER": {
      // Accept payload shapes: { index } OR plain number (legacy)
      const payload = action?.payload;
      const index =
        typeof payload === "number"
          ? payload
          : payload && typeof payload.index === "number"
          ? payload.index
          : null;
      if (index === null || index < 0 || index >= safeTeachers.length)
        return state;

      const updated = safeTeachers.filter((_, i) => i !== index);
      const clampedIndex = clampIndex(state.currentTeacherIndex ?? 0, updated);

      // Adjust editingTeacherIndex:
      // - if editing index was removed -> null
      // - if editing index > removed index -> decrement by 1
      let editing = state.editingTeacherIndex;
      if (typeof editing === "number") {
        if (editing === index) editing = null;
        else if (editing > index) editing = editing - 1;
        // clamp editing to new bounds
        editing = editing === null ? null : clampIndex(editing, updated);
      }

      return {
        ...state,
        teachers: updated,
        currentTeacherIndex: clampedIndex,
        editingTeacherIndex: editing,
      };
    }

    case "REMOVE_TEACHER_BY_NAME": {
      const name = action?.payload?.name;
      if (!name) return state;
      const updated = safeTeachers.filter(
        (t) => String(t?.name ?? "") !== String(name)
      );
      const clampedIndex = clampIndex(state.currentTeacherIndex ?? 0, updated);
      // if editingTeacherIndex out of range after removal, reset to null
      const editing =
        typeof state.editingTeacherIndex === "number" &&
        state.editingTeacherIndex < updated.length
          ? state.editingTeacherIndex
          : null;
      return {
        ...state,
        teachers: updated,
        currentTeacherIndex: clampedIndex,
        editingTeacherIndex: editing,
      };
    }

    case "EDIT_TEACHER": {
      const { index, name } = action?.payload ?? {};
      if (typeof index !== "number" || !name || !String(name).trim())
        return state;
      const teachers = safeTeachers.map((t, i) =>
        i === index ? { ...t, name: String(name).trim() } : t
      );
      return { ...state, teachers };
    }

    case "EDIT_TEACHER_START": {
      // open full teacher editor; payload: { index }
      const idx = action?.payload?.index;
      if (typeof idx !== "number" || idx < 0 || idx >= safeTeachers.length)
        return { ...state, editingTeacherIndex: null };
      return {
        ...state,
        editingTeacherIndex: idx,
        screen: "subject-class-input",
      };
    }

    // ----------------------
    // Subject / class for teacher
    // ----------------------
    case "ADD_SUBJECT_CLASS": {
      // payload may be { teacherIndex, subject, class } OR { subject, class } (use currentTeacherIndex)
      const payload = action?.payload ?? {};
      const teacherIndex =
        typeof payload.teacherIndex === "number"
          ? payload.teacherIndex
          : state.currentTeacherIndex ?? 0;
      const subject = (payload.subject ?? payload?.subj ?? "")
        .toString()
        .trim();
      const rawClassName = (payload.class ?? payload?.className ?? "")
        .toString()
        .trim();
      const className = normalizeClassName(rawClassName);

      if (!subject || !className) return state;
      if (teacherIndex < 0 || teacherIndex >= safeTeachers.length) return state;

      const newSub = {
        id: makeId(),
        subject,
        class: className,
      };

      const teachers = safeTeachers.map((t, i) =>
        i === teacherIndex
          ? {
              ...t,
              subjects: [
                ...(Array.isArray(t.subjects) ? t.subjects : []),
                newSub,
              ],
            }
          : t
      );
      return { ...state, teachers };
    }

    case "EDIT_SUBJECT": {
      // payload: { teacherIndex, subjectIndex, subject, class }
      const p = action?.payload ?? {};
      const ti = p.teacherIndex;
      const si = p.subjectIndex;
      const newSubj = p.subject ?? p?.name ?? "";
      const rawNewClass = p.class ?? p?.className ?? "";
      const newClass = rawNewClass ? normalizeClassName(rawNewClass) : "";

      if (typeof ti !== "number" || typeof si !== "number") return state;
      if (ti < 0 || ti >= safeTeachers.length) return state;
      const teacher = safeTeachers[ti];
      const subs = Array.isArray(teacher?.subjects) ? teacher.subjects : [];
      if (si < 0 || si >= subs.length) return state;

      const updatedSubs = subs.map((s, i) =>
        i === si
          ? {
              // keep id if present
              id: s.id ?? makeId(),
              subject: String(newSubj).trim() || s.subject,
              class: String(newClass).trim() || s.class,
            }
          : s
      );
      const teachers = safeTeachers.map((t, i) =>
        i === ti ? { ...t, subjects: updatedSubs } : t
      );
      return { ...state, teachers };
    }

    case "REMOVE_SUBJECT": {
      // payload: { teacherIndex, subjectIndex }
      const p = action?.payload ?? {};
      const ti = p.teacherIndex;
      const si = p.subjectIndex;
      if (typeof ti !== "number" || typeof si !== "number") return state;
      if (ti < 0 || ti >= safeTeachers.length) return state;
      const teacher = safeTeachers[ti];
      const subs = Array.isArray(teacher?.subjects) ? teacher.subjects : [];
      if (si < 0 || si >= subs.length) return state;
      const updatedSubs = subs.filter((_, i) => i !== si);
      const teachers = safeTeachers.map((t, i) =>
        i === ti ? { ...t, subjects: updatedSubs } : t
      );
      return { ...state, teachers };
    }

    // ----------------------
    // Navigation / flow
    // ----------------------
    case "NEXT_TEACHER":
    case "INCREMENT_INDEX": {
      const next = (state.currentTeacherIndex ?? 0) + 1;
      const clamped = clampIndex(next, safeTeachers);
      return { ...state, currentTeacherIndex: clamped };
    }

    case "PREV_TEACHER":
    case "PREV":
    case "DECREMENT_INDEX": {
      const prev = (state.currentTeacherIndex ?? 0) - 1;
      const clamped = clampIndex(prev, safeTeachers);
      return { ...state, currentTeacherIndex: clamped };
    }

    case "GOTO_TEACHER_INPUT":
      return { ...state, screen: "teacher-input", editingTeacherIndex: null };

    case "GOTO_SUBJECT_INPUT":
      return { ...state, screen: "subject-class-input" };

    case "GOTO_SUMMARY":
    case "TO_SUMMARY":
      return { ...state, screen: "summary", editingTeacherIndex: null };

    case "CONFIRM_AND_GENERATE": {
      // Mark generated and move to generate screen
      return { ...state, generated: true, screen: "generate" };
    }

    // ----------------------
    // Reset / initialize
    // ----------------------
    case "RESET":
      return { ...initialState };

    case "SET_STATE": {
      // Replace whole state (careful). Payload must be a plain object.
      const payload = action?.payload;
      if (!payload || typeof payload !== "object") return state;
      return { ...state, ...payload };
    }

    // ----------------------
    // Simple add for subjects/classes arrays (legacy)
    // ----------------------
    case "ADD_SUBJECT": {
      const name =
        action?.payload?.name ??
        (typeof action.payload === "string" ? action.payload : "");
      if (!name || !String(name).trim()) return state;
      return {
        ...state,
        subjects: [
          ...(Array.isArray(state.subjects) ? state.subjects : []),
          { id: makeId(), name: String(name).trim() },
        ],
      };
    }

    case "ADD_CLASS": {
      const name =
        action?.payload?.name ??
        (typeof action.payload === "string" ? action.payload : "");
      if (!name || !String(name).trim()) return state;
      return {
        ...state,
        classes: [
          ...(Array.isArray(state.classes) ? state.classes : []),
          { id: makeId(), name: String(name).trim() },
        ],
      };
    }

    // ----------------------
    // Unknown action (no-op)
    // ----------------------
    default:
      return state;
  }
}
