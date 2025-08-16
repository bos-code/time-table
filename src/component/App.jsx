import React, { useReducer } from "react";
import TeacherInput from "./TeachersInput";
import SubjectClassInput from "./subjec";
import Summary from "./summery";
import ProgressTracker from "./progress";
import Navbar from "./themeSwitch";

const initialState = {
  screen: "teacher-input",
  teachers: [],
  currentTeacherIndex: 0,
};

function reducer(state, action) {
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
      // if currentTeacherIndex exists, clamp it
      const clampedIndex = Math.max(
        0,
        Math.min(
          state.currentTeacherIndex || 0,
          Math.max(0, updated.length - 1)
        )
      );
      return { ...state, teachers: updated, currentTeacherIndex: clampedIndex };
    }

    // optional action triggered by Confirm & Generate button
    case "CONFIRM_AND_GENERATE": {
      // your timetable generation logic lives here (placeholder)
      return { ...state, screen: "timetable-generated" };
    }
    case "EDIT_TEACHERs":
      return state.map((teacher, idx) =>
        idx === action.payload.index
          ? { ...teacher, name: action.payload.name }
          : teacher
      );

    case "EDIT_SUBJECT":
      return state.map((teacher, tIdx) =>
        tIdx === action.payload.teacherIndex
          ? {
              ...teacher,
              subjects: teacher.subjects.map((subj, sIdx) =>
                sIdx === action.payload.subjectIndex
                  ? {
                      subject: action.payload.subject,
                      class: action.payload.class,
                    }
                  : subj
              ),
            }
          : teacher
      );

    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { screen, teachers, currentTeacherIndex } = state;
  return (
    <div className="min-h-screen bg-base-200/50 backdrop-blur-lg">
      <Navbar />
      <div className="min-h-screen flex flex-col gap-10 items-center justify-start pt-20 bg-base-200 p-6">
        {screen !== "summary" && (
          <ProgressTracker
            totalTeachers={teachers.length}
            currentIndex={currentTeacherIndex}
            screen={screen}
          />
        )}

        {screen === "teacher-input" && (
          <TeacherInput dispatch={dispatch} teachers={teachers} />
        )}

        {screen === "subject-class-input" && (
          <SubjectClassInput
            dispatch={dispatch}
            teacher={teachers[currentTeacherIndex]}
          />
        )}

        {screen === "summary" && (
          <Summary dispatch={dispatch} teachers={teachers} />
        )}
      </div>
    </div>
  );
}
