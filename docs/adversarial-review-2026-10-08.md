# Adversarial review of the planning baseline

Date: 2026-10-08
Original verdict: NEEDS REVISION. Six actionable planning gaps and one measurement-reference ambiguity. No application implementation exists; these are specification/gate findings, not reproduced runtime bugs.

Correction status: all seven findings addressed in the planning documents on 2026-10-08 and re-reviewed by the three original reviewers. The original findings below are retained as historical evidence; their line references describe the pre-correction baseline. This closure verifies specification changes only, not execution of the future product or gates.

Method: three independent read-only subagents reviewed scope fidelity, architecture, and development/acceptance infrastructure. The primary agent checked cited passages, consolidated duplicates, and moderated conclusions where other requirements already constrain the failure. The plans and register were not modified by this review. Line references below identify the reviewed baseline and may move after corrections.

## F01 — P1: IKEA coverage permits explained failures to count as completion

Source: [delivery-plan.md:122](delivery-plan.md#44-coverage-and-honest-fallback); exact anchor `docs/delivery-plan.md:122`. Related: `docs/requirements-register.json:339`.

The release condition allows each eligible URL either a successful import path or an individually reviewed explanation. A catalog could contain many reviewed unsupported entries and satisfy that condition without providing those products' promised imports/fallbacks. The separate import requirement and holdout language express stronger intent, but the coverage gate does not require a successful result for each eligible product. “Scope review” is not explicitly a user-approved removal from eligibility.

Correction: require usable source/inferred/generic import for frozen eligible products with dimensions and provenance; keep failures failing. Exclude a previously eligible product only through an explicit approved scope change. Keep discovery exclusions, import failures, and successful fallbacks as separate counts; require actual successful holdout placements. Do not treat reported outcomes alone as coverage acceptance.

## F02 — P1: geometry selection does not prove measurement reconciliation

Anchors: `docs/dependency-decisions.md:48`–53; `docs/dependency-decisions.md:37`; `docs/delivery-plan.md:144`–146.

G01–G06 can all pass using already solved polygons while no component can turn entered wall lengths into a room or suggest a valid repair. The candidate comparison explicitly does not provide a dimensional constraint solver. This leaves a central consumer workflow unproven until M2, after M0 selects the architecture.

Correction: add an M0 solver/constraint proof independent of rendering and boolean geometry. Include an underdetermined length-only quadrilateral, sufficient extra measurement, contradictory wall/opening totals, incompatible locks, and an auto-repair that lists changed inputs. Test preview/cancel/undo and retain an independent numerical witness. Record the constraint representation and repair policy in an ADR.

## F03 — P2: paired deletion of a mandatory case and its mapping can evade traceability

Anchors: `docs/development-infrastructure.md:115`, `:125`; `docs/requirements-register.json:190`; `docs/delivery-plan.md:175`.

The specified negative tests cover removed requirement IDs, orphan cases and empty/skipped tests, but not removal of one mandatory subcase together with its mapping. For example, delete folding-door movement coverage from tests and mapping while hinged-door cases remain green under R015. No orphan, empty report, skipped case or removed parent requirement identifies the lost obligation.

Correction: maintain a versioned mandatory acceptance-case inventory, including per-family/view/device obligations where needed. Compare retirement of individual obligations against approved decisions, not just parent IDs. Add paired test/mapping deletion and partial-family coverage to the gate's own negative tests.

## F04 — P2: evidence-storage commits and tested-source identity are not distinguished

Anchors: `docs/development-infrastructure.md:81`, `:117`, `:156`; `docs/delivery-plan.md:175`, `:195`.

The plan stores small evidence manifests in the repository, requires a clean source revision and rejects stale evidence. Test commit C, then commit evidence/status records as C′: a naive exact-HEAD gate now rejects evidence for C. Repeating the procedure cannot resolve that self-reference. This is a missing evidence-publication contract, not proof that source-bound evidence is inherently impossible.

Correction: define the tested candidate independently as source commit/build digest/catalog hashes. Store attestations externally or on an evidence branch/commit explicitly referencing that candidate. Specify what may change without changing the tested subject, and test that evidence attachment preserves validity while relevant source changes invalidate it.

## F05 — P2: M0 closure requires the consumer workflow first scheduled for M1

Anchors: `docs/delivery-plan.md:145`, `:167`; `docs/development-infrastructure.md:162`.

The universal milestone review requires an empty-project consumer journey, save/reopen, undo and both views. M1 is explicitly the first complete workflow with these capabilities. Applied literally, M0 must perform M1 before it can close.

Correction: give M0 a bounded feasibility-harness exit, then require the complete consumer journey from M1 onward. The isolated G/P library proofs are not themselves circular and need not become a finished editor.

## F06 — P2: remote content can change without a catalog-version change

Anchors: `docs/delivery-plan.md:99`–103; `docs/requirements.md:155`–157; `docs/requirements-register.json:325`–327.

The contract contains asset hashes but does not explicitly require runtime verification. A host can replace GLB or texture bytes at the same URL/version. Reopening a project can silently change its appearance while preserved record snapshots and unavailable-asset tests still pass.

Correction: require runtime checks of pinned catalog/asset content, including dependent textures. On mismatch preserve saved metadata and use a visible error/placeholder or an explicit update path. Test changed bytes at an unchanged URL/version through reopen, undo and fresh-profile sharing. The existence of a hash field alone is not enforcement.

## F07 — P2 clarification: the 70 cm door measurement was given an unconfirmed reference

Anchors: `docs/delivery-plan.md:179`; `docs/requirements.md:197`.

The user said “actual opening 70cm.” The literal-fixture paragraph calls it a “clear door opening,” although frame/leaf geometry is unresolved in requirements.md. Clear passage is a plausible interpretation, but it must not silently become a verified geometric constraint.

Correction: retain the supplied label and value, mark the measurement reference unresolved, and avoid deriving frame/leaf geometry from it until clarified. Use explicitly synthetic reference dimensions for executable door tests meanwhile. This finding does not claim that 70 cm itself is wrong.

## Non-findings and limits

- IKEA Israel remains v1; WebMCP correctly remains v2 across the reviewed artifacts.
- Saved-history cursor/checkpoints/dependencies, migration, missing assets, and fresh-profile sharing are already specified; no wholesale persistence redesign is justified by this review.
- M0 geometry/PDF candidates are explicitly unverified, and no packages/tests are falsely reported as installed or passing.
- The milestone arithmetic is 20–35 person-weeks. The estimate is explicitly preliminary and unmeasured; this review supplies no stronger timing evidence.
- The review inspected planning artifacts and reasoned through concrete counterexamples. It did not implement the gates, benchmark libraries, validate real tablet behavior, or run the IKEA producer.

Recommended correction order: F01–F03 first, then F04–F06, with F07 preserved as an unresolved measurement reference. Re-review the changed gate definitions before treating the baseline as implementation-ready.

## Correction and re-review record

| Finding | Applied correction | Re-review |
| --- | --- | --- |
| F01 | Eligible products require successful imports; explanations remain failures; removal requires user-approved scope change; added negative gate case | Scope reviewer: resolved |
| F02 | Added S01–S06 independent measurement-constraint proofs, numerical oracle and solver ADR to M0/R042 | Architecture reviewer: resolved |
| F03 | Planned mandatory obligation inventory independent of tests/mappings, baseline comparison, subcase retirement decisions and paired-deletion/partial-family gate tests | Gate reviewer: resolved |
| F04 | Frozen candidate identity separated from evidence-store commit; exact artifact promotion and separate content-addressed acceptance manifest | Gate reviewer: resolved |
| F05 | Bounded feasibility-harness exit for M0; integrated consumer scenario required from M1 | Gate reviewer: resolved |
| F06 | Project-pinned runtime content verification includes cache and dependent textures; mismatch behavior and unchanged-URL test cases required | Architecture reviewer: resolved |
| F07 | Preserved user-labeled actual opening 70 cm with unresolved reference; no binding to clear-passage/frame geometry without clarification | Scope reviewer: resolved |

Primary-agent consistency checks passed: 50 unique requirement IDs remain planned with no fabricated executable test/evidence records; local document links resolve; all 17 S/G/P proof definitions are present; superseded normative loophole wording is removed; WebMCP remains v2. Requirements, delivery plan, dependency decisions, infrastructure plan and tracking register were updated together. The mandatory inventory, helper scripts, proof harnesses and CI gates are still scheduled implementation work.
