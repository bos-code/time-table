from sqlalchemy.orm import Session
import models, schemas

# -------- Teacher --------
def create_teacher(db: Session, teacher: schemas.TeacherCreate):
    db_teacher = models.Teacher(name=teacher.name)
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def get_teachers(db: Session):
    return db.query(models.Teacher).all()

# -------- Subject --------
def create_subject(db: Session, subject: schemas.SubjectCreate):
    db_subject = models.Subject(name=subject.name, teacher_id=subject.teacher_id)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def get_subjects(db: Session):
    return db.query(models.Subject).all()

# -------- Class --------
def create_class(db: Session, class_: schemas.ClassCreate):
    db_class = models.Class(name=class_.name)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def get_classes(db: Session):
    return db.query(models.Class).all()

# -------- Period --------
def create_period(db: Session, period: schemas.PeriodCreate):
    db_period = models.Period(day=period.day, slot=period.slot)
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    return db_period

def get_periods(db: Session):
    return db.query(models.Period).all()

# -------- Timetable --------
def create_timetable_entry(db: Session, entry: schemas.TimetableEntryCreate):
    db_entry = models.TimetableEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_timetable(db: Session):
    return db.query(models.TimetableEntry).all()
