# StudyPro Timetable Integration Plan — Canonical Location

The canonical timetable integration plan now lives in the StudyPro repository:

- Repository: `bos-code/privy_studypro`
- Branch: `plan/logic-intelligence-10-stages`
- File: `STUDYPRO_TIMETABLE_INTEGRATION_PLAN.md`

Direct location:

`https://github.com/bos-code/privy_studypro/blob/plan/logic-intelligence-10-stages/STUDYPRO_TIMETABLE_INTEGRATION_PLAN.md`

AI agents and developers must read the canonical StudyPro document before changing timetable integration in either repository.

Core boundaries remain:

- Keep the Python FastAPI and Google OR-Tools solver.
- Integrate through a versioned API or JSON contract.
- Use durable StudyPro IDs, not names alone.
- StudyPro owns the active published timetable.
- Telegram reads timetable data from StudyPro and does not edit timetables.
- Timetable results describe scheduled activity, not physical location.
- Do not begin implementation without explicit project-owner approval.
