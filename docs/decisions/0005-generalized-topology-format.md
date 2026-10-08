# ADR0005 - Generalized topology and project format2

2026-10-08. Manager decision, implementation in progress. R004/R005/R006/R009/R010/R012/R031/R033.

Canonical corners have stable IDs and centimeter coordinates; wall geometry references corner IDs with line or analytic arc parameters. Render tessellation is derived. Measured quadrilateral remains a constrained subtype preserving its original diagonal, orientation, lengths and measurement provenance. First line polygon implementation supports simple concave outlines; complete arc-room intersection validation and architectural features follow, with no M2 closure from the L witness alone.

Project format2/model schema2 becomes the single native writer. Version1 import uses deterministic lossless structural migration of current state and every history before/after snapshot, preserving cursor/redo and all measurement/product/attachment values. The UI must report upgrade with original file unchanged; explicit Save writes v2 and explains older-app compatibility. Structural migration needs no extra approval. Any geometric/constraint conversion that changes dimensions, assumptions or branch still requires preview/apply/cancel. Validate the complete migrated history before replacing state or recovery. Unsupported future versions reject clearly.

Frozen historical v1 browser archives and unchanged-engine behavioral expectations are retained under tests/fixtures/v1. Test cursors0/3/7, undo and redo against those old-engine snapshots, corrupted states, and v2 roundtrip. Expectations must not be regenerated using migration code.

Initial pure arc primitives validate analytic radius/sweep/endpoints and host offsets; they do not attest complete curved-room intersections, wall joins or rendering qualification.
