# Development infrastructure plan

Date: 2026-10-08
Status: Planned files, commands, and workflows. None of the scripts or CI jobs described here exist or have run yet. The requirement register is an actual planning artifact; its entries are all planned.

## 1. Repository structure

Use one application workspace and a separate public IKEA Israel producer/plugin repository. Avoid a dependency-heavy build orchestrator until needed; a pinned package manager with workspaces is sufficient initially.

```text
AGENTS.md
README.md
CONTRIBUTING.md
LICENSE
package.json / lockfile / runtime-version file
.github/
  workflows/{ci,nightly,release}.yml
  ISSUE_TEMPLATE/{feature,bug}.yml
  pull_request_template.md
  CODEOWNERS
apps/web/
packages/
  model/                 # Units, geometry, constraints, provenance, entity schema
  commands/              # Validation, previews, mutations, inverse/history
  geometry/              # Shape generation, openings, collision/swept paths
  view2d/                # Plan rendering and interaction
  view3d/                # Three.js rendering and interaction
  catalog/               # Plugin install, URL lookup, library, updates
  plugin-contract/       # Schemas, examples, producer conformance harness
  persistence/           # IndexedDB, archive, migrations, recovery
  exports/               # PDF, SVG, DXF, CSV, raster, GLB
  localization/          # English/Hebrew, RTL and unit formatting
  webmcp/                # Release 2 only; not an empty v1 delivery claim
scripts/
tests/
  unit/ integration/ browser/ visual/ exports/ fixtures/
docs/
  requirements.md
  requirements-register.json
  acceptance-obligations.json # Versioned mandatory subcases, established in M0
  delivery-plan.md
  development-infrastructure.md
  dependency-decisions.md
  decisions/             # Small dated ADRs
  scope-changes.md
  acceptance/            # Human protocols and results
  plugin-authoring.md
  evidence/              # Evidence protocol/index; candidate attestations stored separately
artifacts/               # Ignored local evidence; CI uploads selected outputs
```

Keep packages narrow but do not split trivial helpers into separate packages. Enforce dependency direction: domain model has no DOM/Three.js/UI dependency; renderers and exporters consume it; commands own persistent mutations; catalog/persistence decode into validated domain data. Publish the plugin contract with a version and fixture suite usable outside this repository.

## 2. AGENTS.md content to establish in M0

Create the root instructions as part of infrastructure implementation. Preserve the user-supplied AWS rules when materializing the file; do not remove or weaken them. No AWS service is selected or required by this plan. Add these project-specific rules:

1. Read requirements.md, the register, and applicable ADRs before editing. Identify requirement IDs in the work summary and PR. Latest explicit user scope changes take precedence; record them.
2. Keep the application browser-only. Offline catalog producers are a separate boundary. Do not introduce mandatory accounts, a server-side model, or an AI backend without a scope decision.
3. Modify persistent state through commands. Keep 2D/3D, export, undo, and future AI semantics aligned. Never fix a render-only symptom by diverging from domain geometry.
4. Never silently change user measurements, product provenance, locale-specific product identity, or stored project versions. Preserve uncertainty and show previews for repairs.
5. Do not downgrade an acceptance requirement to pass CI. Do not relabel inferred dimensions as verified or replace the real-room fixture with invented values. Synthetic fixtures must be explicitly named.
6. Use the pinned toolchain and documented helper scripts. Run focused meaningful checks first, then applicable CI gates. Report failed, skipped, unavailable, and unrun checks distinctly.
7. Require schema/version and migration evidence for project/plugin format changes. Include history/assets in portability reasoning, not just current-state JSON.
8. Edit English/Hebrew resources together; test RTL, keyboard, and touch implications of UI work. Do not use color as the only error indicator.
9. Keep catalog CI fixture-based by default. Live extraction belongs to the producer workflow with bounded requests and observable failures. Never publish an empty catalog on fetch failure.
10. Avoid running arbitrary plugin code in the application. Treat plugin metadata as data, bound resource size/depth, and sanitize display/export text.
11. Record evidence against source/build/catalog hashes. A screenshot, passing unit test, or self-reported checklist alone does not prove end-to-end consumer acceptance.
12. Respect current authorization and concurrent edits. Do not incidentally publish, deploy, create schedules, or rewrite shared history. Work in a named branch; use isolated worktrees where concurrent work warrants them. Do not infer permission for extra agent delegation.
13. End work summaries with changed behavior, validated requirement IDs, test evidence, and remaining gaps. Never call a milestone/release complete with unmet required IDs.

