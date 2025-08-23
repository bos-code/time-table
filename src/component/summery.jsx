import React from "react";
import { FaFileExport, FaPrint, FaArrowLeft } from "react-icons/fa";
import NeumorphicCard from "./neuCard";
import {
  handleEditTeacher,
  handleRemoveTeacher,
  handleEditSubject,
  handleRemoveSubject,
} from "../utils/useSwal"; 
import TeacherCard from "./TeacherCard"; 
import SubjectRow from "./subjectRow";
import ActionButtons from "../features/tableAction";
import { downloadJSON, exportCSV, printMovementBook } from "../utils/SummeryUtils";
import { sendTestJson } from "./api"; 


export default function Summary({ teachers, subjects, goBack }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold">Summary</h1>
      </div>

      {/* Teachers Section */}
      <NeumorphicCard>
        <h2 className="text-xl font-semibold mb-4">Teachers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={() => handleEditTeacher(teacher)}
              onRemove={() => handleRemoveTeacher(teacher.id)}
            />
          ))}
        </div>
      </NeumorphicCard>

      {/* Subjects Section */}
      <NeumorphicCard>
        <h2 className="text-xl font-semibold mb-4">Subjects</h2>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <SubjectRow
              key={subject.id}
              subject={subject}
              onEdit={() => handleEditSubject(subject)}
              onRemove={() => handleRemoveSubject(subject.id)}
            />
          ))}
        </div>
      </NeumorphicCard>

      {/* Action Buttons */}
      <NeumorphicCard>
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButtons
            icon={<FaFileExport />}
            label="Export JSON"
            onClick={() => downloadJSON({ teachers, subjects })}
          />
          <ActionButtons
            icon={<FaFileExport />}
            label="Export CSV"
            onClick={() => exportCSV({ teachers, subjects })}
          />
          <ActionButtons
            icon={<FaPrint />}
            label="Print Movement Book"
            onClick={() => printMovementBook({ teachers, subjects })}
          />
          <ActionButtons
            icon={<FaFileExport />}
            label="Send to Backend"
            onClick={() => sendTestJson({ teachers, subjects })}
          />
        </div>
      </NeumorphicCard>
    </div>
  );
}
