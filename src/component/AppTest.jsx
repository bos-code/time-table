// AppTest.jsx
import React, { useReducer } from "react";
import Summary from "./summery";
import "sweetalert2/dist/sweetalert2.min.css";

const initialTeachers = [
  {
    name: "Chidera",
    subjects: [
      { subject: "Maths", class: "Year 7" },
      { subject: "English", class: "Year 5" },
    ],
  },
  { name: "Mr Peter", subjects: [{ subject: "Verbal", class: "Year 10" }] },
];

function reducer(state, action) {
  switch (action.type) {
    case "EDIT_TEACHER": {
      const { index, name } = action.payload;
      return state.map((t, i) =>
        i === index ? { ...t, name: name ?? t.name } : t
      );
    }
    case "REMOVE_TEACHER": {
      const idx = action.payload;
      return state.filter((_, i) => i !== idx);
    }
    case "EDIT_SUBJECT": {
      const {
        teacherIndex,
        subjectIndex,
        subject,
        class: className,
      } = action.payload;
      return state.map((t, ti) =>
        ti === teacherIndex
          ? {
              ...t,
              subjects: t.subjects.map((s, si) =>
                si === subjectIndex
                  ? {
                      subject: subject ?? s.subject,
                      class: className ?? s.class,
                    }
                  : s
              ),
            }
          : t
      );
    }
    case "REMOVE_SUBJECT": {
      const { teacherIndex, subjectIndex } = action.payload;
      return state.map((t, ti) =>
        ti === teacherIndex
          ? {
              ...t,
              subjects: t.subjects.filter((_, si) => si !== subjectIndex),
            }
          : t
      );
    }
    default:
      return state;
  }
}

export default function AppTest() {
  const [teachers, dispatch] = useReducer(reducer, initialTeachers);

  return (
    <div className="min-h-screen flex items-start justify-center p-8 bg-base-200">
      <Summary teachers={teachers} dispatch={dispatch} />
    </div>
  );
}