Use scoped AGENTS.md only for genuinely distinct instructions, such as producer extraction or export validation; avoid copying conflicting versions of root rules.

## 3. Bootstrap and reproducibility

Pin a currently supported Node runtime, package-manager version, lockfile, and browser test versions after M0 verification. Document one clean-install command and avoid unpinned latest dependencies. Build assets locally from the lockfile rather than importing executable runtime libraries from mutable CDNs.

Use [dependency-decisions.md](dependency-decisions.md) for the default libraries and candidate selection gates. M0 produces an inventory of exact installed versions, compatibility, licenses/notices, maintenance and audit findings; geometry/PDF candidates additionally require the specified proof evidence. Preserve these results in ADRs and the evidence manifests. Dependency updates rerun affected compatibility and regression checks before changing pins; no automated baseline acceptance.

`doctor` must inspect tool versions, required binaries, browser installation, port availability, filesystem support, and fixture presence. It reports missing dependencies with remedies; it does not silently install software or kill unrelated processes.

Record source revision, dirty-tree digest where relevant, lockfile hash, toolchain, schema versions, build hash, acceptance-inventory digest, and catalog content hashes in build/evidence manifests. A release requires a clean source revision. Development evidence can identify a dirty tree explicitly rather than mislabel it as the current commit.

Define the tested candidate as `{sourceCommit, buildDigest, catalogHashes, acceptanceInventoryDigest}`. Tests run against that frozen subject. Store their attestations in an external immutable artifact store or a separate evidence branch, never by changing the candidate's source commit. An evidence-record commit is not the source commit it attests to. Release notes/status indexes may link to that candidate later, but production must promote its exact build artifact rather than rebuild the newer index commit. A final acceptance manifest identifies the candidate and hashes all required attestations; retain it by its own content digest. Changes to candidate source, build, catalog or obligation inventory create a new candidate requiring applicable verification; attaching attestations does not. Define this subject/store distinction in helper scripts rather than compare every evidence record with the evidence branch's HEAD.

Document local production-like preview using the same base path and asset routes as the static host. Ensure refresh/deep links work without a server router. API/CORS errors must be visible and recoverable.

## 4. Helper scripts and their contracts

The following names are proposed package scripts, to be implemented and documented in M0 or the owning feature milestone. Commands must return nonzero on failure and machine-readable output where the gate consumes it. They must not report success with zero discovered tests.

| Command | Purpose | Required output / failure behavior |
| --- | --- | --- |
| `pnpm doctor` | Verify local prerequisites | Version/capability report; precise missing prerequisite |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Develop, build static artifact, inspect production build | No required application server in deployed output |
| `pnpm check` | Formatting, lint, type and dependency-boundary checks | Deterministic errors; no source rewriting in CI |
| `pnpm req:check` | Validate IDs, source links, scope, states, evidence references, scope changes | Fail duplicates, orphan IDs/cases, fabricated verification, missing current-source evidence |
| `pnpm req:report` | Generate status table from register and reports | Counts by release/milestone/state; distinguish planned and proven |
| `pnpm test:unit` | Units, geometry, commands, provenance and history invariants | Structured results tagged with requirement IDs |
| `pnpm test:integration` | Storage, catalog, migrations, export structures | Deterministic fixture-based tests |
| `pnpm test:e2e` | Consumer workflows in Chromium/Firefox/WebKit | Results, failure screenshots, trace on failure; preserve initial failure despite retry |
| `pnpm test:visual` | Stable views, trim, openings, materials, RTL layout | Reviewed diffs; never auto-accept baselines in CI |
| `pnpm test:a11y` | Automated UI accessibility plus protocol inventory | Findings; manual keyboard/screen-reader work stays explicitly separate |
| `pnpm test:exports` | Numeric/unit/scale checks and independent reopening | Example files, parsed assertions, rendered page evidence |
| `pnpm test:perf` | Repeatable scene load, frame/input/storage timing | Device/scene/build metadata and percentiles; distinguish CI proxy from physical-device results |
| `pnpm fixture:check` | Validate literal user fixture and labeled synthetic fixtures | Fail silent changes to measured input or provenance |
| `pnpm plugin:validate -- <manifest>` | Contract/asset/variant/provenance validation | Per-record diagnostics; unsupported schema fails explicitly |
| `pnpm project:inspect -- <file>` | Diagnose portable file without mutating it | Version, contents, references, history consistency, missing resources |
| `pnpm verify -- --scope <IDs>` | Execute mapped affected checks | Evidence manifest with exact selected/discovered/passed/skipped cases |
| `pnpm release:check -- --release v1` | Check every v1 acceptance obligation and candidate identity | Fails incomplete IDs, required skipped tests, stale evidence or unresolved release blockers |

