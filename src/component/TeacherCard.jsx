import React from "react";

export default function TeacherCard({ teacher, onEdit, onRemove }) {
  return (
    <div className="p-4 rounded-lg shadow bg-white flex flex-col">
      <h3 className="text-lg font-semibold">{teacher.name}</h3>
      <p className="text-sm text-gray-600">{teacher.subject}</p>
      <div className="flex justify-between mt-3">
        <button onClick={onEdit} className="text-blue-600 hover:underline">
          Edit
        </button>
        <button onClick={onRemove} className="text-red-600 hover:underline">
          Remove
        </button>
      </div>
    </div>
  );
}
