import React, { useState } from "react";
import NeumorphicCard from "./neuCard";

export default function TeacherInput({ dispatch, teachers }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a teacher name first.");
      return;
    }

    const hasDuplicate = teachers.some(
      (teacher) => teacher.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (hasDuplicate) {
      setError("Teacher names need to be unique for the solver.");
      return;
    }

    dispatch({ type: "ADD_TEACHER", payload: trimmedName });
    setName("");
    setError("");
  }

  return (
    <NeumorphicCard>
      <div className="mb-5">
        <h2 className="text-xl font-bold">Enter Teacher Names</h2>
        <p className="ui-inline-note mt-1">
          Start with the teaching staff. Each name should be unique so the solver can
          track timetable clashes properly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className="ui-input flex-1"
          placeholder="Teacher Name"
        />
        <button type="submit" className="ui-button ui-button-primary sm:min-w-32">
          Add
        </button>
      </form>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <ul className="mb-5 space-y-2">
        {teachers.map((teacher, index) => (
          <li
            key={`${teacher.name}-${index}`}
            className="ui-surface-card text-sm font-medium"
          >
            {teacher.name}
          </li>
        ))}
      </ul>

      {teachers.length > 0 && (
        <button
          onClick={() => dispatch({ type: "CONFIRM_TEACHERS" })}
          className="ui-button ui-button-secondary w-full"
        >
          Confirm
        </button>
      )}
    </NeumorphicCard>
  );
}
