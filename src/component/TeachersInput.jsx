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
      <h2 className="text-xl font-bold mb-4">Enter Teacher Names</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className="flex-1 px-3 py-2 rounded-lg border-none outline-none shadow-inner"
          placeholder="Teacher Name"
        />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">
          Add
        </button>
      </form>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <ul className="mb-4 space-y-1">
        {teachers.map((teacher, index) => (
          <li key={`${teacher.name}-${index}`} className="text-sm">
            - {teacher.name}
          </li>
        ))}
      </ul>

      {teachers.length > 0 && (
        <button
          onClick={() => dispatch({ type: "CONFIRM_TEACHERS" })}
          className="w-full py-2 bg-blue-500 text-white rounded-lg"
        >
          Confirm
        </button>
      )}
    </NeumorphicCard>
  );
}
