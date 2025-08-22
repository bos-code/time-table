export const initialState = {
  screen: "teacher-input",
  teachers: [],
  currentTeacherIndex: 0,
};

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_TEACHER":
      return {
        ...state,
        teachers: [...state.teachers, { name: action.payload, subjects: [] }],
      };

    case "CONFIRM_TEACHERS":
      return { ...state, screen: "subject-class-input" };

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

    case "CONFIRM_AND_GENERATE":
      return { ...state, screen: "timetable-generated" };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
