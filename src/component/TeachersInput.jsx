import React, { useState } from "react";
import NeumorphicCard from "./neuCard";

export default function TeacherInput({ dispatch, teachers }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: "ADD_TEACHER", payload: name.trim() });
    setName("");
  }

  return (
    <NeumorphicCard>
      <h2 className="text-xl font-bold mb-4">Enter Teacher Names</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border-none outline-none shadow-inner"
          placeholder="Teacher Name"
        />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">
          Add
        </button>
      </form>

      <ul className="mb-4">
        {teachers.map((t, idx) => (
          <li key={idx} className="mb-1">
            • {t.name}
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
