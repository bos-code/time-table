// components/Toolbar.jsx
import React from "react";
import {
  handlePrintMovementBook,
  handleGenerateTimetable,
  handleDeleteTimetable,
} from "../features/tableAction ";

const Toolbar = () => {
  return (
    <div className="toolbar">
      <button onClick={handlePrintMovementBook}>Print Movement Book</button>
      <button onClick={handleGenerateTimetable}>Generate Timetable</button>
      <button onClick={handleDeleteTimetable}>Delete Timetable</button>
    </div>
  );
};

export default Toolbar;
