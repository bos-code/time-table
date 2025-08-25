from pydantic import BaseModel

# -------- Teacher --------
class TeacherBase(BaseModel):
    name: str

class TeacherCreate(TeacherBase):
    pass

class Teacher(TeacherBase):
    id: int
    class Config:
        orm_mode = True

# -------- Subject --------
class SubjectBase(BaseModel):
    name: str
    teacher_id: int

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    id: int
    class Config:
        orm_mode = True

# -------- Class --------
class ClassBase(BaseModel):
    name: str

class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: int
    class Config:
        orm_mode = True

# -------- Period --------
class PeriodBase(BaseModel):
    day: str
    slot: int

class PeriodCreate(PeriodBase):
    pass

class Period(PeriodBase):
    id: int
    class Config:
        orm_mode = True

# -------- Timetable Entry --------
class TimetableEntryBase(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: int
    period_id: int

class TimetableEntryCreate(TimetableEntryBase):
    pass

class TimetableEntry(TimetableEntryBase):
    id: int
    class Config:
        orm_mode = True
    