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

const MY_SCHOOL_DEFAULTS = {
  classRange: { from: 7, to: 12, prefix: "Year " },
  subjects: [
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

const mkClasses = ({ from, to, prefix = "Year " }) =>
  Array.from(
    { length: Math.max(0, (to ?? 0) - (from ?? 0) + 1) },
    (_, index) => `${prefix}${(from ?? 0) + index}`.trim()
  );

const deepUnique = (values) =>
  Array.from(new Set(values.filter(Boolean).map((value) => value.trim()))).sort(
    (left, right) => left.localeCompare(right)
  );

const defaultDays = () => [
  { id: "mon", label: "Monday", enabled: true },
  { id: "tue", label: "Tuesday", enabled: true },
  { id: "wed", label: "Wednesday", enabled: true },
  { id: "thu", label: "Thursday", enabled: true },
  { id: "fri", label: "Friday", enabled: true },
];

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

function toMinutes(time) {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(time || "").trim());
  if (!match) {
    throw new Error(`Invalid time "${time}". Use HH:MM in 24-hour format.`);
  }

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  return hour * 60 + minute;
}

function validatePeriodsOrThrow(periods) {
  if (!Array.isArray(periods) || periods.length === 0) {
    throw new Error("Add at least one period before continuing.");
  }

  let previousEnd = 0;
  for (const period of periods) {
    if (!period.label?.trim()) {
      throw new Error("Every period needs a label.");
    }

    const start = toMinutes(period.start);
    const end = toMinutes(period.end);
    if (end <= start) {
      throw new Error(`"${period.label}" must end after it starts.`);
    }
    if (start < previousEnd) {
      throw new Error(`"${period.label}" overlaps the previous period.`);
    }
    previousEnd = end;
  }
}

function validateRangeOrThrow(range) {
  const from = Number(range?.from);
  const to = Number(range?.to);
  if (!Number.isInteger(from) || !Number.isInteger(to)) {
    throw new Error("Class range values must be whole numbers.");
  }
  if (from < 1 || to < 1) {
    throw new Error("Class range values must be positive.");
  }
  if (to < from) {
    throw new Error("The end of the class range must be after the start.");
  }
}

function validateSubjectsOrThrow(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error("Select at least one subject.");
  }
}

function validateDaysOrThrow(days) {
  if (!Array.isArray(days) || days.every((day) => !day.enabled)) {
    throw new Error("Enable at least one school day.");
  }
}