The producer repository adds `catalog:discover`, `catalog:fetch`, `catalog:normalize`, `catalog:validate`, `catalog:diff`, and `catalog:publish`. Separate read/build stages from publishing. Support cached fixture mode, resumable live mode, explicit country, dry-run publication, and an immutable output directory. Ensure failure midway cannot update the latest pointer.

Implement only useful scripts when their dependencies exist. Do not create placeholder scripts that exit successfully, nor introduce enormous framework machinery to manage a small register.

## 5. Requirements and evidence format

The checked-in requirements register begins with planned work. Establish `docs/acceptance-obligations.json` in M0 before treating traceability coverage as complete: stable obligation IDs, parent requirement, release, required mechanism/view/device variants, expected result and retirement decision. This is the mandatory inventory, separate from executable test IDs and test-to-obligation mappings. Record and retain its approved baseline digest. Compare proposed changes against that baseline (and the latest approved revision), rather than generate the inventory from whatever tests remain. Each active obligation must have appropriate passing evidence at release; multiple obligations can share a test only when its assertions actually cover each one.

For R015, individually inventory single-hinged, double-hinged, wall-sliding, pocket, folding and pivot door movement, including a mid-motion obstruction witness for each applicable mechanism. Deleting a test and its mapping leaves its mandatory obligation unmet. Deleting the obligation too requires an explicit user-approved retirement/scope decision and preserves its prior record. Extending a family/view/device adds obligations; a passing parent row cannot replace them.

Extend mappings with actual case IDs and test paths as tests are authored. Each case asserts observable behavior; a test that merely repeats implementation constants is inadequate. For example, assert that saved/reopened history can undo a wall move and restore its attached opening, not merely that a history array exists.

Evidence manifests should include: candidate identity, requirement and mandatory-obligation IDs, executable case IDs, scope/version, fixture hashes, environment, command, timestamps, outcome (`pass`, `fail`, `skip`, `not_run`, `blocked`), artifact references, and reviewer for manual work. CI verifies manifests against actual test runner reports instead of trusting an editable `passed: true` field. Evidence-store commit identity is recorded separately and must never substitute for tested-source identity.

Use PR templates requesting problem/behavior, requirement IDs, verification, screenshots where useful, migration/compatibility impact, and remaining gaps. Issue templates capture reproduction, project/browser/device versions, dimensions/units, and expected behavior. Do not require users to publish private room files to report a bug.

Keep `scope-changes.md` with old/new scope, date, reason, and user authorization. Initial entries: IKEA Israel is the v1 plugin, broader countries later; WebMCP moves to release 2. Technical estimates and library changes are ADRs, not scope changes.

### Traceability self-tests

Test the gate itself with deliberately bad fixtures: missing ID, duplicate ID, zero-case test report, wrong candidate/build hash, stale manual evidence, removed feature row, a v2 feature incorrectly counted as v1 complete, and a skipped required case. Also delete a mandatory folding-door test and its mapping together, delete that obligation without an approved retirement, and provide only hinged-door coverage for the whole door family: all must fail. A reviewed IKEA import failure must remain failed coverage. Attaching evidence in a separate store must preserve candidate validity, while modifying candidate source must invalidate applicable evidence. Each negative fixture must fail for the intended reason. A register link is traceability, not evidence that the linked behavior works.

## 6. CI/CD workflows

