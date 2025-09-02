// App.jsx (relevant part)
import React, { useReducer } from "react";
import { initialState, reducer } from "./tableReducer";
import TeacherInput from "./TeachersInput";
import ValidationDashboard from "./ValidationDashboard";
import Summary from "./summery";
import ProgressTracker from "./progress";
import Navbar from "./themeSwitch";
import SubjectClassInput from "./TeachersAssignments";
import TimetableFetcher from "./Timetable";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { screen } = state;
  console.log(state.teachers)

  return (
    <div className="min-h-screen bg-base-200/50 backdrop-blur-lg">
      <Navbar />
      <div className="min-h-screen flex flex-col gap-10 items-center justify-start pt-20 bg-base-200 p-6">
        <ProgressTracker
          totalTeachers={state.teachers.length}
          currentIndex={state.currentTeacherIndex}
          screen={screen}
        />
        {screen === "teacher-input" && (
          <TeacherInput dispatch={dispatch} teachers={state.teachers} />
        )}
        {screen === "validation" && (
          <ValidationDashboard state={state} dispatch={dispatch} />
        )}
        {screen === "subject-class-input" && (
          <SubjectClassInput
            dispatch={dispatch}
            teacher={state.teachers[state.currentTeacherIndex]}
            currentIndex={state.currentTeacherIndex}
            totalTeachers={state.teachers.length}
            minYear={state.validation.classRange.from}
            maxYear={state.validation.classRange.to}
            teachers={state.teachers}
            allowedSubjects={state.validation.subjectsSelected}
          />
        )}
        {screen === "summary" && (
          <Summary
            state={state}
            dispatch={dispatch}
            teachers={state.teachers}
          />
        )}
        {screen === "CONFIRM_AND_GENERATE" && (
          <TimetableFetcher />
        )}
      </div>
    </div>
  );
}
