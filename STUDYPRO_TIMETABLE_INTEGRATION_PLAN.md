# StudyPro Timetable Integration Plan

## Status

Planning document only. Do not begin implementation without explicit approval from the project owner.

## Canonical ownership

- Timetable generator repository: `bos-code/time-table`
- StudyPro repository: `bos-code/privy_studypro`
- This file is the canonical plan for connecting the Python timetable engine to StudyPro.
- StudyPro Telegram requirements are documented in `bos-code/privy_studypro/TELEGRAM_ADMIN_AUTOMATION_PLAN.md`.
- Future coding agents working on timetable integration must read this file before changing either application.

---

# 1. Confirmed product decisions

- The existing timetable application remains the timetable-generation application.
- Its Python FastAPI and Google OR-Tools engine should not be rewritten in NestJS merely to match StudyPro's backend language.
- StudyPro and the timetable application should communicate through a stable API and a documented interchange format.
- StudyPro becomes the source of truth for school identity data: teachers, classes, departments, subjects, academic years, terms, and approved teacher assignments.
- The timetable application owns timetable drafts, generation constraints, solver execution, and draft review.
- StudyPro owns the active published operational copy used by students, teachers, admins, dashboards, and Telegram.
- Telegram does not create or edit timetables.
- Timetable lookups report scheduled activity only.
- No physical teacher location, lesson check-in, or actual-presence tracking is required.
- The integration must work without AI.
- PDF, spreadsheet, or file extraction is a secondary import path, not the core integration method.

---

# 2. Current timetable application state

The current application contains:

- a React and Vite frontend;
- a Python FastAPI backend;
- a Google OR-Tools constraint solver;
- a health endpoint;
- a timetable generation endpoint;
- teacher, class, subject, day, period, and lessons-per-week inputs;
- teacher and class clash prevention;
- lesson spreading preferences;
- output grouped by class and teacher.

The current backend is largely stateless and accepts names rather than durable StudyPro record IDs. The current generation endpoint is suitable for local generation, but it needs an integration contract before StudyPro can safely consume its results.

---

# 3. Recommended integration architecture

```text
StudyPro master data
        |
        | authenticated API or signed export
        v
Python timetable application
        |
        | generate, edit, validate, review
        v
Approved timetable publication
        |
        | authenticated publish API
        v
StudyPro timetable records
        |
        +--> Student timetable
        +--> Teacher timetable
        +--> Admin operations view
        +--> Telegram lookups
```

## Why this architecture

- Python remains ideal for the OR-Tools solver.
- NestJS remains the StudyPro application backend.
- Neither service needs to share the same programming language.
- REST and JSON provide a clean boundary.
- Each application can be deployed and updated independently.
- StudyPro does not become dependent on the solver for ordinary timetable lookups.
- If the timetable service is temporarily offline, the last published timetable remains available in StudyPro.

---

# 4. What each application owns

## StudyPro owns

- school ID;
- academic year;
- academic term;
- school timezone;
- teachers and staff IDs;
- classes and class arms;
- departments;
- subjects;
- class-subject relationships;
- teacher-subject-class assignments;
- active and inactive status;
- published timetable version used operationally;
- student and teacher timetable queries;
- role-based access;
- Telegram timetable commands;
- timetable publication audit history.

## Timetable application owns

- timetable-generation workspace;
- draft timetable versions;
- solver configuration;
- enabled school days;
- teaching and non-teaching periods;
- lessons-per-week demands;
- teacher availability constraints when later added;
- room constraints when later added;
- solver execution;
- draft conflict review;
- manual draft adjustment;
- publication preparation;
- export or publish request to StudyPro.

## Shared contract

Both applications agree on:

- stable external IDs;
- timetable schema version;
- publication version;
- days and periods;
- teacher, class, subject, department, and room identifiers;
- validation errors;
- publication status;
- idempotency rules.

---

# 5. Core integration choice

