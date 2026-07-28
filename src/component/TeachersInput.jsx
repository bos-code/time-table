import React, { useState } from "react";
import { FaPlus, FaPencilAlt, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import NeumorphicCard from "./neuCard";
import { confirmAction } from "../utils/useSwal";

export default function TeacherInput({ dispatch, teachers }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState("");

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkNote, setBulkNote] = useState("");

  function isDuplicate(candidate, excludeIndex = -1) {
    return teachers.some(
      (teacher, index) =>
        index !== excludeIndex &&
        teacher.name.toLowerCase() === candidate.toLowerCase()
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a teacher name first.");
      return;
    }

    if (isDuplicate(trimmedName)) {
      setError("Teacher names need to be unique for the solver.");
      return;
    }

    dispatch({ type: "ADD_TEACHER", payload: trimmedName });
    setName("");
    setError("");
  }

  function startEdit(index) {
    setEditingIndex(index);
    setEditingName(teachers[index]?.name ?? "");
    setEditError("");
  }

  function cancelEdit() {
    setEditingIndex(-1);
    setEditingName("");
    setEditError("");
  }

  function saveEdit(index) {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setEditError("Name can't be empty.");
      return;
    }
    if (isDuplicate(trimmedName, index)) {
      setEditError("Another teacher already has that name.");
      return;
    }

    dispatch({ type: "EDIT_TEACHER", payload: { index, name: trimmedName } });
    cancelEdit();
  }

  async function removeTeacher(index) {
    const teacher = teachers[index];
    if (!teacher) {
      return;
    }

    const assignmentCount = teacher.subjects?.length || 0;
    const confirmed = await confirmAction({
      title: `Remove ${teacher.name}?`,
      text:
        assignmentCount > 0
          ? `This also deletes their ${assignmentCount} subject assignment${
              assignmentCount === 1 ? "" : "s"
            }. This can't be undone.`
          : "This can't be undone.",
      confirmText: "Remove",
      danger: true,
    });

    if (confirmed) {
      dispatch({ type: "REMOVE_TEACHER", payload: { index } });
    }
  }

  function handleBulkAdd() {
    const rawNames = bulkText
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    const existingLower = new Set(teachers.map((t) => t.name.toLowerCase()));
    const seen = new Set();
    const toAdd = [];
    let skipped = 0;

    for (const candidate of rawNames) {
      const key = candidate.toLowerCase();
      if (existingLower.has(key) || seen.has(key)) {
        skipped += 1;
        continue;
      }
      seen.add(key);
      toAdd.push(candidate);
    }

    toAdd.forEach((teacherName) =>
      dispatch({ type: "ADD_TEACHER", payload: teacherName })
    );

    setBulkText("");
    setBulkOpen(toAdd.length === 0);
    setBulkNote(
      toAdd.length === 0
        ? "No new names to add - check for duplicates."
        : `Added ${toAdd.length} teacher${toAdd.length === 1 ? "" : "s"}.` +
          (skipped > 0 ? ` Skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}.` : "")
    );
  }

  return (
    <NeumorphicCard>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Enter Teacher Names</h2>
          <p className="ui-inline-note mt-1">
            Start with the teaching staff. Each name should be unique so the solver can
            track timetable clashes properly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen((open) => !open)}
          className="ui-button ui-button-soft ui-button-sm shrink-0"
        >
          {bulkOpen ? "Single Entry" : "Paste Multiple"}
        </button>
      </div>

      {bulkOpen ? (
        <div className="mb-4 flex flex-col gap-2">
          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder={"One name per line, or comma-separated\ne.g. Jane Doe, John Smith"}
            className="ui-input min-h-28"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBulkAdd}
              className="ui-button ui-button-primary"
              disabled={!bulkText.trim()}
            >
              <FaPlus className="inline mr-2" />
              Add All
            </button>
            {bulkNote && <span className="text-sm ui-copy-muted">{bulkNote}</span>}
          </div>
        </div>
      ) : (
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
      )}

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <ul className="mb-5 space-y-2">
        {teachers.map((teacher, index) => {
          const isEditing = index === editingIndex;
          return (
            <li
              key={`${teacher.name}-${index}`}
              className="ui-surface-card text-sm font-medium flex flex-col gap-2"
            >
              {isEditing ? (
                <>
                  <div className="flex items-center gap-3">
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveEdit(index);
                        }
                        if (event.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      className="ui-input flex-1"
                      aria-label={`Edit name for ${teacher.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(index)}
                      aria-label="Save name"
                      className="ui-button ui-button-primary ui-button-sm"
                    >
                      <FaCheck />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      aria-label="Cancel edit"
                      className="ui-button ui-button-soft ui-button-sm"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  {editError && <div className="text-sm text-red-600">{editError}</div>}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex-1 truncate">{teacher.name}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    aria-label={`Edit ${teacher.name}`}
                    className="ui-button ui-button-soft ui-button-sm"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTeacher(index)}
                    aria-label={`Remove ${teacher.name}`}
                    className="ui-button ui-button-danger ui-button-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </li>
          );
        })}
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
