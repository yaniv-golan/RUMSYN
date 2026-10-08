# RUMSYN delivery plan

Date: 2026-10-08
Status: Proposed implementation plan. This document does not claim implementation, successful tests, or deployment.

## 1. Delivery commitment

Deliver the consumer room modeler described in [requirements.md](requirements.md), including the full agreed first-release geometry, openings, fixtures, real-time appearance, furniture placement, local persistence, exports, and English/Hebrew. The first included catalog plugin is **IKEA Israel**. Other countries are an extension target, not a v1 blocker. **WebMCP is deferred to release 2**, as explicitly requested during planning; v1 retains a reusable command interface but has no native AI integration gate.

Milestones below are incremental working builds, not reductions of v1. A basic rectangular-room demo or a catalog with a handful of hardcoded products is not the delivered product.

Current repository observation: only the requirements document existed before this planning work; no application, package manifest, Git metadata, test suite, or CI configuration was present. The first implementation milestone establishes those foundations. No dependency versions or performance figures have been measured for this project yet.

Planning artifacts:

- [Requirements](requirements.md): user-facing scope and supplied room measurements.
- [Requirement register](requirements-register.json): stable IDs, milestone ownership, acceptance obligations, and honest initial status.
- [Development infrastructure](development-infrastructure.md): repository layout, agent instructions, helper scripts, CI/CD, and evidence rules.
- [Dependency decisions](dependency-decisions.md): recommended libraries, candidates, version policy, and mandatory M0 geometry/PDF proofs.
- This plan: architecture, sequence, delivery gates, risks, and proposed technical defaults.

## 2. Scope boundaries and defaults

Confirmed scope: one room per project; desktop/tablet editing; mobile viewing; browser-only application; public GitHub plugin repositories serving compatible data; offline catalog generation allowed; no required account. Preserve centimeter display to two decimals and configurable imperial units.

User-approved deferrals: WebMCP to release 2; multiple finishes on a single wall face, multi-product IKEA configuration systems, drawer/walking-clearance analysis, additional IKEA country catalogs for v1, and a first-party standalone-file importer to later work without a committed release. Preserve future material-region and importer extension points. Multi-room buildings, electrical circuit design, construction detailing, and a first-party paid AI chat backend are not part of this product.

Proposed implementation defaults, to record as ADRs during M0 rather than treat as additional user requirements:

| Decision | Proposed default | Reason / validation |
| --- | --- | --- |
| Language and build | TypeScript compiled to browser JavaScript; Vite; React for controls | Typed model contracts; static output; prove desktop/tablet UI before commitment |
| 3D | Three.js with WebGL2 baseline; GLB/glTF assets | Real-time PBR; avoid requiring WebGPU; validate on real tablets |
| 2D | SVG plan geometry plus accessible HTML controls | Direct dimension editing and selection; measure performance before considering Canvas |
| Model | Renderer-independent geometry/entities and transactional commands | One authoritative state for both views, exports, undo, and AI |
| Local storage | IndexedDB recovery/library; explicit `.rumsyn` archive export | Durable structured storage and portable files without mandatory accounts |
| Project archive | Versioned JSON manifest, state/checkpoint and command history, user-created local assets; external catalog references | User-created textures must survive sharing even though catalog assets can remain remote |
| Layout alternatives | Full independent copies after duplicate/rename | Predictable edits without hidden propagation; allow asset deduplication in archive |
| Measurement entry | Preset-and-edit, draw-and-dimension, perimeter-segment form | Supports different mental models with equivalent model results |
| Imperial display | Feet/inches with 1/16-inch default; accept fractions and decimal inches | Familiar readable default, configurable display; not an assertion of measurement precision |
| License | Propose MIT for application/SDK code; document asset/data terms separately | Free community development; confirm license before public release |
| App hosting | Static HTTPS hosting, initially evaluate GitHub Pages | No runtime backend; choose a different static asset host if catalog size/CORS requires it |
| Accessibility | Target WCAG 2.2 AA for applicable workflows, including accessible numerical editing | Automated checks plus keyboard, touch, screen-reader review; do not claim conformance from a scanner |

These defaults are replaceable when the early proof supplies contrary evidence. Changes to user scope require a recorded user decision, not a technical ADR alone.

## 3. Core architecture and contracts