## Recommended: service-to-service REST API

The Python service and StudyPro communicate through HTTPS JSON APIs.

Python does not need to become part of the NestJS process. StudyPro does not need to run OR-Tools.

## Fallback: signed JSON or CSV export/import

Until the complete API is ready, the timetable application may export a versioned JSON file that StudyPro imports through a review screen.

CSV may be supported for simple entries, but JSON is better for preserving IDs, versions, periods, validation metadata, and future room information.

## Avoid: direct database sharing

Do not allow the Python timetable application to write directly to StudyPro's PostgreSQL tables.

Reasons:

- bypasses StudyPro validation and permissions;
- tightly couples both schemas;
- makes migrations dangerous;
- weakens auditing;
- makes rollback and versioning harder.

---

# 6. Master-data flow

Before timetable generation, the timetable application needs current StudyPro data.

## Recommended flow

1. Authorised admin opens timetable integration.
2. Timetable application requests or receives a StudyPro master-data snapshot.
3. Snapshot contains stable IDs and display labels.
4. Timetable application stores the snapshot with a sync timestamp and source version.
5. Admin builds or generates a timetable using those records.
6. Before publication, the timetable application checks whether critical source records have changed.
7. Changed or missing records are remapped before publication.

## Master-data snapshot

```json
{
  "schemaVersion": "1.0",
  "schoolId": "uuid",
  "academicYear": {
    "id": "uuid",
    "name": "2026/2027"
  },
  "term": {
    "id": "uuid",
    "name": "First Term"
  },
  "timezone": "Africa/Lagos",
  "teachers": [],
  "classes": [],
  "departments": [],
  "subjects": [],
  "classSubjects": [],
  "teacherAssignments": [],
  "rooms": [],
  "syncedAt": "ISO-8601 timestamp"
}
```

## Required teacher record

- StudyPro user ID;
- teacher profile ID;
- staff ID;
- display name;
- active status;
- assigned class-subject IDs.

## Required class record

- StudyPro class ID;
- class name;
- code;
- year level;
- senior status;
- department relationship where applicable;
- active status.

## Required subject record

- StudyPro subject ID;
- name;
- code;
- active status.

Names remain display values. IDs are used for matching and publication.

---

# 7. Timetable publication contract

A timetable is not a loose list of teacher names. It is a versioned publication tied to real StudyPro records.

## Publication envelope

```json
{
  "schemaVersion": "1.0",
  "publicationId": "uuid",
  "schoolId": "uuid",
  "academicYearId": "uuid",
  "termId": "uuid",
  "name": "2026 First Term Timetable",
  "version": 1,
  "status": "READY_FOR_REVIEW",
  "generatedBy": "time-table",
  "sourceSnapshotVersion": "string",
  "days": [],
  "periods": [],
  "entries": [],
  "validationSummary": {},
  "createdAt": "ISO-8601 timestamp"
}
```

## Timetable entry

```json
{
  "externalEntryId": "string",
  "dayId": "mon",
  "periodId": "p3",
  "classId": "StudyPro class UUID",
  "departmentId": "StudyPro department UUID or null",
  "subjectId": "StudyPro subject UUID or null",
  "teacherUserId": "StudyPro user UUID or null",
  "teacherProfileId": "StudyPro teacher-profile UUID or null",
  "roomId": "room UUID or null",
  "activityType": "LESSON",
  "label": null,
  "notes": null
}
```

## Non-lesson entries

Timetable entries must support:

- lesson;
- break;
- assembly;
- lunch;
- club;
- sports;
- study period;
- special school activity;
- custom activity.

Non-lesson entries may omit teacher or subject when appropriate.

---

# 8. StudyPro timetable data model

Recommended models:

## Timetable

- ID;
- school ID;
- academic year ID;
- term ID;
- name;
- status;
- active version ID;
- source system;
- created and updated timestamps.

## TimetableVersion

