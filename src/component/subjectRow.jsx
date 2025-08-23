import React from "react";

export default function SubjectRow({ subject, onEdit, onRemove }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-md bg-gray-100">
      <span className="font-medium">{subject.name}</span>
      <div className="space-x-3">
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
    