# ADR 0001 - Bounded M0 contracts

2026-10-08. Candidate, pending review. R004/R005/R009/R010/R012/R031/R042/R043.

Store positive finite centimeters without display-rounding; keep entered/derived/inferred/adjusted provenance. Stable wall IDs and start/end attachment anchors are domain values, independent of meshes. Command previews bind revision and list changed inputs/affected attachments. Cancellation does not mutate; apply validates the whole result; undo/redo preserves attachments and provenance, advancing revision so old proposals remain stale. Replays are rejected. Serialized history is a bounded initial contract, not qualified arbitrary-file decoding/migration.

The initial constraint proof solves convex quadrilaterals from side lengths and one AC diagonal. Sides alone report one degree of freedom; omitted orientation reports mirrored branches. Triangle inequalities and signed turns diagnose contradictory/unsupported convex branches. Segment sums expose residuals; unlocked alternatives are proposals, never automatic corrections. Fully locked sums report no allowed repair. Independent rectangle projections and manager's concave witness are tests. Full concave/curved/attachment/angle constraint solving remains required in M2; this harness does not prove that general solver architecture.

Frozen numerical tolerance: 1e-6 cm for length/residual checks before initial execution. This is computation tolerance, not claimed physical accuracy. Signed-turn topology tolerance is currently 1e-6 cm² and needs scale-aware review for production. No physical measurements are normalized. No approximation is accepted on the user's behalf.

The inventory baseline is proposed and awaiting manager review. Gate evidence must bind declared source-controlled case-to-obligation mappings and real runner outcomes; claims alone do not establish coverage. Candidate checks reject malformed hashes. The filesystem runner must establish the actual source/build identity independently; pure validation of a supplied object is not proof that that source exists. Device/manual subcases require additional evidence-kind qualification before release.

Manager decision: canonical centimeters may remain in production, overriding the plan's proposed internal meters, provided asset/render/export boundaries explicitly convert. Display rounding never mutates canonical geometry. Three.js/glTF interfaces must convert centimeters to meters and back through tested adapters.

Early reviewer findings: concave branch mislabeled convex corrected with a signed-turn regression. Blanket evidence from an unrelated passing case now fails independent mappings; candidate shape validation was added. Filesystem runners now capture actual source/build hashes before and after execution. Gate release qualification still lacks a reviewed evidence-kind/device matrix and accepted per-obligation mappings; do not count the abstract gate tests as full release-gate completion.

Manager clarified S04/S05 scope: bounded fixed-length/attachment repair is sufficient for M0; general angle/concave solving belongs M2. Mixed-lock witnesses now independently apply every offered choice to a copy and verify sum/locks/attachment bounds. Attachment-breaking choices appear only in unavailable diagnostics, never feasible choices. Accepted total change plus undo restores the original model/provenance/attachments.