- ID;
- timetable ID;
- version number;
- source publication ID;
- source schema version;
- draft, review, published, archived status;
- published by;
- published timestamp;
- effective start date;
- notes;
- validation summary.

## TimetableDay

- timetable-version ID;
- day code;
- label;
- position;
- enabled status.

## TimetablePeriod

- timetable-version ID;
- period code;
- label;
- start time;
- end time;
- teaching or non-teaching type;
- position.

## TimetableEntry

- timetable-version ID;
- day ID;
- period ID;
- class ID;
- department ID;
- subject ID;
- teacher profile ID;
- room ID;
- activity type;
- display label;
- source external entry ID;
- notes.

## TimetableIntegrationMapping

- source system;
- entity type;
- source external ID;
- StudyPro ID;
- last verified timestamp;
- mapping status.

## TimetableImportRun

- source publication ID;
- schema version;
- received timestamp;
- imported by;
- status;
- entry counts;
- warning and error counts;
- checksum;
- idempotency key.

## TimetableImportIssue

- import run ID;
- entry reference;
- issue code;
- severity;
- message;
- source value;
- suggested match;
- resolved by;
- resolution timestamp.

---

# 9. Publication workflow

```text
Generate or edit timetable in Python app
        |
        v
Run solver and application validation
        |
        v
Admin reviews draft
        |
        v
Send publication to StudyPro as READY_FOR_REVIEW
        |
        v
StudyPro validates IDs, assignments, periods, and conflicts
        |
        v
Admin reviews import summary in StudyPro
        |
        v
Publish a new StudyPro timetable version
        |
        v
Students, teachers, admins, and Telegram use the new active version
```

A Python publication must not automatically replace the active StudyPro timetable.

---

# 10. StudyPro validation before publication

StudyPro must check:

- school ID matches the authenticated integration;
- academic year and term are valid;
- source schema version is supported;
- publication has not already been imported;
- teacher IDs exist and are active;
- class IDs exist and are active;
- subject IDs exist and are active;
- class-subject relationships are valid;
- teacher assignments are valid;
- department requirements are valid;
- day and period references exist;
- teacher is not double-booked;
- class is not double-booked;
- room is not double-booked when rooms are used;
- duplicate entries do not exist;
- required IDs are not replaced by unverified names;
- timetable has at least one enabled school day;
- teaching periods have valid start and end times;
- severe import issues are resolved before publication.

Warnings may be accepted with a recorded reason. Blocking errors must prevent publication.

---

# 11. Versioning and change management

- Every publication creates a new immutable version.
- Publishing version 2 does not delete version 1.
- Only one version is active for the same school, term, and effective date range.
- Draft and review versions do not affect user timetable queries.
- Each change records who published it and why.
- A previous version may be restored through a new audited publication action.
- Telegram and ordinary StudyPro queries always use the active version.

---

# 12. Proposed Python integration endpoints

These endpoints are planning proposals, not current implementation.

## `GET /api/integrations/studypro/status`

Returns integration health, linked school, supported schema versions, and last successful sync.

## `POST /api/integrations/studypro/master-data`

Accepts a StudyPro master-data snapshot when StudyPro pushes data.

Alternative:

## `POST /api/integrations/studypro/sync-master-data`

Triggers the Python service to fetch master data from StudyPro.

Only one direction should become canonical after authentication and deployment requirements are reviewed.

## `POST /api/integrations/studypro/publications/validate`

Validates a publication payload against the timetable application's own schema before sending it.

## `POST /api/integrations/studypro/publications`

Creates a publication package and returns its ID, checksum, validation result, and readiness status.

## `GET /api/integrations/studypro/publications/{publicationId}`

Returns a publication package for StudyPro to fetch.

## `POST /api/integrations/studypro/publications/{publicationId}/send`

Sends or retries an idempotent publication request to StudyPro.

---

# 13. Proposed StudyPro integration endpoints

These endpoints are planning proposals.

