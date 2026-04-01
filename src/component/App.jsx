import React, { useReducer, useState } from "react";
import { initialState, reducer } from "./tableReducer";
import TeacherInput from "./TeachersInput";
import ValidationDashboard from "./ValidationDashboard";
import Summary from "./summery";
import ProgressTracker from "./progress";
import Navbar from "./themeSwitch";
import SubjectClassInput from "./TeachersAssignments";
import TimetableView from "./Timetable";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { screen } = state;

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  return (
    <div className="h-screen w-full bg-base-100 flex flex-col overflow-hidden text-base-content relative">
      <div className="shrink-0 z-50">
        <Navbar 
          toggleLeft={() => setIsLeftOpen(!isLeftOpen)}
          toggleRight={() => setIsRightOpen(!isRightOpen)}
          isLeftOpen={isLeftOpen}
          isRightOpen={isRightOpen}
        />
      </div>

      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left Sidebar */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out h-full overflow-y-auto overflow-x-hidden border-r border-[color-mix(in_srgb,var(--color-base-content)_8%,transparent)] z-40 bg-base-100 ${
            isLeftOpen ? "w-[260px] lg:w-[300px]" : "w-[80px]"
          }`}
        >
          <LeftSidebar state={state} dispatch={dispatch} screen={screen} isCollapsed={!isLeftOpen} />
        </div>

        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto min-w-0 p-6 lg:p-10 z-10 bg-base-200">
          <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto pb-24">
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
                classPrefix={state.validation.classRange.prefix}
                allowedSubjects={state.validation.subjectsSelected}
              />
            )}

            {screen === "summary" && (
              <Summary state={state} dispatch={dispatch} teachers={state.teachers} />
            )}

            {screen === "timetable-generated" && (
              <TimetableView timetable={state.generatedTimetable} dispatch={dispatch} />
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out h-full overflow-y-auto overflow-x-hidden border-l border-[color-mix(in_srgb,var(--color-base-content)_8%,transparent)] z-40 bg-base-100 ${
            isRightOpen ? "w-[280px] lg:w-[320px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <RightSidebar state={state} />
        </div>
      </div>
    </div>
  );
}
