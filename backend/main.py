from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, crud, schemas
from services.timetable_generator import generate_timetable

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Timetable Generator API")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------- Teachers --------
@app.post("/teachers/", response_model=schemas.Teacher)
def create_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    return crud.create_teacher(db=db, teacher=teacher)

@app.get("/teachers/", response_model=list[schemas.Teacher])
def get_teachers(db: Session = Depends(get_db)):
    return crud.get_teachers(db)

# -------- Subjects --------
@app.post("/subjects/", response_model=schemas.Subject)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    return crud.create_subject(db=db, subject=subject)

@app.get("/subjects/", response_model=list[schemas.Subject])
def get_subjects(db: Session = Depends(get_db)):
    return crud.get_subjects(db)

# -------- Classes --------
@app.post("/classes/", response_model=schemas.Class)
def create_class(class_: schemas.ClassCreate, db: Session = Depends(get_db)):
    return crud.create_class(db=db, class_=class_)

@app.get("/classes/", response_model=list[schemas.Class])
def get_classes(db: Session = Depends(get_db)):
    return crud.get_classes(db)

# -------- Periods --------
@app.post("/periods/", response_model=schemas.Period)
def create_period(period: schemas.PeriodCreate, db: Session = Depends(get_db)):
    return crud.create_period(db=db, period=period)

@app.get("/periods/", response_model=list[schemas.Period])
def get_periods(db: Session = Depends(get_db)):
    return crud.get_periods(db)

# -------- Timetable --------
@app.post("/timetable/generate")
def generate_timetable_api(db: Session = Depends(get_db)):
    result = generate_timetable(db)
    if not result:
        raise HTTPException(status_code=400, detail="Could not generate timetable")
    return result

@app.get("/timetable/", response_model=list[schemas.TimetableEntry])
def get_timetable(db: Session = Depends(get_db)):
    return crud.get_timetable(db)