## `GET /api/v1/integrations/timetable/master-data`

Returns authorised school timetable master data.

## `POST /api/v1/integrations/timetable/publications`

Receives a publication package from the Python service.

## `GET /api/v1/integrations/timetable/imports/{importId}`

Returns import validation and review status.

## `POST /api/v1/integrations/timetable/imports/{importId}/publish`

Publishes a reviewed import as a new active version.

## `POST /api/v1/integrations/timetable/imports/{importId}/reject`

Rejects a publication with a reason.

## `GET /api/v1/timetables/me/now`

Returns the requesting staff or student's current and next scheduled activity.

## `GET /api/v1/timetables/me/today`

Returns the requesting user's daily timetable.

## `GET /api/v1/timetables/classes/{classId}/now`

Returns the current and next scheduled activity for a permitted class.

## `GET /api/v1/timetables/teachers/{teacherId}`

Returns a permitted teacher schedule.

## `GET /api/v1/timetables/scheduled-free`

Returns staff with no timetable lesson for a selected period, using the wording `scheduled free`.

---

# 14. Authentication and transport security

Service-to-service integration must include:

- HTTPS;
- separate integration credentials per environment;
- a scoped service account or integration token;
- secret rotation;
- request timestamp;
- request signature or strong bearer-token validation;
- replay prevention;
- idempotency keys;
- payload checksum;
- school scoping;
- rate limiting;
- complete integration audit logs.

Do not expose a general StudyPro admin token to the Python service.

---

# 15. Failure handling

## StudyPro unavailable

- Python stores the reviewed publication locally.
- Send action enters retryable state.
- Existing StudyPro timetable remains active.
- Admin sees a clear failure reason.
- Retries reuse the same idempotency key.

## Timetable service unavailable

- StudyPro continues serving the last active timetable.
- Student, staff, and Telegram lookups continue working.
- Generation and new publication are temporarily unavailable.

## Record mismatch

- Import enters `NEEDS_REVIEW`.
- StudyPro shows unmatched or changed records.
- Admin maps or rejects the entry.
- No automatic name-only match is silently published.

## Duplicate publication

- Same publication ID and checksum return the existing import result.
- Same publication ID with different content is rejected.

---

# 16. File import fallback

The preferred integration is API-based publication. File import remains useful for external or manually produced timetables.

## Supported priority

1. StudyPro timetable JSON schema.
2. StudyPro Excel template.
3. CSV template.
4. Structured digital PDF with a review step.
5. Scanned PDF or image only as a later, lower-confidence fallback.

## Import workflow

```text
Upload file
  -> extract rows and columns
  -> match IDs or names
  -> show confidence and unresolved mappings
  -> run conflict checks
  -> admin reviews every uncertain entry
  -> publish a version
```

No extracted timetable publishes automatically.

AI may later assist extraction, but ordinary template and API imports must function completely without AI.

---

# 17. Student and staff timetable experience

## Students in StudyPro

- view today's timetable;
- view the weekly timetable;
- view current and next scheduled activity;
- receive timetable-change notifications in StudyPro;
- no Telegram access.

## Teachers in StudyPro and Telegram

- view own current lesson;
- view next lesson;
- view daily and weekly timetable;
- view assigned class and subject;
- see `scheduled free` when no lesson exists.

## Form teachers

- view their own timetable;
- view form-class timetable;
- view current and next form-class activity.

## Admin, principal, dean, proprietor, or owner

According to permissions:

- school timetable;
- class timetable;
- teacher timetable;
- current-period summary;
- next-period summary;
- staff scheduled free;
- unresolved or uncovered timetable entries.

The system reports planned schedule, not physical presence.

---

# 18. Telegram relationship

Telegram performs no timetable generation or editing.

Telegram calls StudyPro timetable query endpoints for:

- `/now`;
- `/next`;
- `/today`;
- `/classnow`;
- `/teacher`;
- `/free`;
- `/summary`.

