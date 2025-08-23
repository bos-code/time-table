from pydantic import BaseModel
from typing import List, Optional

class Teacher(BaseModel):
    id: int
    name: str
    subjects: List[str]
    availability: Optional[List[str]] = None

class Subject(BaseModel):
    id: int
    name: str
    periods_per_week: int

class SchoolClass(BaseModel):
    id: int
    name: str
    subjects: List[str]

class Period(BaseModel):
    id: int
    day: str
    time: str

class TimetableEntry(BaseModel):
    class_name: str
    subject: str
    teacher: str
    day: str
    time: str
