from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .solver import SolverError, generate_timetable


class DayModel(BaseModel):
  id: str
  label: str
  enabled: bool = True

  @field_validator("id", "label")
  @classmethod
  def strip_required_text(cls, value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
      raise ValueError("Day values cannot be empty.")
    return cleaned


class PeriodModel(BaseModel):
  id: str
  label: str
  start: str
  end: str
  type: Literal["teaching", "non-teaching"] = "teaching"

  @field_validator("id", "label", "start", "end")
  @classmethod
  def strip_required_text(cls, value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
      raise ValueError("Period values cannot be empty.")
    return cleaned


class SubjectAssignmentModel(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  subject: str
  class_name: str = Field(alias="class")
  lessons_per_week: int = Field(alias="lessonsPerWeek", ge=1, le=20)

  @field_validator("subject", "class_name")
  @classmethod
  def strip_required_text(cls, value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
      raise ValueError("Subject assignments require a subject and class.")
    return cleaned


class TeacherModel(BaseModel):
  name: str
  subjects: list[SubjectAssignmentModel] = Field(default_factory=list)

  @field_validator("name")
  @classmethod
  def strip_name(cls, value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
      raise ValueError("Teacher names cannot be empty.")
    return cleaned


class ValidationModel(BaseModel):
  days: list[DayModel] = Field(default_factory=list)
  periods: list[PeriodModel] = Field(default_factory=list)
  classes: list[str] = Field(default_factory=list)
  selected_subjects: list[str] = Field(default_factory=list, alias="selectedSubjects")


class GenerateRequest(BaseModel):
  teachers: list[TeacherModel]
  validation: ValidationModel

  @model_validator(mode="after")
  def validate_has_teachers(self) -> "GenerateRequest":
    if not self.teachers:
      raise ValueError("Add at least one teacher before generating a timetable.")
    return self


app = FastAPI(
  title="Timetable Solver API",
  version="1.0.0",
  description="School timetable generation powered by Google OR-Tools.",
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=False,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
  return {"status": "ok"}


@app.post("/api/generate")
def generate(payload: GenerateRequest) -> dict:
  try:
    return generate_timetable(payload.model_dump(by_alias=True))
  except SolverError as error:
    raise HTTPException(status_code=422, detail=str(error)) from error