The Telegram bot must never call the Python solver directly for ordinary staff queries.

Reason:

- StudyPro holds the active published version;
- StudyPro applies role permissions;
- StudyPro remains available if the solver service is offline;
- all operational users see the same timetable version.

---

# 19. Integration implementation stages

## Stage 1 — Contract and ID preparation

- Agree ownership boundaries.
- Define schema version 1.0.
- Add durable IDs to Python input and solver output while retaining display names.
- Define master-data and publication payloads.
- Add contract tests in both repositories.

## Stage 2 — StudyPro timetable foundation

- Add timetable, version, period, entry, mapping, import-run, and import-issue models.
- Add role-based timetable query services.
- Add publication review and audit rules.
- Do not connect Python yet.

## Stage 3 — Manual JSON integration

- Export versioned JSON from the Python application.
- Import and review JSON in StudyPro.
- Validate mapping, conflicts, idempotency, and versioning.
- Publish and test student and teacher views.

## Stage 4 — Authenticated API integration

- Add service credentials.
- Add master-data synchronisation.
- Add publication send and import-status endpoints.
- Add retry and failure handling.

## Stage 5 — Telegram and operational queries

- Connect StudyPro timetable endpoints to Telegram commands.
- Test role-based student, teacher, form-teacher, and admin results.
- Confirm timetable service downtime does not break lookups.

## Stage 6 — File import and advanced constraints

Only after the core integration is stable:

- Excel and CSV templates;
- structured PDF import;
- rooms;
- teacher availability;
- double periods;
- special activities;
- workload and distribution constraints;
- improved solver configuration.

---

# 20. Required tests

## Contract tests

- Python export matches StudyPro schema.
- Unsupported schema versions are rejected.
- IDs and display labels survive round-trip.

## Mapping tests

- renamed teacher retains the same ID;
- duplicate names do not cause incorrect mapping;
- deleted or inactive records block or warn appropriately;
- class, department, and subject relationships are validated.

## Conflict tests

- teacher double-booking;
- class double-booking;
- room double-booking;
- invalid teacher assignment;
- invalid class-subject pairing;
- duplicate timetable entry.

## Version tests

- new version does not overwrite history;
- draft does not affect active timetable;
- rollback creates an audited publication;
- duplicate publication is idempotent.

## Availability tests

- StudyPro continues serving the active timetable while Python is offline;
- Python retains a reviewed publication while StudyPro is offline;
- retries do not duplicate entries.

## Permission tests

- student sees own class timetable only;
- subject teacher sees authorised schedules;
- form teacher sees assigned form class;
- admins see school-wide data according to permissions;
- Telegram and web return the same scheduled result.

---

# 21. Pending design decisions for joint review

These are intentionally left open for discussion with other agents or developers:

- whether StudyPro pushes master data or Python pulls it;
- service authentication mechanism;
- deployment topology and network access;
- whether the timetable application needs its own persistent database;
- where draft timetable versions are stored;
- how rooms and teacher availability enter the solver;
- whether publication review happens in both applications or primarily in StudyPro;
- exact academic-term relationship;
- how emergency mid-term timetable changes are represented;
- whether StudyPro sends changes through webhooks or scheduled sync.

The default recommendation is to start with JSON export/import, verify the contract, then automate the same contract over REST.

---

# 22. Non-negotiable acceptance requirements

- The Python solver remains usable independently.
- StudyPro remains usable if the Python service is offline.
- Timetable data is linked by durable IDs, not names alone.
- No direct Python writes to StudyPro database tables.
- Every publication is versioned and audited.
- No imported timetable publishes without review.
- Telegram does not edit timetables.
- Timetable queries report scheduled activity only.
- Students receive timetable access through StudyPro, not Telegram.
- Integration functions without AI.
- AI removal cannot break generation, publication, lookup, or Telegram access.
- Implementation does not begin until explicitly approved.
