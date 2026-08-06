# Agent Guidance

Before changing this repository for StudyPro integration, read:

- `STUDYPRO_TIMETABLE_INTEGRATION_PLAN.md`

Key boundaries:

- Keep the Python FastAPI and Google OR-Tools solver.
- Integrate with StudyPro through a versioned API or JSON contract.
- Use durable StudyPro IDs, not names alone.
- StudyPro owns the active published operational timetable.
- This repository owns generation drafts and solver work.
- Telegram reads timetable data from StudyPro and does not edit timetables.
- Timetable results describe scheduled activity, not physical location.
- Do not begin implementation without explicit project-owner approval.