| Workflow | Trigger during implementation | Required jobs | Publication / evidence |
| --- | --- | --- | --- |
| App PR CI | Pull request and branch push | Frozen install; check; req/schema/fixture validation; unit/integration; production build; affected e2e with critical smoke always; accessibility/visual checks where relevant | Build and test artifacts; no production deployment from untrusted PR |
| App full regression | Main updates and scheduled nightly once configured | Full browser matrix, all integration/e2e, exports, migrations, history/recovery, performance proxy, missing-resource fixtures | Consolidated reports; nightly failure creates actionable status, not a green release |
| Preview | Validated trusted candidate | Deploy exact built static artifact to isolated preview if host supports it; otherwise provide downloadable preview artifact | Source-labeled URL/artifact, separate storage origin where possible |
| App release | Maintainer-approved version/tag flow | Full release check, device/manual evidence, artifact identity verification, post-deploy smoke | Promote exact verified artifact, record version, keep prior artifact for rollback |
| Plugin PR CI | Producer pull requests | Recorded-source extraction, schemas, dimensions/variant fixtures, browser asset tests, coverage diff | Candidate data; no live publishing |
| Plugin refresh | Manual; proposed daily schedule only after setup | Bounded live extraction, candidate validation, inventory/field drift report, browser fetch check | Publish complete immutable candidate; change latest pointer last; keep last good catalog on failure |

Use path-aware checks only with a tested impact map. Changes to model, commands, schemas, shared geometry, or build tooling trigger all dependent suites. Full release checks never rely solely on changed paths. Shard independent tests for runtime, cancel superseded PR runs, and avoid multiple concurrent publishers advancing the same catalog pointer.

Protect the main branch with required status checks and review policy. Pin third-party action revisions, set minimal job permissions, and keep untrusted PR code separate from publishing authority. Use CODEOWNERS for model/schema, plugin contract, producer, and release workflow changes. Configure notifications for failures requiring action; do not send routine successful-refresh noise.

Publish release notes and asset/license inventories with artifacts. Hosting changes use explicit configuration; no AWS infrastructure is implied. Test rollback to the previous app artifact with a project saved by the new version: retain export/recovery rather than silently down-migrating unsupported data. Plugin rollback changes the advertised version while existing projects retain their own version reference.

## 7. Manual qualification infrastructure

Maintain small protocols with inputs, observable expected results, device/browser/build, outcome, and evidence:

- Desktop mouse and keyboard; iPad/Android tablet touch; mobile shared-file viewing.
- English and Hebrew; actual RTL PDFs and mixed Hebrew/product-code strings.
- Screen reader object list, numerical editing, errors, and save/export dialogs.
- Representative real-time lighting/material scenes compared to approved visual references.
- Data recovery: refresh/crash simulation, quota denial, two open tabs, migration failure, interrupted save, and missing remote assets. Use a single-writer/revision check or conflict prompt to prevent two tabs overwriting one project.
- Measurement-entry usability with nontechnical people, including an unresolved room and conflicting wall segments.
- Fresh-profile recipient opens a project with no installed plugin and no prior library; current state and saved history remain usable, and nothing enters the library automatically.

A failed required manual case stays failed even if the automated browser suite passes. Store bulky recordings as CI/release artifacts; retain small immutable evidence manifests in the separate evidence store/branch, referencing the frozen candidate. The source repository stores the evidence protocol and may link to attestations without changing their tested subject. Set artifact retention long enough for release audits and retain final release evidence independently of short-lived PR logs.

## 8. Definition of done

Feature: consumer behavior implemented in its required views, state/history/serialization covered, localization/accessibility handled, mapped acceptance tests pass, relevant failures and resource limits handled, docs/register updated, and evidence identifies the exact code.

Milestone: every assigned obligation meets its exit gate. M0 uses its bounded proof harnesses and infrastructure demonstrations; the integrated consumer scenario is required from M1 onward. A working partial build can be shared as a preview with gaps listed.

V1: all v1 requirements verified and applicable human acceptance complete. WebMCP belongs to v2 and must be reported as planned, not implemented. Test successes from v2 mocks cannot compensate for missing v1 behavior, and missing v2 integration cannot block a genuinely complete v1.
