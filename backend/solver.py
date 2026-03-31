from __future__ import annotations

from collections import Counter, defaultdict
from math import ceil

from ortools.sat.python import cp_model


class SolverError(ValueError):
  pass


DEFAULT_DAYS = [
  {"id": "mon", "label": "Monday", "enabled": True},
  {"id": "tue", "label": "Tuesday", "enabled": True},
  {"id": "wed", "label": "Wednesday", "enabled": True},
  {"id": "thu", "label": "Thursday", "enabled": True},
  {"id": "fri", "label": "Friday", "enabled": True},
]


def generate_timetable(payload: dict) -> dict:
  teachers = payload.get("teachers") or []
  validation = payload.get("validation") or {}

  days = validation.get("days") or DEFAULT_DAYS
  enabled_days = [day for day in days if day.get("enabled", True)]
  periods = validation.get("periods") or []
  teaching_periods = [
    {
      "id": period["id"],
      "label": period["label"],
      "start": period["start"],
      "end": period["end"],
    }
    for period in periods
    if period.get("type") == "teaching"
  ]

  if not enabled_days:
    raise SolverError("Enable at least one school day before generating a timetable.")
  if not teaching_periods:
    raise SolverError("Add at least one teaching period before generating a timetable.")

  lessons = []
  teacher_names = []
  seen_teacher_names = set()
  class_names = set()
  teacher_loads = Counter()
  class_loads = Counter()
  subject_class_loads = Counter()

  for teacher_index, teacher in enumerate(teachers):
    teacher_name = str(teacher.get("name", "")).strip()
    if not teacher_name:
      raise SolverError("Every teacher needs a name.")
    if teacher_name.lower() in seen_teacher_names:
      raise SolverError(
        f'Teacher name "{teacher_name}" is duplicated. Teacher names must be unique.'
      )

    teacher_names.append(teacher_name)
    seen_teacher_names.add(teacher_name.lower())
    for assignment_index, assignment in enumerate(teacher.get("subjects") or []):
      subject = str(assignment.get("subject", "")).strip()
      class_name = str(
        assignment.get("class") or assignment.get("className") or ""
      ).strip()
      lessons_per_week = int(assignment.get("lessonsPerWeek") or 0)

      if not subject or not class_name:
        raise SolverError("Each assignment requires a subject and class.")
      if lessons_per_week < 1:
        raise SolverError(
          f"{teacher_name} -> {subject} / {class_name} needs at least one lesson."
        )

      teacher_loads[teacher_name] += lessons_per_week
      class_loads[class_name] += lessons_per_week
      subject_class_loads[(class_name, subject)] += lessons_per_week
      class_names.add(class_name)

      for lesson_number in range(lessons_per_week):
        lessons.append(
          {
            "id": f"lesson_{teacher_index}_{assignment_index}_{lesson_number}",
            "teacher": teacher_name,
            "subject": subject,
            "className": class_name,
            "subjectClassKey": f"{class_name}::{subject}",
          }
        )

  if not lessons:
    raise SolverError(
      "Add at least one subject assignment with lessons per week before generating a timetable."
    )

  weekly_capacity = len(enabled_days) * len(teaching_periods)
  overloaded_teachers = [
    f"{teacher}: {load}"
    for teacher, load in teacher_loads.items()
    if load > weekly_capacity
  ]
  if overloaded_teachers:
    joined = ", ".join(overloaded_teachers)
    raise SolverError(
      f"Some teachers exceed the weekly slot capacity of {weekly_capacity}: {joined}."
    )

  overloaded_classes = [
    f"{class_name}: {load}"
    for class_name, load in class_loads.items()
    if load > weekly_capacity
  ]
  if overloaded_classes:
    joined = ", ".join(overloaded_classes)
    raise SolverError(
      f"Some classes exceed the weekly slot capacity of {weekly_capacity}: {joined}."
    )

  slots = []
  for day_index, day in enumerate(enabled_days):
    for period_index, period in enumerate(teaching_periods):
      slots.append(
        {
          "id": f"{day['id']}::{period['id']}",
          "dayId": day["id"],
          "day": day["label"],
          "dayIndex": day_index,
          "periodId": period["id"],
          "period": period["label"],
          "periodIndex": period_index,
          "start": period["start"],
          "end": period["end"],
          "edgePenalty": 1
          if period_index in {0, len(teaching_periods) - 1}
          else 0,
        }
      )

  model = cp_model.CpModel()
  lesson_slot = {}
  teacher_slot_vars = defaultdict(list)
  class_slot_vars = defaultdict(list)
  teacher_day_vars = defaultdict(list)
  class_day_vars = defaultdict(list)
  subject_class_day_vars = defaultdict(list)
  edge_slot_penalties = []

  for lesson in lessons:
    lesson_variables = []
    for slot in slots:
      variable = model.NewBoolVar(f"{lesson['id']}__{slot['id']}")
      lesson_slot[(lesson["id"], slot["id"])] = variable
      lesson_variables.append(variable)
      teacher_slot_vars[(lesson["teacher"], slot["id"])].append(variable)
      class_slot_vars[(lesson["className"], slot["id"])].append(variable)
      teacher_day_vars[(lesson["teacher"], slot["dayId"])].append(variable)
      class_day_vars[(lesson["className"], slot["dayId"])].append(variable)
      subject_class_day_vars[(lesson["subjectClassKey"], slot["dayId"])].append(
        variable
      )
      if slot["edgePenalty"]:
        edge_slot_penalties.append(variable)

    model.AddExactlyOne(lesson_variables)

  for variables in teacher_slot_vars.values():
    model.Add(sum(variables) <= 1)

  for variables in class_slot_vars.values():
    model.Add(sum(variables) <= 1)

  duplicate_penalties = []
  for (subject_class_key, day_id), variables in subject_class_day_vars.items():
    total_group_lessons = subject_class_loads[
      tuple(subject_class_key.split("::", maxsplit=1))
    ]
    if total_group_lessons <= 1:
      continue

    lesson_count = model.NewIntVar(
      0, total_group_lessons, f"count_{subject_class_key}_{day_id}"
    )
    model.Add(lesson_count == sum(variables))

    day_used = model.NewBoolVar(f"used_{subject_class_key}_{day_id}")
    model.Add(lesson_count >= day_used)
    model.Add(lesson_count <= total_group_lessons * day_used)

    duplicate_penalty = model.NewIntVar(
      0, total_group_lessons - 1, f"dup_{subject_class_key}_{day_id}"
    )
    model.Add(duplicate_penalty == lesson_count - day_used)
    duplicate_penalties.append(duplicate_penalty)

  teacher_overload_penalties = []
  for teacher_name, load in teacher_loads.items():
    target = max(1, ceil(load / len(enabled_days)))
    for day in enabled_days:
      count = model.NewIntVar(
        0, len(teaching_periods), f"teacher_day_{teacher_name}_{day['id']}"
      )
      model.Add(count == sum(teacher_day_vars[(teacher_name, day["id"])]))

      overload = model.NewIntVar(
        0, len(teaching_periods), f"teacher_over_{teacher_name}_{day['id']}"
      )
      model.Add(overload >= count - target)
      teacher_overload_penalties.append(overload)

  class_overload_penalties = []
  for class_name, load in class_loads.items():
    target = max(1, ceil(load / len(enabled_days)))
    for day in enabled_days:
      count = model.NewIntVar(
        0, len(teaching_periods), f"class_day_{class_name}_{day['id']}"
      )
      model.Add(count == sum(class_day_vars[(class_name, day["id"])]))

      overload = model.NewIntVar(
        0, len(teaching_periods), f"class_over_{class_name}_{day['id']}"
      )
      model.Add(overload >= count - target)
      class_overload_penalties.append(overload)

  model.Minimize(
    60 * sum(duplicate_penalties)
    + 10 * sum(teacher_overload_penalties)
    + 6 * sum(class_overload_penalties)
    + sum(edge_slot_penalties)
  )

  solver = cp_model.CpSolver()
  solver.parameters.max_time_in_seconds = 20
  solver.parameters.num_search_workers = 8
  status = solver.Solve(model)

  if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    raise SolverError(
      "No feasible timetable was found. Try lowering lessons per week or enabling more teaching slots."
    )

  scheduled_rows = []
  for lesson in lessons:
    for slot in slots:
      if solver.BooleanValue(lesson_slot[(lesson["id"], slot["id"])]):
        scheduled_rows.append(
          {
            "teacher": lesson["teacher"],
            "className": lesson["className"],
            "subject": lesson["subject"],
            "day": slot["day"],
            "dayId": slot["dayId"],
            "dayIndex": slot["dayIndex"],
            "period": slot["period"],
            "periodId": slot["periodId"],
            "periodIndex": slot["periodIndex"],
            "start": slot["start"],
            "end": slot["end"],
          }
        )
        break

  scheduled_rows.sort(
    key=lambda row: (
      row["dayIndex"],
      row["periodIndex"],
      row["className"],
      row["subject"],
      row["teacher"],
    )
  )

  public_assignments = [
    {
      "teacher": row["teacher"],
      "className": row["className"],
      "subject": row["subject"],
      "day": row["day"],
      "period": row["period"],
      "start": row["start"],
      "end": row["end"],
    }
    for row in scheduled_rows
  ]

  return {
    "meta": {
      "solverStatus": solver.StatusName(status),
      "objectiveValue": int(round(solver.ObjectiveValue())),
      "teacherCount": len(teachers),
      "classCount": len(class_names),
      "lessonsScheduled": len(public_assignments),
      "dayCount": len(enabled_days),
    },
    "assignments": public_assignments,
    "scheduleByClass": _build_schedule_view(
      entity_names=sorted(class_names),
      rows=scheduled_rows,
      enabled_days=enabled_days,
      teaching_periods=teaching_periods,
      entity_key="className",
      secondary_label_key="teacher",
    ),
    "scheduleByTeacher": _build_schedule_view(
      entity_names=teacher_names,
      rows=scheduled_rows,
      enabled_days=enabled_days,
      teaching_periods=teaching_periods,
      entity_key="teacher",
      secondary_label_key="className",
    ),
  }


def _build_schedule_view(
  *,
  entity_names: list[str],
  rows: list[dict],
  enabled_days: list[dict],
  teaching_periods: list[dict],
  entity_key: str,
  secondary_label_key: str,
) -> list[dict]:
  by_entity = defaultdict(dict)
  for row in rows:
    by_entity[row[entity_key]][(row["dayId"], row["periodId"])] = row

  schedule = []
  for entity_name in entity_names:
    table_rows = []
    for period in teaching_periods:
      cells = []
      for day in enabled_days:
        row = by_entity.get(entity_name, {}).get((day["id"], period["id"]))
        cells.append(
          {
            "day": {"id": day["id"], "label": day["label"]},
            "entry": None
            if row is None
            else {
              "subject": row["subject"],
              "secondaryLabel": row[secondary_label_key],
            },
          }
        )

      table_rows.append(
        {
          "period": {
            "id": period["id"],
            "label": period["label"],
            "start": period["start"],
            "end": period["end"],
          },
          "cells": cells,
        }
      )

    schedule.append(
      {
        "name": entity_name,
        "days": [{"id": day["id"], "label": day["label"]} for day in enabled_days],
        "rows": table_rows,
      }
    )

  return schedule
