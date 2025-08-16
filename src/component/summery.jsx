import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Summary({ teachers, dispatch }) {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Summary</h2>

      {/* Teachers grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher, tIdx) => (
          <div
            key={tIdx}
            className="p-5 rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Teacher Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                {teacher.name}
              </h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    dispatch({
                      type: "EDIT_TEACHER",
                      payload: {
                        index: tIdx,
                        name: prompt("Edit teacher name:", teacher.name),
                      },
                    })
                  }
                  className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_TEACHER", payload: tIdx })
                  }
                  className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Subjects */}
            <div className="mt-4 space-y-3">
              {teacher.subjects.map((subj, sIdx) => (
                <div
                  key={sIdx}
                  className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all group"
                >
                  <span className="text-gray-700 font-medium">
                    {subj.subject}{" "}
                    <span className="text-gray-500">- {subj.class}</span>
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "EDIT_SUBJECT",
                          payload: {
                            teacherIndex: tIdx,
                            subjectIndex: sIdx,
                            subject: prompt("Edit subject:", subj.subject),
                            class: prompt("Edit class:", subj.class),
                          },
                        })
                      }
                      className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "REMOVE_SUBJECT",
                          payload: { teacherIndex: tIdx, subjectIndex: sIdx },
                        })
                      }
                      className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