### 3.1 A single editable room model

Separate geometry, user measurements, constraints, materials, and view state. Stable IDs identify corners, wall edges, faces, openings, trim, beams, fixtures, furniture, and layouts. Store uncertainty/provenance on measured and inferred values. Use meters internally with full numeric precision, documented tolerances, and formatting only at the input/output boundary. Keep original measurement text/value/unit separately; never round the model when switching units.

Represent walls as oriented line/arc segments with thickness and height profile. Model steps, columns, niches, sloped ceilings, and beams with bounded parameterized primitives, not arbitrary CAD solids. Host openings in wall-local coordinates, with separate rough opening, frame, clear passage, pane/leaf, sill, and trim geometry. Generate render meshes and collision proxies from the same parameters. Define and test axis, winding, origin, and elevation conventions before importing assets.

Build the first geometry proof around nonrectangular closure, arc/offset joins, openings, and trim. Evaluate a robust geometry library or constrained algorithm against fixtures; do not assume generic mesh subtraction will handle all editing and export requirements. Compare area/volume and intersections with independent analytic examples. Preserve material face identifiers when regenerating meshes and reserve face-region assignments for future multi-finish editing.

### 3.2 Commands, attachments, and undo

All persistent changes go through typed commands with preconditions, validation, preview, apply, and inverse data. A multi-object edit is one transaction. Pointer drags create a preview, then one history entry at commit. Cancel leaves no hidden state change.

Proposed wall-edit behavior: preserve closure; attached openings/trim/fixtures follow the wall with explicit endpoint/elevation anchors; unbound furniture stays in world coordinates; explicitly wall-bound furniture follows the host. Temporary snapping does not silently create binding. If an opening no longer fits, present conflicts and repair choices rather than delete or resize it. Locks and attachment references appear in the inspector.

Persistent history must contain serializable, versioned operations or reversible state patches, never functions. Save the history cursor and both undo/redo branches where applicable, include necessary checkpoints and asset references, and test reopen/undo/redo after migrations. Do not silently truncate history to meet an invented size target. If practical limits are necessary, show an explicit choice and preserve the original file.

### 3.3 Shared 2D/3D interaction

Both views operate on the same selection and command API. Geometry creation, dimensions, elevation, rotation, placement, materials, and opening configuration must be accessible in either view, even when a numerical inspector is the most usable control. Define an operation-by-view parity table and test it. Add touch hit areas, axis constraints, clear snap indicators, camera controls, object-list selection, keyboard editing, visible preview/commit/cancel, and undo early.

Use explicit collision proxies for walls, opening frames, trim protrusions, beams, fixtures, and furniture. Distinguish intentional construction intersections (beam into ceiling, trim on wall, frame in opening) from furnishing conflicts. Door motion checks use the swept path for hinged/pivot/folding/sliding mechanisms; checking only endpoints is insufficient. Tangency and construction overlap need documented tolerances. Warnings never force furniture placement to fail.

### 3.4 Rendering and exports

Use PBR materials, color/texture controls, physically interpretable dimensions, transparency, bounded mirror reflections, daylight, artificial lights, and scalable shadows. Offer tablet quality presets and progressive asset loading. Catalog visual fidelity and measured geometry remain distinct; a realistic-looking model is not proof of correct dimensions.

Export from the domain model rather than scrape the display mesh: dimensioned floor plans/elevations, schedules, quantities, and shopping lists must agree with saved state. Proposed v1 format matrix: PDF, SVG, DXF, CSV, PNG/JPEG, GLB, and native `.rumsyn`. GLB is a visual scene export, not an editable native-project replacement. Include scale/unit legends and approximation markers; embed a Hebrew-capable font and verify RTL text in actual PDFs. Document opening deductions and waste allowance separately from measured area. Verify scale in an independent viewer/printed calibration fixture.

## 4. IKEA Israel and public plugin delivery

### 4.1 Repository and runtime model

Create a separate public plugin repository during implementation, using the same versioned SDK/contract fixtures as the app. Proposed identity: `ikea-il`; the final GitHub owner/repository is selected at setup. The first plugin must be installed through the same repository-URL flow as community plugins, even if offered as a built-in suggestion.

Proposed published layout:

