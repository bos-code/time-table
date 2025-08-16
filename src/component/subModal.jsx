import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubjectEditModal({
  isOpen,
  onClose,
  onSave,
  subjectData,
}) {
  const [subject, setSubject] = useState(subjectData?.subject || "");
  const [className, setClassName] = useState(subjectData?.class || "");

  const handleSave = () => {
    if (subject.trim() && className.trim()) {
      onSave({ subject: subject.trim(), class: className.trim() });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-xl w-[300px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h3 className="text-lg font-bold mb-4">Edit Subject</h3>
            <input
              type="text"
              placeholder="Subject"
              className="border rounded px-3 py-2 w-full mb-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              type="text"
              placeholder="Class (Year 1, Year 2...)"
              className="border rounded px-3 py-2 w-full"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-300"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-blue-500 text-white"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
