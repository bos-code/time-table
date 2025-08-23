import React from "react";

export default function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow bg-white hover:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