```text
rum-plugin.json                 # ID, contract version, country, declared origins, catalog pointer
releases/<version>/index.json   # Immutable product lookup/shard index and hashes
releases/<version>/products/*   # Product/variant records, dimensions, provenance
releases/<version>/assets/*     # Compatible models/textures where distributable
latest.json                    # Small pointer changed only after validation
```

GitHub is the public source/discovery anchor; large published data can live at another declared HTTPS host. Validate browser fetch/CORS, redirects, and asset decoding from the actual app origin. Do not rely on unauthenticated GitHub API requests per product or assume a raw/release URL works as a browser asset CDN.

The v1 catalog plugin is declarative data, not arbitrary scripts executing in the app. Specify an extension capability/version space for future standalone-file importers; a runnable importer requires a separate sandbox/permission design and may not be smuggled into catalog metadata.

### 4.2 Contract contents

Include repository identity, author, version, compatibility range, country/language/currency, literal supported URL hosts/path patterns, product/article and variant IDs, human-readable labels, dimensions with units and evidence, materials, price/date, source URL, image/model references, hashes, asset sizes and geometry bounds, origin/unit/pivot conventions, and required attribution.

Country/article/variant form identity; names and slugs are lookup aids. Do not merge differently sized or colored products by name. Treat total furniture dimensions separately from packaging and component dimensions. Track verification per field and visual representation: source-provided, inferred, generic, or unknown. Missing dimensions require visible user input/inference labeling; generic geometry is not permission to invent dimensions.

Immutably version records and assets. Projects retain the selected record snapshot and version references even if a plugin is uninstalled. Update discovery is separate from applying an update. Test keep/preview/replace, uninstall/reinstall, withdrawn products, changed URLs, unavailable assets, and variants removed by a catalog update.

The consumer must verify pinned content hashes before accepting catalog records, GLB files, and all dependent textures/resources, including cached resources. Snapshot accepted hashes into the project; a changed manifest cannot silently redefine a saved version. Hash mismatch preserves saved dimensions and metadata and produces a labeled placeholder/error or an explicit update proposal. Test changed bytes at the same URL/version during reopen, undo, and fresh-profile sharing. Hashes enforce content consistency, not publisher trust; initial plugin installation remains a separate trust decision.

### 4.3 Producer pipeline

1. Discover Israeli product URLs and record the discovery denominator, exclusions, and retrieval time.
2. Fetch source material with bounded concurrency, caching, retry/backoff, and resumable checkpoints. Preserve enough source evidence for dimension/variant audits. Do not treat an error or blocked response as product deletion.
3. Extract article identity, options, dimensions, images, materials, available ILS price, and usable model references. Keep extraction diagnostics per product.
4. Normalize assets into the contract; verify dimensions, axes, bounds, materials, provenance, and browser loading. When necessary, generate labeled approximate/generic geometry outside the app. No AI inference service is mandatory for runtime.
5. Validate the complete candidate release, compare coverage/field changes to the previous release, and flag suspicious mass deletions or dimension changes.
6. Publish immutable data/assets and verify them from a browser; only then atomically advance the small latest pointer. Retain the last good release and rollback pointer.

Use separate fixture-based producer CI and scheduled/manual live refresh. Live site availability must not make every application PR flaky. A producer failure leaves the last valid catalog available and reports freshness rather than publishing empty data. Asset reuse/distribution terms and attribution are a concrete producer prerequisite; no unverified assumption that every discovered 3D model can be redistributed.

### 4.4 Coverage and honest fallback

The intended v1 coverage is individual, room-placeable products in the Israeli catalog, including furnishing accessories such as blinds. A small manually curated set is a development fixture, not the coverage definition.

During M0, inventory the current catalog and establish the category/URL boundary, including treatment of ambiguous multi-part packages and excluded configurable combinations. Publish counts for discovered, successfully normalized, unsupported-with-reason, and failed URLs. Separate exact model, inferred model, and generic fallback counts. Do not invent a percentage target before seeing the denominator or quietly redefine the denominator around successful imports.

Release requires a successful source/inferred/generic import path, with dimensions and provenance, for every URL in the frozen eligible inventory. An explained failure remains a failure and does not count as successful coverage. Removing a previously eligible product requires an explicit user-approved scope change; preserve its previous membership and the decision. Report discovery exclusions, import failures and successful fallback imports separately. A nonempty holdout sample from outside the development fixtures must successfully import and place products, not merely produce an outcome report. New products outside the latest snapshot produce a useful not-yet-in-catalog message; the app cannot initiate a privileged CI refresh from an anonymous browser.

