from sqlalchemy.orm import Session
import crud, schemas
from ortools.sat.python import cp_model

def generate_timetable(db: Session):
    teachers = crud.get_teachers(db)
    subjects = crud.get_subjects(db)
    classes = crud.get_classes(db)
    periods = crud.get_periods(db)

    if not teachers or not subjects or not classes or not periods:
        return None

    model = cp_model.CpModel()

    # Variables: assignment[class][period] = subject
    assignment = {}
    for c in classes:
        for p in periods:
            for s in subjects:
                assignment[(c.id, p.id, s.id)] = model.NewBoolVar(
                    f"c{c.id}_p{p.id}_s{s.id}"
                )

    # Constraints: one subject per class per period
    for c in classes:
        for p in periods:
            model.Add(sum(assignment[(c.id, p.id, s.id)] for s in subjects) <= 1)

    # Constraints: teacher cannot be in 2 places at once
    for t in teachers:
        for p in periods:
            model.Add(
                sum(
                    assignment[(c.id, p.id, s.id)]
                    for c in classes
                    for s in subjects
                    if s.teacher_id == t.id
                )
                <= 1
            )

    # Objective (not required but helps solver): distribute evenly
    model.Maximize(
        sum(assignment.values())
    )

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        return None

    # Clear existing timetable
    existing = crud.get_timetable(db)
    for e in existing:
        db.delete(e)
    db.commit()

    # Save results
    results = []
    for c in classes:
        for p in periods:
            for s in subjects:
                if solver.Value(assignment[(c.id, p.id, s.id)]) == 1:
                    entry = schemas.TimetableEntryCreate(
                        class_id=c.id,
                        subject_id=s.id,
                        teacher_id=s.teacher_id,
                        period_id=p.id,
                    )
                    saved = crud.create_timetable_entry(db, entry)
                    results.append(saved)

    return results