function clampLessonsPerWeek(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function withInputChange(state, patch) {
  return {
    ...state,
    ...patch,
    generatedTimetable: null,
    generation: { loading: false, error: null },
  };
}

export const initialState = {
  screen: "teacher-input",
  teachers: [],
  currentTeacherIndex: 0,
  generatedTimetable: null,
  generation: {
    loading: false,
    error: null,
  },
  validation: {
    levels: { ...MY_SCHOOL_DEFAULTS.levels },
    classRange: { ...MY_SCHOOL_DEFAULTS.classRange },
    classes: mkClasses(MY_SCHOOL_DEFAULTS.classRange),
    subjectsCatalog: {
      ...LAGOS_CURRICULUM,
      custom: [],
    },
    subjectsSelected: deepUnique([
      ...MY_SCHOOL_DEFAULTS.subjects,
      ...LAGOS_CURRICULUM.jss,
      ...LAGOS_CURRICULUM.sss,
    ]),
    days: defaultDays(),
    periods: defaultPeriods(),
  },
};

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_TEACHER": {
      const teacher = { name: action.payload, subjects: [] };
      return withInputChange(state, {
        teachers: [...state.teachers, teacher],
      });
    }

    case "CONFIRM_TEACHERS":
      return withInputChange(state, { screen: "validation" });

    case "ADD_SUBJECT_CLASS":
      return withInputChange(state, {
        teachers: state.teachers.map((teacher, index) =>
          index === state.currentTeacherIndex
            ? {
                ...teacher,
                subjects: [
                  ...teacher.subjects,
                  {
                    ...action.payload,
                    lessonsPerWeek: clampLessonsPerWeek(
                      action.payload.lessonsPerWeek
                    ),
                  },
                ],
              }
            : teacher
        ),
      });

    case "NEXT_TEACHER":
      if (state.currentTeacherIndex + 1 < state.teachers.length) {
        return withInputChange(state, {
          currentTeacherIndex: state.currentTeacherIndex + 1,
        });
      }
      return withInputChange(state, { screen: "summary" });

    case "PREV_TEACHER":
      if (state.currentTeacherIndex - 1 >= 0) {
        return withInputChange(state, {
          currentTeacherIndex: state.currentTeacherIndex - 1,
        });
      }
      return state;

    case "BACK_TO_ASSIGNMENTS":
      return withInputChange(state, {
        screen: "subject-class-input",
        currentTeacherIndex: Math.max(0, state.teachers.length - 1),
      });

    case "VIEW_SUMMARY":
      return { ...state, screen: "summary" };

    case "EDIT_TEACHER": {
      const { index, name } = action.payload;
      return withInputChange(state, {
        teachers: state.teachers.map((teacher, teacherIndex) =>
          teacherIndex === index ? { ...teacher, name } : teacher
        ),
      });
    }

    case "REMOVE_TEACHER": {
      const { index } = action.payload;
      const teachers = state.teachers.filter((_, teacherIndex) => teacherIndex !== index);
      const currentTeacherIndex = Math.max(
        0,
        Math.min(state.currentTeacherIndex, Math.max(teachers.length - 1, 0))
      );

      return withInputChange(state, {
        teachers,
        currentTeacherIndex,
        screen: teachers.length === 0 ? "teacher-input" : state.screen,
      });
    }

    case "EDIT_SUBJECT": {
      const { teacherIndex, subjectIndex, subject, class: className, lessonsPerWeek } =
        action.payload;
      return withInputChange(state, {
        teachers: state.teachers.map((teacher, currentTeacherIndex) =>
          currentTeacherIndex === teacherIndex
            ? {
                ...teacher,
                subjects: teacher.subjects.map((entry, currentSubjectIndex) =>
                  currentSubjectIndex === subjectIndex
                    ? {
                        subject,
                        class: className,
                        lessonsPerWeek: clampLessonsPerWeek(lessonsPerWeek),
                      }
                    : entry
                ),
              }
            : teacher
        ),
      });
    }

    case "REMOVE_SUBJECT": {
      const { teacherIndex, subjectIndex } = action.payload;
      return withInputChange(state, {
        teachers: state.teachers.map((teacher, currentTeacherIndex) =>
          currentTeacherIndex === teacherIndex
            ? {
                ...teacher,
                subjects: teacher.subjects.filter(
                  (_, currentSubjectIndex) => currentSubjectIndex !== subjectIndex
                ),
              }
            : teacher
        ),
      });
    }

    case "GENERATE_TIMETABLE_START":
      return {
        ...state,
        generation: {
          loading: true,
          error: null,
        },
      };

    case "GENERATE_TIMETABLE_SUCCESS":
      return {
        ...state,
        screen: "timetable-generated",
        generatedTimetable: action.payload,
        generation: {
          loading: false,
          error: null,
        },
      };

    case "GENERATE_TIMETABLE_FAILURE":
      return {
        ...state,
        generation: {
          loading: false,
          error: action.payload,
        },
      };

    case "RESET_GENERATION":
      return {
        ...state,
        generatedTimetable: null,
        generation: {
          loading: false,
          error: null,
        },
      };

    case "VALIDATION_TOGGLE_LEVEL": {
      const { level, value } = action.payload;
      return withInputChange(state, {
        validation: {
          ...state.validation,
          levels: { ...state.validation.levels, [level]: !!value },
        },
      });
    }

    case "VALIDATION_TOGGLE_SUBJECT": {
      const subject = String(action.payload || "").trim();
      const hasSubject = state.validation.subjectsSelected.includes(subject);
      const subjectsSelected = hasSubject
        ? state.validation.subjectsSelected.filter((entry) => entry !== subject)
        : deepUnique([...state.validation.subjectsSelected, subject]);

      return withInputChange(state, {
        validation: { ...state.validation, subjectsSelected },
      });
    }

    case "VALIDATION_ADD_SUBJECT": {
      const subject = String(action.payload || "").trim();
      if (!subject) {
        return state;
      }

      return withInputChange(state, {
        validation: {
          ...state.validation,
          subjectsCatalog: {
            ...state.validation.subjectsCatalog,
            custom: deepUnique([
              ...(state.validation.subjectsCatalog.custom || []),
              subject,
            ]),
          },
          subjectsSelected: deepUnique([
            ...state.validation.subjectsSelected,
            subject,
          ]),
        },
      });
    }

    case "VALIDATION_SET_PERIODS": {
      const periods = Array.isArray(action.payload)
        ? action.payload
        : state.validation.periods;
      validatePeriodsOrThrow(periods);

      return withInputChange(state, {
        validation: { ...state.validation, periods },
      });
    }

    case "VALIDATION_TOGGLE_DAY": {
      const dayId = action.payload;
      return withInputChange(state, {
        validation: {
          ...state.validation,
          days: state.validation.days.map((day) =>
            day.id === dayId ? { ...day, enabled: !day.enabled } : day
          ),
        },
      });
    }

    case "VALIDATION_SET_CLASS_RANGE": {
      const classRange = { ...state.validation.classRange, ...action.payload };
      validateRangeOrThrow(classRange);

      return withInputChange(state, {
        validation: {
          ...state.validation,
          classRange,
          classes: mkClasses(classRange),
        },
      });
    }

    case "VALIDATION_CONFIRM":
      validateRangeOrThrow(state.validation.classRange);
      validateSubjectsOrThrow(state.validation.subjectsSelected);
      validatePeriodsOrThrow(state.validation.periods);
      validateDaysOrThrow(state.validation.days);
      return withInputChange(state, { screen: "subject-class-input" });

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