One verified seed source is the [Israeli LACK side table page](https://www.ikea.com/il/he/p/lack-side-table-white-30449908/). Reading that page establishes a product source, not proof of extractable 3D assets, permission to mirror them, or cross-origin browser loading. Those remain M0 experiments.

## 5. Release 2: WebMCP delivery

This entire integration is outside v1 acceptance. V1's shared commands, stable identifiers, previews, and serializable undo provide the architectural foundation. Native browser investigation, adapters, AI conversations, and integration tests belong to release 2.

Wrap the domain command service with tools for inspecting room/selection, locating walls/products, proposing dimension changes, importing/selecting a product, placing objects, editing finishes, managing layouts, undo/redo, and requesting exports. Return stable IDs, explicit units, ambiguity choices, proposal IDs, and errors suitable for consumer explanations.

Use revision-aware proposals: a change previewed against revision N cannot silently apply after the room becomes revision N+1. Revalidate or ask for a new preview. Share product and geometry confirmation behavior with the UI. Prevent duplicate mutation on retries and test cancellation, stale selection, and partially failed compound operations.

The current [WebMCP draft](https://webmachinelearning.github.io/webmcp/) uses `document.modelContext` and is not a finalized W3C standard. Isolate registration in an adapter and pin the tested draft/browser combination. Feature-detect support without breaking the editor elsewhere. Native integration must be verified with a real supported agent/browser session; an in-process mock is insufficient. Unsupported-browser fallback preserves manual editing, but cannot be reported as successful native AI acceptance.

Acceptance conversations include “the selected wall is actually shorter, 1.64m,” “place the IKEA PLAX furniture on the wide wall,” an ambiguous product name, two equally wide walls, and undo after save/reopen. Do not silently map PLAX to PAX or choose a wall from a guess. No separate in-app model subscription is required by this plan.

## 6. Milestones and exit gates

Effort ranges below are preliminary engineering person-weeks, not elapsed dates or measured forecasts. V1 total: **20–35 person-weeks**, excluding waiting for external access, user decisions, and catalog rights/data issues. Re-estimate after M1 from actual throughput. Multiple contributors may overlap work after shared contracts stabilize; no staffing or autonomous delegation is assumed. Full scope is substantially larger than a short prototype. Release 2 WebMCP adds a provisional 1–3 person-weeks after v1, to be re-estimated against browser availability then.

| Milestone | Effort | Dependencies | Deliverable and exit evidence |
| --- | --- | --- | --- |
| M0: contracts, infrastructure, feasibility | 1–2 | None | Reproducible repo/CI; requirement IDs; geometry/asset proofs; plugin host fetch; device/export baselines; risks resolved or explicit blockers |
| M1: first complete consumer workflow | 2–3 | M0 | Nonrectangular room via measurement form; synchronized 2D/3D; dimension edit/undo; one opening and generic furniture; local recovery/save/reopen; Hebrew controls; one real Israeli product through plugin path |
| M2: geometry and entry workflows | 2–4 | M1 | Presets/drawing/perimeter entry; curved/angled walls, columns, niches, steps, ceiling slopes; inconsistency/underdetermination guidance and preview repairs; unit and attachment invariants |
| M3: architectural and placement completeness | 5–8 | M2 | Every door family, custom/preset split windows, trim/sills/panels, beam placement, regional fixtures, snap/overlap/door swept motion; operation parity on desktop/tablet |
| M4: plugin and library completeness | 3–5 | M1 contracts; integrate with M3 | Separate IKEA Israel producer/repo, broad inventory, variants/materials, provenance, fallback, persistent library, update lifecycle, failure/rollback and browser CORS evidence |
| M5: visual and layout completeness | 2–4 | M3; M4 assets | Real-time materials/lights/glass/mirrors; local texture portability; named layouts; performance-quality profiles; agreed rendered reference scenes |
| M6: exports and portability | 2–4 | M2–M5 | Full export matrix; schedules/quantities/shopping; complete saved undo/redo/migrations; mobile shared-project viewer |
| M7: qualification and release | 3–5 | All previous | Full traceability, actual-device and accessibility review, held-out catalog and room tests, fresh-profile portability, source-bound release candidate, user acceptance and documented release |

M4 discovery/producers can progress alongside M2/M3 once M1 contracts work. Localization, recovery, accessibility, and shared-command tests start early and expand with each feature; they are not postponed wholesale to M6/M7. Release 2 integration starts after v1 and does not block its delivery.

### M0 concrete backlog

1. Initialize Git and the documented workspace once implementation starts; install pinned toolchain and the CI baseline in the infrastructure plan. Select repository names/license with the maintainer before publishing.
2. Split requirement-register entries into executable acceptance cases; maintain parent IDs. Assign a named owner to each active milestone and a reviewer for closure.
3. Run measurement-constraint proofs S01–S06 and geometry proofs G01–G06 in [dependency-decisions.md](dependency-decisions.md). Establish the solver representation and repair policy independently of mesh operations; compare Manifold and narrower 2D alternatives against independently measured geometry, openings, curved walls, thin trim, identity preservation and actual-device costs. Record the selected roles in ADRs.
4. Demonstrate browser-loaded published IKEA data and a real usable asset or correctly sized generic fallback, on desktop and tablet. Investigate broader catalog availability and rights before committing to fidelity claims.
5. Demonstrate the shared command API handles reversible dimension edits with validation and previews; no native WebMCP proof is required for v1.
6. Run PDF proofs P01–P05 before selecting jsPDF: verify vector scale, Hebrew/mixed text, font portability, drawings and multipage schedules in independent viewers. Also demonstrate mobile file-open/download, IndexedDB recovery, and serialized undo.
7. Record architecture choices and the dependency inventory; pin compatible runtime/package versions and the lockfile when installed, review licenses/maintenance/issues, freeze initial export/device/fixture matrices, and revise effort estimates with measured risks. Follow the recommended-default versus candidate distinction in dependency-decisions.md; do not install all eventual dependencies at bootstrap.

### End-of-milestone review

M0 closes on bounded feasibility harnesses: S/G/P proofs, dependency decisions, infrastructure/gate self-tests, and the other explicit M0 demonstrations. Harnesses may use synthetic inputs and minimal controls; a complete consumer editor and both integrated views are not M0 prerequisites. Report harness limitations and do not claim downstream features complete.

From M1 onward, run a short consumer scenario from an empty project, not only an internal fixture loader. Save/open in a fresh profile, undo, and inspect both views. Record incomplete IDs and failures. Each milestone closes only when its assigned obligations pass or the user explicitly changes scope; a waiver creates a qualified preview, not proof of v1 completion.

## 7. Requirements tracking and verification

The register is authoritative for tracking, while requirements.md remains authoritative for intended user behavior. Each ID maps to source section, scope, milestone, acceptance statement, planned evidence, actual test cases, and evidence records. All entries initially have status `planned`; zero features are claimed as implemented or accepted.

Use states `planned`, `in_progress`, `implemented`, `verified`, `accepted`, and `blocked`. `implemented` means code exists; `verified` requires source/build-bound automated and applicable manual evidence; `accepted` records the consumer/user review where required. Distinguish proposed technical defaults from confirmed scope. Preserve superseded requirements and approved scope changes in a changelog rather than deleting failing rows.

The CI traceability gate compares a versioned mandatory acceptance-obligation inventory against its approved baseline, independently of current tests and their mappings. It rejects missing/duplicate IDs, unmapped obligations, orphan tests, claimed verification without matching successful evidence, stale candidate identity, and retired requirements or subcases without an explicit user-approved scope decision. Deleting both a test and its mapping cannot erase an obligation; per-door-family/view/device obligations remain individually visible. It reports planned work during normal PRs; the release gate additionally fails any incomplete v1 obligation. A code-coverage percentage alone is never the completion measure.

### Acceptance fixture policy

Store the user's measurements as a literal unresolved fixture: A=206, B=306 with 66/91/149 and a separate user-labeled “actual opening 70 cm” whose measurement reference remains unresolved, C=217, D=306 with 105/91/111, ceiling=237, six B–D beams at underside 224 with height 14 and width 9, A–C beam underside 204/height19, and window/sill details from requirements.md. Do not bind 70 cm to clear passage, rough opening, or a frame/leaf parameter without clarification; use labeled synthetic door dimensions for solved tests.

Keep D's 1 cm segment discrepancy, unknown corner angles, door frame/height gaps, ambiguous beam edge spacing, and 1 cm beam embedment unresolved. Do not manufacture right angles or normalize totals in the measured fixture. Add separately named synthetic solved fixtures with explicit invented parameters for deterministic geometry checks. The real room can be demonstrated as approximate only after the user accepts a visible proposal; missing dimensions do not prevent unrelated feature development.

Important v1 adversarial cases: inconsistent loop vs underdetermined loop; reversed wall winding; tiny trim versus touching furniture; opening larger than host wall; beam intersecting ceiling intentionally; door collision midway through motion; inferred dimension losing its provenance after duplication/export; withdrawn variant; failed catalog refresh; missing texture; cancellation while saving; storage quota exhaustion; stale edit preview; malformed/decompression-heavy project; RTL PDF errors; duplicate/replayed commands; history following a schema migration. Add stale AI proposals and native agent behavior in release 2.

### Proposed performance and usability budgets

Freeze these as tested budgets in M0/M1, with named physical devices and reproducible scenes. Initial targets, not achieved results: 100 placed objects plus 30 architectural details; 95th-percentile drag frame time at most 33 ms on the selected tablet and 20 ms on desktop; selection/typing response within 100 ms; cached representative project interactive within 5 s; small model-only saves within 2 s. Separate asset network time from editor readiness; cap render detail adaptively rather than alter dimensions. Stress tests use larger layouts and slow/missing assets without promising the same frame rate.

Browser matrix: qualify desktop Chrome/Edge, Firefox, Safari; tablet iPad Safari and Android Chrome; mobile viewing on iOS Safari and Android Chrome. Freeze supported release versions and physical devices at M0 and refresh at release. Playwright WebKit is useful coverage but is not proof of real iPad Safari/GPU/touch behavior.

Recruit representative consumers for measurement entry, finding/recovering a bad measurement, product import/placement, changing a finish, duplicate/save/share, and Hebrew/touch flows. Record task outcomes and observed difficulties. Agree time-on-task thresholds after the first usability baseline rather than inventing user evidence.

## 8. Release readiness and outstanding inputs

The release candidate must have all v1 IDs and mandatory sub-obligations verified, all required consumer reviews recorded, no unresolved data-loss/measurement/provenance failures, successful eligible-product coverage for IKEA Israel, complete installation/plugin-author/user instructions, a reproducible static build, project migrations, release notes, and tested rollback. Identify the tested subject by a clean source commit, build digest, catalog hashes and acceptance-inventory digest. Store subsequent attestations separately from that source commit as defined in development-infrastructure.md; their storage commit is not the tested subject. Toolchain/browser/device evidence must bind to that same candidate. Re-run impacted checks after source changes; attaching evidence alone does not change the candidate.

Open user inputs can be collected during M0/M1 without blocking infrastructure: wall D correction, a diagonal/angle or accepted approximation, door height and frame reference, exact beam spacing/offset references, A–C width, representative desired IKEA products, and agreement on proposed UI defaults. Open operating choices: license, GitHub repository ownership, static host, physical test devices, budget, and delivery expectations. Usable catalog data is a v1 dependency. Native WebMCP access is only a release 2 dependency; mocks do not prove native integration.

No deployment, public repository creation, scheduled scraping, or product implementation is performed by this planning task. On implementation, follow the project authorization and release workflow; planning is not a claim of completion.

## 9. Primary references checked during planning

- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): current baseline uses WebGL2. Verify device support in M0.
- [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html): supported glTF loading integration; real assets still require validation.
- [WebMCP draft](https://webmachinelearning.github.io/webmcp/): current draft/API; pin and verify native runtime compatibility.
- [Chrome WebMCP preview announcement](https://developer.chrome.com/blog/webmcp-epp): preview context, not evidence of support across all target browsers.
- [GitHub Pages limits](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/github-pages-limits): hosting has size/bandwidth limits; do not assume a full asset catalog fits.
- [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use): minimal permissions and safe handling of untrusted contributions.
- [IKEA Israel LACK product](https://www.ikea.com/il/he/p/lack-side-table-white-30449908/): seed source for producer proof; no 3D availability claim.
