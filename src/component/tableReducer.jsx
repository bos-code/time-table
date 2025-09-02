// timetableReducer.js

// ===== Lagos Curriculum (broad, safe baseline) =====
const LAGOS_CURRICULUM = {
  primary: [
    "English Studies",
    "Mathematics",
    "Basic Science & Technology",
    "Social Studies",
    "Civic Education",
    "CRS/IRS",
    "Yoruba",
    "Cultural & Creative Arts",
    "Agricultural Science",
    "Physical & Health Education",
    "Computer Studies",
    "Home Economics",
  ],
  jss: [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "CRS/IRS",
    "Yoruba",
    "French",
    "Business Studies",
    "Computer Studies/ICT",
    "Agricultural Science",
    "PHE",
    "Creative Arts",
    "Home Economics",
  ],
  sss: [
    "English Language",
    "Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "Further Mathematics",
    "Government",
    "Economics",
    "Literature-in-English",
    "CRS/IRS",
    "Civic Education",
    "Geography",
    "Yoruba",
    "French",
    "Commerce",
    "Accounting",
    "Agricultural Science",
    "Computer Studies/ICT",
    "Technical Drawing",
    "Visual Arts",
    "Food & Nutrition",
    "Home Management",
  ],
};

// ===== Your school defaults (checked by default) =====
const MY_SCHOOL_DEFAULTS = {
  // default classes: Year 7–12 (JSS1–SS3)
  classRange: { from: 7, to: 12, prefix: "Year " },
  subjects: [
    // JSS core
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "CRS/IRS",
    "Computer Studies/ICT",
    "Yoruba",
    "Agricultural Science",
    "PHE",
    // SSS core
    "Biology",
    "Chemistry",
    "Physics",
    "Government",
    "Economics",
    "Literature-in-English",
    "Geography",
  ],
  levels: { primary: false, jss: true, sss: true },
};

// ===== Helpers =====
const mkClasses = ({ from, to, prefix = "Year " }) =>
  Array.from(
    { length: Math.max(0, (to ?? 0) - (from ?? 0) + 1) },
    (_, i) => `${prefix}${(from ?? 0) + i}`
  );

const deepUnique = (arr) =>
  Array.from(new Set(arr.filter(Boolean).map((s) => s.trim()))).sort((a, b) =>
    a.localeCompare(b)
  );

const defaultPeriods = () => [
  {
    id: "asm",
    label: "Assembly",
    start: "07:30",
    end: "08:00",
    type: "non-teaching",
  },
  {
    id: "p1",
    label: "Period 1",
    start: "08:00",
    end: "08:40",
    type: "teaching",
  },
  {
    id: "p2",
    label: "Period 2",
    start: "08:40",
    end: "09:20",
    type: "teaching",
  },
  {
    id: "p3",
    label: "Period 3",
    start: "09:20",
    end: "10:00",
    type: "teaching",
  },
  {
    id: "p4",
    label: "Period 4",
    start: "10:00",
    end: "10:40",
    type: "teaching",
  },
  {
    id: "lp",
    label: "Laptop Practice",
    start: "10:40",
    end: "11:00",
    type: "non-teaching",
  },
  {
    id: "p5",
    label: "Period 5",
    start: "11:00",
    end: "11:40",
    type: "teaching",
  },
  {
    id: "p6",
    label: "Period 6",
    start: "11:40",
    end: "12:20",
    type: "teaching",
  },
  {
    id: "br",
    label: "Break",
    start: "12:20",
    end: "13:00",
    type: "non-teaching",
  },
  {
    id: "p7",
    label: "Period 7",
    start: "13:00",
    end: "13:40",
    type: "teaching",
  },
  {
    id: "p8",
    label: "Period 8",
    start: "13:40",
    end: "14:20",
    type: "teaching",
  },
  {
    id: "p9",
    label: "Period 9",
    start: "14:20",
    end: "15:00",
    type: "teaching",
  },
];

// ===== Validation helpers (throwing errors) =====
function toMinutes(t) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(t || "").trim());
  if (!m) throw new Error(`Invalid time: "${t}". Use HH:MM (24h).`);
  const hh = parseInt(m[1], 10),
    mm = parseInt(m[2], 10);
  return hh * 60 + mm;
}
function validatePeriodsOrThrow(periods) {
  if (!Array.isArray(periods) || periods.length === 0) {
    throw new Error("No periods defined.");
  }
  let lastEnd = 0;
  for (const p of periods) {
    if (!p.label) throw new Error("Every period must have a label.");
    const s = toMinutes(p.start),
      e = toMinutes(p.end);
    if (e <= s)
      throw new Error(`"${p.label}" end time must be after start time.`);
    if (s < lastEnd)
      throw new Error(`"${p.label}" overlaps a previous period.`);
    lastEnd = e;
  }
}
function validateRangeOrThrow(range) {
  const from = Number(range?.from),
    to = Number(range?.to);
  if (!Number.isInteger(from) || !Number.isInteger(to))
    throw new Error("Class range must be integers.");
  if (from < 1 || to < 1) throw new Error("Class range must be positive.");
  if (to < from) throw new Error("Class range: 'to' must be >= 'from'.");
}
function validateSubjectsOrThrow(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error("Select at least one subject.");
  }
}

