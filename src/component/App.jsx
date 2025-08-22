import React, { useReducer } from "react";
import TeacherInput from "./TeachersInput";
import SubjectClassInput from "./subjec";
import ProgressTracker from "./progress";
import Navbar from "./themeSwitch";
import Summary from "./summery";
import TimetableView from "./TableView";

import { reducer, initialState } from "./tableReducer";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { screen, teachers, currentTeacherIndex } = state;

  return (
    <div className="min-h-screen bg-base-200/50 backdrop-blur-lg">
      <Navbar />
      <div className="min-h-screen flex flex-col gap-10 items-center justify-start pt-20 bg-base-200 p-6">
        {/* Progress Tracker (only show before summary/timetable) */}
        {screen !== "summary" && screen !== "timetable-generated" && (
          <ProgressTracker
            totalTeachers={teachers.length}
            currentIndex={currentTeacherIndex}
            screen={screen}
          />
        )}

        {/* Teacher Input Screen */}
        {screen === "teacher-input" && (
          <TeacherInput dispatch={dispatch} teachers={teachers} />
        )}

        {/* Subject/Class Input Screen */}
        {screen === "subject-class-input" && (
          <SubjectClassInput
            dispatch={dispatch}
            teacher={teachers[currentTeacherIndex]}
          />
        )}

        {/* Summary Screen */}
        {screen === "summary" && (
          <Summary dispatch={dispatch} teachers={teachers} />
        )}

        {/* Generated Timetable Screen */}
        {screen === "timetable-generated" && (
          <TimetableView teachers={teachers} />
        )}
      </div>
    </div>
  );
}
