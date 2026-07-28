import React, { useEffect, useReducer, useState } from "react";
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

const STORAGE_KEY = "timetink-state-v1";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.teachers)) {
      return null;
    }
    // Generation status is a live request state, never something to restore.
    return { ...parsed, generation: { loading: false, error: null } };
  } catch {
    return null;
  }
}

function initState(defaultState) {
  return loadPersistedState() || defaultState;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState, initState);
  const { screen } = state;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota) - not fatal.
    }
  }, [state]);

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // On phones/tablets both sidebars start as closed off-canvas drawers so the
  // main content is usable on first load; lg+ keeps the existing push layout.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsLeftOpen(false);
      setIsRightOpen(false);
    }
  }, []);

  const closeDrawers = () => {
    setIsLeftOpen(false);
    setIsRightOpen(false);
  };

  return (
    <div className="app-shell h-screen w-full bg-base-100 flex flex-col overflow-hidden text-base-content relative">
      <div className="shrink-0 z-50 no-print">
        <Navbar
          toggleLeft={() => setIsLeftOpen(!isLeftOpen)}
          toggleRight={() => setIsRightOpen(!isRightOpen)}
          isLeftOpen={isLeftOpen}
          isRightOpen={isRightOpen}
        />
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Mobile/tablet backdrop for off-canvas drawers */}
        {(isLeftOpen || isRightOpen) && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden no-print"
            onClick={closeDrawers}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar */}
        <div
          className={`no-print fixed lg:static inset-y-0 lg:inset-auto left-0 top-0 lg:top-auto shrink-0 transition-all duration-300 ease-in-out h-full overflow-y-auto overflow-x-hidden border-r border-[color-mix(in_srgb,var(--color-base-content)_8%,transparent)] z-50 lg:z-40 bg-base-100 shadow-2xl lg:shadow-none ${
            isLeftOpen
              ? "translate-x-0 w-[260px] sm:w-[300px] lg:w-[300px]"
              : "-translate-x-full lg:translate-x-0 w-[260px] sm:w-[300px] lg:w-[80px]"
          }`}
        >
          <LeftSidebar state={state} dispatch={dispatch} screen={screen} isCollapsed={!isLeftOpen} />
        </div>

        {/* Main Content */}
        <main className="app-main flex-1 h-full overflow-y-auto min-w-0 w-full p-4 sm:p-6 lg:p-10 z-10 bg-base-200">
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 w-full max-w-5xl mx-auto pb-24">
            <div className="no-print">
              <ProgressTracker
                totalTeachers={state.teachers.length}
                currentIndex={state.currentTeacherIndex}
                screen={screen}
              />
            </div>

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
                allTeachers={state.teachers}
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
          className={`no-print fixed lg:static inset-y-0 lg:inset-auto right-0 top-0 lg:top-auto shrink-0 transition-all duration-300 ease-in-out h-full overflow-y-auto overflow-x-hidden border-l border-[color-mix(in_srgb,var(--color-base-content)_8%,transparent)] z-50 lg:z-40 bg-base-100 shadow-2xl lg:shadow-none ${
            isRightOpen
              ? "translate-x-0 w-[280px] sm:w-[320px] lg:w-[320px] opacity-100"
              : "translate-x-full lg:translate-x-0 w-[280px] sm:w-[320px] lg:w-0 opacity-100 lg:opacity-0"
          }`}
        >
          <RightSidebar state={state} />
        </div>
      </div>
    </div>
  );
}