// ===== Initial state (yours + validation slice) =====
export const initialState = {
  screen: "teacher-input",
  teachers: [],
  currentTeacherIndex: 0,

  // Validation slice
  validation: {
    levels: { ...MY_SCHOOL_DEFAULTS.levels },
    classRange: { ...MY_SCHOOL_DEFAULTS.classRange },
    classes: mkClasses(MY_SCHOOL_DEFAULTS.classRange),
    subjectsCatalog: {
      ...LAGOS_CURRICULUM,
      custom: [], // user-added
    },
    subjectsSelected: deepUnique([
      ...MY_SCHOOL_DEFAULTS.subjects,
      ...LAGOS_CURRICULUM.jss,
      ...LAGOS_CURRICULUM.sss,
    ]),
    periods: defaultPeriods(),
  },
};

// ===== Reducer =====
export function reducer(state, action) {
  switch (action.type) {
    // === Your existing teacher flow ===
    case "ADD_TEACHER":
      return {
        ...state,
        teachers: [...state.teachers, { name: action.payload, subjects: [] }],
      };

    case "CONFIRM_TEACHERS":
      // move to validation screen next
      return { ...state, screen: "validation" };

    case "ADD_SUBJECT_CLASS":
      return {
        ...state,
        teachers: state.teachers.map((t, idx) =>
          idx === state.currentTeacherIndex
            ? { ...t, subjects: [...t.subjects, action.payload] }
            : t
        ),
      };

    case "NEXT_TEACHER":
      if (state.currentTeacherIndex + 1 < state.teachers.length) {
        return { ...state, currentTeacherIndex: state.currentTeacherIndex + 1 };
      }
      return { ...state, screen: "summary" };

    case "PREV_TEACHER":
      if (state.currentTeacherIndex - 1 >= 0) {
        return { ...state, currentTeacherIndex: state.currentTeacherIndex - 1 };
      }
      return state;

    case "EDIT_TEACHER": {
      const { index, name } = action.payload;
      const updated = state.teachers.map((t, i) =>
        i === index ? { ...t, name } : t
      );
      return { ...state, teachers: updated };
    }

    case "REMOVE_TEACHER": {
      const { index } = action.payload;
      const updated = state.teachers.filter((_, i) => i !== index);
      const clampedIndex = Math.max(
        0,
        Math.min(state.currentTeacherIndex, Math.max(0, updated.length - 1))
      );
      return { ...state, teachers: updated, currentTeacherIndex: clampedIndex };
    }

    case "EDIT_SUBJECT": {
      const {
        teacherIndex,
        subjectIndex,
        subject,
        class: className,
      } = action.payload;
      const updated = state.teachers.map((teacher, tIdx) =>
        tIdx === teacherIndex
          ? {
              ...teacher,
              subjects: teacher.subjects.map((subj, sIdx) =>
                sIdx === subjectIndex ? { subject, class: className } : subj
              ),
            }
          : teacher
      );
      return { ...state, teachers: updated };
    }

    case "REMOVE_SUBJECT": {
      const { teacherIndex, subjectIndex } = action.payload;
      const updated = state.teachers.map((teacher, tIdx) =>
        tIdx === teacherIndex
          ? {
              ...teacher,
              subjects: teacher.subjects.filter((_, i) => i !== subjectIndex),
            }
          : teacher
      );
      return { ...state, teachers: updated };
    }

    case "CONFIRM_AND_GENERATE":
      return { ...state, screen: "timetable-generated" };

  
      return { ...state, screen: "timetable-generated" };  
    case "RESET":
      return initialState;

    // === Validation slice actions ===
    case "VALIDATION_TOGGLE_LEVEL": {
      const { level, value } = action.payload; // "primary" | "jss" | "sss"
      const levels = { ...state.validation.levels, [level]: !!value };
      console.log(levels);
      return { ...state, validation: { ...state.validation, levels } };
    }

    case "VALIDATION_TOGGLE_SUBJECT": {
      const subject = String(action.payload || "").trim();
      const has = state.validation.subjectsSelected.includes(subject);
      const subjectsSelected = has
        ? state.validation.subjectsSelected.filter((s) => s !== subject)
        : deepUnique([...state.validation.subjectsSelected, subject]);
      return {
        ...state,
        validation: { ...state.validation, subjectsSelected },
      };
    }

    case "VALIDATION_ADD_SUBJECT": {
      const subject = String(action.payload || "").trim();
      if (!subject) return state;
      const subjectsCatalog = {
        ...state.validation.subjectsCatalog,
        custom: deepUnique([
          ...(state.validation.subjectsCatalog.custom || []),
          subject,
        ]),
      };
      const subjectsSelected = deepUnique([
        ...state.validation.subjectsSelected,
        subject,
      ]);
      return {
        ...state,
        validation: { ...state.validation, subjectsCatalog, subjectsSelected },
      };
    }

    case "VALIDATION_SET_PERIODS": {
      const periods = Array.isArray(action.payload)
        ? action.payload
        : state.validation.periods;
      try {
        validatePeriodsOrThrow(periods);
        return { ...state, validation: { ...state.validation, periods } };
      } catch (err) {
        // kceep state, rely on UI to show error
        console.log(err);
        return state;
      }
    }

    case "VALIDATION_CONFIRM": {
      // Final check before moving to assignments
      validateRangeOrThrow(state.validation.classRange);
      validateSubjectsOrThrow(state.validation.subjectsSelected);
      validatePeriodsOrThrow(state.validation.periods);
      return { ...state, screen: "subject-class-input" }; // keep your flow name
    }

    default:
      return state;

    case "VALIDATION_SET_CLASS_RANGE": {
      const classRange = { ...state.validation.classRange, ...action.payload };
      try {
        validateRangeOrThrow(classRange);
        const classes = mkClasses(classRange);
        return {
          ...state,
          validation: { ...state.validation, classRange, classes },
        };
      } catch (err) {
        if (!err) return state;
      }
    }
  }
}
