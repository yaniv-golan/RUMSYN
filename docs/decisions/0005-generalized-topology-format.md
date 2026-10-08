# ADR0005 - Generalized topology and project format2

2026-10-08. Manager decision, implementation in progress. R004/R005/R006/R009/R010/R012/R031/R033.

Canonical corners have stable IDs and centimeter coordinates; wall geometry references corner IDs with line or analytic arc parameters. Render tessellation is derived. Measured quadrilateral remains a constrained subtype preserving its original diagonal, orientation, lengths and measurement provenance. First line polygon implementation supports simple concave outlines; complete arc-room intersection validation and architectural features follow, with no M2 closure from the L witness alone.

Project format2/model schema2 becomes the single native writer. Version1 import uses deterministic lossless structural migration of current state and every history before/after snapshot, preserving cursor/redo and all measurement/product/attachment values. The UI must report upgrade with original file unchanged; explicit Save writes v2 and explains older-app compatibility. Structural migration needs no extra approval. Any geometric/constraint conversion that changes dimensions, assumptions or branch still requires preview/apply/cancel. Validate the complete migrated history before replacing state or recovery. Unsupported future versions reject clearly.

Frozen historical v1 browser archives and unchanged-engine behavioral expectations are retained under tests/fixtures/v1. Test cursors0/3/7, undo and redo against those old-engine snapshots, corrupted states, and v2 roundtrip. Expectations must not be regenerated using migration code.

Initial pure arc primitives validate analytic radius/sweep/endpoints and host offsets; they do not attest complete curved-room intersections, wall joins or rendering qualification.

First consumer entry increment exposes preset L/rectangle, draft canvas plus numerical corners, and explicit length/bearing perimeter input. Complete entered lengths/directions are required for unqualified perimeter evidence; preset/drawn geometry remains approximate. Persisted perimeter inputs must reproduce canonical coordinates/lengths. Illustrated turn/diagonal alternatives and post-creation method refinement remain required, not replaced by advanced bearings.

Build-evidence correction: source/build stamps identify successful construction, deleted before build attempts. All browser runners serve hash-verified candidate files from an owned server and reject stale/absent stamps. Negative runner probes execute isolated copied fixtures; they must not move shared real-run reports.

Polygon refinement uses an explicit endpoint policy: length edit keeps the start fixed and moves the end along the current wall direction; corner move affects adjacent edges. Preview lists all changed lengths/bearings and hosted objects. Length locks and direction locks reject incompatible moves; attachment offset/width/elevation validations stay authoritative. Freestanding furniture retains coordinates. Original entered perimeter records and origin remain preserved separately from accepted adjusted active constraints. Accepted length values are stored exactly; canonical derived coordinates retain full floating precision without display rounding.

Identical canonical length/corner requests reject as no changes before creating a proposal, provenance conversion or history entry. No-op equality is exact; explicit small numeric changes are not suppressed by display rounding. Browser property synchronization is verified with a bounded value wait after Apply/Undo.
