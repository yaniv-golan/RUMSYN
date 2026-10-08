# Dependency decisions and M0 proofs

Date: 2026-10-08
Status: Planning decisions following the user's request to incorporate the library shortlist. No packages are installed or version-pinned yet, and no proof below has run.

## Adoption policy

Use the recommended defaults below when implementing their owning features. Candidates require the specified proof before selection. A recommendation is not evidence that a library satisfies this application's acceptance criteria.

At M0, record exact package/runtime versions, direct and transitive licenses/notices, maintenance/release and relevant issue review, browser compatibility, bundle/WASM size, and dependency audit results. Commit compatible exact versions and the lockfile when implementation begins. Do not invent version pins in planning or install every eventual feature dependency at bootstrap. Record decisions and replacement rationale in ADRs; retain evidence for rejected candidates.

## Recommended defaults

| Library | Boundary and intended use | Required verification | Requirement IDs |
| --- | --- | --- | --- |
| [Three.js](https://github.com/mrdoob/three.js) | Browser rendering, materials, lights, GLB loading/export; domain model stays independent | Real tablet/WebGL2 scene, axes/units/material preservation, resource disposal | R002, R011, R019, R020, R037, R041 |
| [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | Accelerated picking and spatial queries; add where scene profiling justifies it | Compare results with independent simple shapes; update/rebuild after geometry edits; measure cost and memory on target devices | R013, R015, R041 |
| [Dexie.js](https://github.com/dexie/Dexie.js) | Browser IndexedDB recovery and product library; no Dexie Cloud dependency | Atomic edit/history saves, schema migration, quota denial, two-tab conflicts, recovery after interruption | R022, R030, R031, R033 |
| [Ajv](https://ajv.js.org/) | Shared project/plugin JSON Schema validation in browser and producer | Malformed/unknown-version records rejected; validation does not silently coerce measurements or strip provenance; precompile app-owned schemas where appropriate | R024, R025, R027, R033 |
| [fflate](https://github.com/101arrowz/fflate) | Native project ZIP read/write with state, history and local textures | Round trip in a fresh profile; enforce entry/count/decompressed-size limits; cancellation and truncated archives | R030, R031, R032, R033 |
| [React Aria](https://react-aria.adobe.com/) | Accessible editor controls, dialogs, menus and numerical fields | Hebrew RTL, touch, keyboard/focus and screen-reader workflows; library adoption does not establish application accessibility | R002, R038, R039 |
| [i18next](https://www.i18next.com/) | English/Hebrew translation and pluralization | Missing-key checks, mixed-direction product codes, translated errors, geometry unchanged by language selection | R038 |
| [glTF Transform](https://gltf-transform.dev/) | External IKEA producer asset inspection/optimization | Bounds, units, textures and material variants survive transformations; compare before/after appearance and size | R026, R027, R028 |
| [Cheerio](https://cheerio.js.org/) | External producer HTML extraction | Recorded Israeli source fixtures, product vs package dimensions, variant identity, missing fields and changed markup | R026, R028 |
| [Playwright](https://playwright.dev/) | Browser acceptance tests; producer rendering only when needed | Browser matrix and recorded producer fixtures; actual tablets remain a separate gate | R002, R026, R028, R044 |
| [Vitest](https://vitest.dev/) | Domain, command, storage and integration tests | Meaningful independent assertions, nonempty discovery and structured requirement-tagged reports | R042, R043 |
| [fast-check](https://fast-check.dev/) | Generated geometry/edit sequences and invariant tests | Retain seed and minimized failing case; check undo, units and persistence against independent expectations | R005, R009, R010, R031 |
| [axe-core](https://github.com/dequelabs/axe-core) | Automated accessibility checks | Cover relevant UI states; manual keyboard/screen-reader review remains mandatory | R039 |

The official repositories/documentation were inspected during the preceding library review. Versions and application-specific reliability remain unverified. Recheck at implementation rather than treating this document as a completed dependency audit.

## Candidates requiring selection evidence

| Candidate | Intended role | Decision boundary |
| --- | --- | --- |
| [Manifold](https://github.com/elalish/manifold), including its [WASM cross-section API](https://manifoldcad.org/docs/jsapi/classes/manifold.CrossSection.html) | Solid boolean operations and cross-section offsets/extrusions for room geometry | Leading geometry candidate; select only after G01–G06 below and acceptable tablet/WASM costs |
| [polygon-clipping](https://github.com/mfogel/polygon-clipping) | Pure-JavaScript polygon union/intersection/difference for floor regions and area operations | Evaluate for the narrower 2D role; it is not a substitute for wall offsets, arcs or a dimensional constraint solver. Avoid overlapping dependencies unless justified |
| [jsPDF](https://github.com/parallax/jsPDF) | Browser vector PDF plans/elevations and schedules | Select only after P01–P05; failure on Hebrew or scale requires another evaluated exporter, not removal of requirements |

Retain analytic line/arc parameters and stable domain entity/face IDs independently of any tessellated output. Do not let a chosen library own room identity, measurement provenance, persistent history, or material-region semantics.

## Geometry proof: G01–G06

All cases start as `not_run`. Planned evidence maps to R005–R010, R013–R016, R036 and R041. Implement as small isolated proofs before committing the production geometry architecture.

| Case | Input and expected observation |
| --- | --- |
| G01: independent geometry baseline | Labeled synthetic rectangles, concave rooms and nonrectangular polygons with independently calculated area/bounds; compare union/subtraction output and opening deductions. Do not use the library under test to calculate its own expected answer |
| G02: wall joints and thickness | Acute/obtuse junctions, reversed winding and a curved wall; preserve requested thickness and declared arc approximation tolerance without cracks, self-intersections or unexpected topology changes |
| G03: openings and thin details | Door/window cutouts near wall ends, a frame, and 1 cm protruding trim; correct bounds and overlap classifications; a too-large opening yields a domain error without corrupting existing geometry |
| G04: structural intersections | Steps, slope, and beams, including underside 224 + height 14 against ceiling 237; preserve dimensions and classify intentional construction overlap separately from furniture collision |
| G05: editing and identity | Repeated dimension edits/regeneration preserve host/face material associations; cancel/undo restores the domain state; near-coincident edges and degenerate inputs produce bounded, diagnosable behavior |
| G06: browser and resource behavior | Execute in the production-like browser build on named desktop/tablet devices; measure cold load, compute time, memory growth and repeated disposal. Move expensive work off the interaction thread where necessary; test cancellation |

Before executing, freeze numeric tolerances and resource budgets with units, device/build identity, and rationale; do not adjust them after a failure simply to produce a pass. Test pure 2D candidates only against the operations they claim, and document the additional algorithms still needed. The unresolved real-room fixture remains unchanged; solved numerical comparisons use separately labeled synthetic inputs.

Selection record: tested package version, fixture hashes, analytical comparisons, visual evidence, device timings, unsupported operations, chosen role, rejected alternatives, and reasons. Failing a candidate does not permit reducing the product's geometry scope.

## Measurement-constraint proof: S01–S06

All cases start as `not_run`; map to R004, R005, R009, R010 and R012, with M0 selection tracked by R042. Prove these independently of the mesh library in a bounded harness. Passing boolean/mesh tests does not prove measurement reconciliation.

| Case | Input and expected observation |
| --- | --- |
| S01: insufficient measurements | Four perimeter lengths with multiple possible quadrilaterals; explicitly report underdetermination, preserve inputs, and identify useful extra measurements instead of inventing right angles |
| S02: sufficient constraints | A labeled synthetic quadrilateral with sufficient additional measurements and known orientation; compare solved coordinates/distances to an independent numerical construction, and detect any remaining mirrored/alternative solution |
| S03: contradictory segments | Wall D total 306 against 105/91/111; identify the 1 cm disagreement without deciding which supplied measurement is wrong |
| S04: incompatible locks | Conflicting fixed lengths/angles or attachments; identify conflicting constraints, preserve locked inputs and report when no allowed repair exists |
| S05: explicit repair | Offer a feasible proposal with each changed input, old/new value, residual and reason; apply only after acceptance; approximate shape proposals remain visibly approximate |
| S06: transactional behavior | Cancel leaves all measurements/provenance unchanged; applying and undoing restores the original state and attachments; a stale preview cannot apply against a changed model without revalidation |

Freeze numerical tolerances before running these cases. The ADR must identify constraint representation, degrees-of-freedom/contradiction detection, repair priorities, lock semantics, alternate-solution handling and the independent numerical oracle. Preserve the real-room fixture's unresolved references; synthetic solved cases are not corrections to the user's measurements.

## PDF proof: P01–P05

All cases start as `not_run`. Planned evidence maps to R034, R035, R036 and R038. Run generation entirely in the browser.

| Case | Input and expected observation |
| --- | --- |
| P01: physical scale | A4/A3 vector drawing with a 100 cm calibration line at 1:20; output is 50 mm. Check PDF coordinates with an independent reader and print at actual size to verify the print workflow; include scale/unit legends |
| P02: Hebrew and mixed direction | Embed a distributable Hebrew-capable font; render Hebrew room/fixture labels mixed with English IKEA names, article numbers, decimals, parentheses and imperial dimensions. Verify reading order, visual output and text extraction |
| P03: real drawing content | Nonrectangular floor plan and wall elevation with openings, sill and beams; dimensions agree with the model and remain legible rather than clipped/overlapping |
| P04: multipage schedules | Product/fixture tables with long Hebrew labels, links, quantities and ILS prices; wrapping, repeated headers, page breaks and missing-value indicators work |
| P05: portability | Open generated files in independent desktop and mobile PDF viewers; fonts work without local installation; rendering is vector where required and browser generation completes within frozen resource budgets |

Review PDF numbers/scale separately from visual approval. A correct-looking screenshot cannot prove dimensions or selectable Hebrew text. Save example outputs, source fixtures, independent measurements and reviewer results in the evidence manifest.

## M0 completion and later ownership

M0 must complete measurement-constraint, geometry and PDF selection proofs in bounded harnesses, the dependency/compatibility inventory, and initial ADRs. The complete consumer workflow starts at M1, not M0. Defaults for features arriving later receive focused validation when their milestones implement them; they must not be marked verified by the M0 inventory alone. Tests for storage/schema/archive boundaries start with the M1 workflow and expand through M6. Producer optimization/extraction qualifies in M4, rendering in M5, and device/accessibility closure in M7.

We continue to own measurement reconciliation, attachment rules, parametric doors/windows, collision semantics, provenance, undo/version migrations and plugin contracts. Native WebMCP remains release 2. No library selection changes those release boundaries.
