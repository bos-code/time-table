from fastapi import FastAPI
from typing import List
from models import Teacher, Subject, SchoolClass, Period, TimetableEntry

app = FastAPI()

# In-memory storage (later we can use DB)
teachers: List[Teacher] = []
subjects: List[Subject] = []
classes: List[SchoolClass] = []
periods: List[Period] = []
timetable: List[TimetableEntry] = []

# --- Teachers ---
@app.post("/teachers")
def add_teacher(teacher: Teacher):
    teachers.append(teacher)
    return {"message": "Teacher added", "teacher": teacher}

@app.get("/teachers")
def get_teachers():
    return teachers

# --- Subjects ---
@app.post("/subjects")
def add_subject(subject: Subject):
    subjects.append(subject)
    return {"message": "Subject added", "subject": subject}

@app.get("/subjects")
def get_subjects():
    return subjects

# --- Classes ---
@app.post("/classes")
def add_class(school_class: SchoolClass):
    classes.append(school_class)
    return {"message": "Class added", "class": school_class}

@app.get("/classes")
def get_classes():
    return classes

# --- Periods ---
@app.post("/periods")
def add_period(period: Period):
    periods.append(period)
    return {"message": "Period added", "period": period}

@app.get("/periods")
def get_periods():
    return periods

# --- Timetable (for later, after generation) ---
@app.get("/timetable")
def get_timetable():
    return timetable
