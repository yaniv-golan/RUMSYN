# RUMSYN product requirements

Date: 2026-10-08
Status: Draft for review. Confirmed requirements are recorded below; proposed defaults and unresolved details are explicitly identified.

## 1. Product and scope

RUMSYN is a free, community-developed, open-source, browser-based JavaScript room modeler for general consumers. It helps people represent an existing room, explore furnishing layouts, and produce useful information for shopping, DIY, and renovation.

The initial release includes the features in this document unless explicitly deferred. The model contains one room per project. Users can maintain multiple projects and named layout alternatives.

Desktop and tablet editing are first-priority experiences. Mobile is secondary but must support opening projects, viewing the model, rotating, panning, and zooming.

All application execution, editing, rendering, project recovery, and project-file generation take place in the browser. Internet access is assumed for externally referenced catalog data and assets. Plugin data production may run outside the browser, including in GitHub Actions. No application backend or user account is required for the initial workflows.

The intended visual quality is realistic real-time Three.js rendering, not offline architectural visualization. The application must support materials, lighting, glass, mirrors, and convincing product appearance within that target.

## 2. Modeling and measurement

### 2.1 Multiple ways to start

Users must be able to enter basic measurements using multiple common mental models. No single construction workflow may be the only way to create a room.

Proposed initial entry methods:

- Choose a common room outline, then edit dimensions and corners.
- Draw an outline in plan view, then enter measured dimensions.
- Describe the perimeter wall by wall, including opening segments.

These methods edit the same underlying geometry and must remain interchangeable. The precise preset list is a design decision.

### 2.2 Geometry

- Support nonrectangular rooms, unequal opposing walls, angled and curved walls, alcoves, columns, niches, sloped ceilings, stepped floors, and changing ceiling heights using simplified shapes.
- Do not require modeling small floor-surface irregularities.
- Support wall thickness with editable defaults. Distinguish room-facing surfaces from wall thickness and decorative protrusions.
- Support ceiling beams, including custom placement and multiple heights, lengths, widths, and orientations.
- Represent frames, architraves, wall panels, baseboards, cornices, and window sills as distinct geometry with editable dimensions and protrusions.
- Include protruding architectural details when checking furniture overlap.
- Furniture placeholders expose adjustable width, depth, and height. Initial categories include at least tables, chairs, and cabinets; the complete category list remains a design decision.

### 2.3 Units and accuracy

- User-configurable metric and imperial display/input.
- Metric dimensions display in centimeters with two decimal places.
- Accept explicit units in input, including conversational requests such as `1.64 m`.
- Imperial presentation must follow customary architectural conventions. Proposed default: feet-and-inches with fractional inches, while also accepting decimal-inch input. Fraction resolution remains to be selected.
- Changing units must not cumulatively round or alter stored geometry.
- Display precision must not be presented as a guarantee of measurement accuracy.
- Keep entered measurements distinguishable from derived or automatically adjusted dimensions.

### 2.4 Incomplete and inconsistent measurements

- Do not silently reshape or change measurements to produce a closed room.
- Explain inconsistent measurements in plain language and highlight the relevant walls, corners, or segments.
- Identify likely sources of error without claiming to know which measurement is wrong.
- Offer an automatic repair with a preview listing proposed changes. Apply only after the user accepts; support undo.
- Distinguish contradictory measurements from insufficient measurements. Wall lengths alone may leave corner positions and angles undetermined.
- When more information is needed, offer understandable alternatives such as marking a known right angle, measuring between indicated corners, or accepting a clearly labeled approximate shape.

## 3. Editing and layout exploration

- 2D and 3D are equally capable editing experiences backed by the same model.
- Selection exposes dimensions, elevation, rotation, and distances from relevant walls.
- Support mouse, keyboard, and touch interactions. Essential actions must not depend on hover or precision dragging alone.
- Support snapping to walls, floors, objects, and alignment guides.
- Highlight overlaps visually, with an accessible textual indication. Overlap is not a hard prohibition on placement.
- Check door movement against furniture and architectural geometry. Drawer movement and walking-clearance checks are outside the initial scope.
- Support undo/redo, including geometry, placement, material, and product-variant edits.
- Create layout alternatives through a simple duplicate-and-rename workflow. Alternatives must be saved in the project file.

Proposed behavior for architectural edits, pending review:

- Moving a wall adjusts connected wall endpoints to preserve closure where constraints permit.
- Doors, windows, fixtures, and trim stay attached to their host wall. Preserve their existing offset from the nearer wall endpoint where possible, with the anchor visible and editable.
- Freestanding furniture retains its room coordinates. Furniture explicitly attached to a wall follows it; temporary alignment snapping alone must not create an undisclosed permanent attachment.
- Preview affected objects and conflicts before applying numerical dimension changes.
- If an opening no longer fits or locked dimensions conflict, explain the problem and offer repairs; do not silently delete or resize objects.

Open design decision: whether room-shell changes propagate to all named layouts. Proposed simplest behavior is independent complete snapshots after duplication, with no hidden cross-layout updates.

## 4. Doors, windows, fixtures, and surfaces

### 4.1 Doors

- Support single and double hinged doors, wall-mounted sliding doors, pocket doors, folding doors, and pivot doors.
- Edit dimensions, elevation, frame geometry/depth, threshold, handing, opening direction, and opening amount as applicable.
- Represent the door's movement envelope for collision checking, rather than checking only its current pose.

### 4.2 Windows

- Provide editable presets and custom window composition.
- Support pane divisions into rows and columns, including a fixed lower or upper portion and independently openable neighboring panes.
- Assign fixed, hinged, tilt-and-turn, sliding, or other supported opening behavior per pane.
- Edit the whole opening, frame, pane divisions, elevation, recess, and sill geometry.
- Treat shutters, screens, blinds, and similar accessories as furnishing objects rather than part of the window-composition system.

### 4.3 Fixtures

- Include US, Israeli, and European electrical outlet representations, as well as switches, data/TV sockets, and multi-gang plates.
- Fixtures have actual dimensions, mounting elevation, orientation, and protrusion for visual placement and furniture overlap checks.
- Do not model circuits or provide electrical design calculations.
- The exact set of European socket variants and additional fixture families remains to be enumerated; Europe must not be represented as having one universal socket design.

### 4.4 Materials and lighting

- Assign wall and floor materials and colors, including texture-based materials.
- Support different finishes on opposite wall faces.
- Allow user-supplied material textures.
- Support daylight with location/time controls and artificial lighting.
- Support glass transparency and mirror appearance within real-time rendering limits.
- Defer multiple finish regions on one wall face to a later release. The data model must allow future region-specific material assignments without replacing the project format.
- Define tablet quality settings and measurable performance targets during technical validation; none are established yet.

## 5. Product library and plugins

### 5.1 User workflow

- A user installs a plugin from a public GitHub repository conforming to a documented format.
- A user pastes a product URL to add it to their persistent local product library, which is available across projects.
- Store the source link, manufacturer, product name, dimensions, variants, materials, images, available price/currency information, and a 3D representation.
- Preserve retrieval/version information and clearly label unavailable fields; do not invent missing product data.
- Support adding a library product to a room and choosing its supported size, color, material, or other individual-product options.
- Deliberate option changes show a preview and Apply/Cancel controls.
- A newly discovered catalog update produces a notification and a visible indication, with options to keep the existing version, preview the update, or replace it. Do not silently update placed items.

### 5.2 Plugin boundary

- A plugin is a public GitHub repository in an agreed format, providing compatible web-accessible data and assets.
- Data acquisition and generation are the plugin's responsibility. Scraping, inference, asset conversion, and CI/CD generation may occur outside the application.
- The browser consumes the published compatible output; the room modeler is not required to scrape retailer websites directly.
- The plugin contract must document identification, supported product URLs, catalog versions, product identifiers, variants, dimensions/units, material mappings, model coordinate conventions, provenance, asset references, and compatibility versions.
- Published resources must be retrievable by the application in a browser, including appropriate cross-origin access where necessary.
- The contract must distinguish verified source data, inferred data, and generic substitutes at the relevant field/model level.
- Unsupported, incomplete, malformed, or unavailable plugin data must produce a useful explanation and must not corrupt the project.
- End users must be able to install and remove plugins through the application. The repository format and discovery/update UX require a separate specification.
- The default contract should be data-driven. Whether arbitrary plugin code is ever permitted is unresolved and must not be assumed.
- External contributors may implement standalone 3D-file import plugins. A first-party standalone-file importer is not required initially, but the extension contract must accommodate that future workflow.

### 5.3 First included plugin: IKEA Israel

- First release: include an IKEA Israel plugin supporting Israeli product URLs, local variants, Hebrew product information, and available ILS prices. This supersedes the earlier all-country first-release scope at the user's explicit request on 2026-10-08.
- Preserve country-aware identifiers and extensibility for other IKEA catalogs later. Do not silently substitute another country's product or dimensions.
- Start with individual products; configurable multi-product systems are deferred.
- Scraping is explicitly allowed for catalog generation when needed.
- Prefer usable source 3D assets. If unavailable, an inferred model is acceptable with visible provenance; otherwise use dimensioned generic geometry.
- Product coverage and asset fidelity must be honest: a recognized URL does not guarantee a verified detailed 3D model.
- Every product in the frozen eligible release inventory must successfully import using source, inferred, or generic geometry with dimensions and provenance. Explained failures remain blockers; removing eligible products requires an explicit user-approved scope change.
- Catalog refresh is separate from changes to an existing project or saved library entry.

## 6. Local persistence and portability

- Automatically preserve browser-local recovery state.
- Provide explicit saving and opening of portable project files, suitable for sending through email, WhatsApp, or other file-sharing channels.
- Save named layouts and undo history. The precise history-retention limit remains unresolved; the saved history must remain executable when reopened.
- External models and textures may remain internet references rather than being embedded. Offline completeness is not required.
- Preserve enough project-owned dimensions, placement, variant identity, material choices, and provenance to explain the model even when an external resource becomes unavailable.
- Use a visible placeholder and recovery explanation when a referenced asset is missing; never silently replace it with a different product/version.
- Verify saved content hashes for remote catalog records, models and dependent textures before use, including cache reads. If bytes change at an unchanged URL/version, preserve saved metadata and show an error/placeholder or an explicit update choice; never silently accept replacement content.
- Opening someone else's project must not automatically add its products to the user's personal library. Provide an explicit action to do so.
- Provide project format versioning and migrations. Browser-local recovery is not a substitute for an exported backup file.
- Define browser-storage limits, eviction handling, file-size expectations, and history limits during technical validation.

## 7. Outputs

Outputs describe modeled dimensions, placements, products, and material quantities. Construction details, structural design, electrical circuit design, and installation drawings are outside the initial scope.

The user requested the common outputs useful to renovation professionals, DIY users, and shoppers. The proposed export set is:

- Dimensioned, to-scale PDF floor plans and wall elevations, with explicit units and print scale.
- Door/window and fixture schedules.
- Furniture/product shopping lists with quantities, chosen variants, original links, and available price, currency, and retrieval date.
- Material areas/quantities with documented deductions for openings. Configurable waste allowance is proposed, not yet confirmed.
- Screenshots and rendered views.
- Portable native project files including named layouts and undo history.
- SVG and DXF drawings, CSV schedules/shopping lists, and a standard 3D scene export. Exact versions and 3D export format require a format matrix before implementation.

Do not present approximate models, missing prices, mixed currencies, or inferred quantities as verified purchasing or construction facts. Exports must carry relevant approximation indicators.

## 8. Language, accessibility, and AI operation

- Initial languages: English and Hebrew, with localization infrastructure for additional languages.
- Support appropriate left-to-right and right-to-left interface layout without changing room geometry or coordinate semantics.
- Accessibility-friendly editing includes keyboard operation, accessible labels, visible focus, sufficient contrast, and non-color-only warnings.
- Provide an accessible object list and numerical property editing as alternatives to manipulating the visual canvas. The formal accessibility conformance target remains to be selected.
- Release 2: support WebMCP for ordinary consumer operations through AI chat, using the same validation, selection, preview, and undo mechanisms as direct editing. Explicitly deferred from v1 by the user on 2026-10-08. V1 should preserve a reusable command interface, but native WebMCP support is not a v1 gate.
- Example: “The selected wall is actually shorter, 1.64 m” resolves the current selection, previews the dimensional edit, and identifies affected geometry.
- Example: “Place the IKEA PLAX furniture on the wide wall” searches available catalog/library data and identifies the intended wall. If product identity or placement is ambiguous, request clarification rather than silently choosing a product.
- Product variant changes and automatic geometry repairs retain their required preview/approval behavior when initiated through AI.
- A first-party in-app chat service, model provider, or credential workflow has not been requested. WebMCP support must not be interpreted as authorization to require one.

## 9. Acceptance fixture: user's room

All dimensions below are in centimeters. These are supplied measurements, not a fully solved room shape.

| Element | Supplied information | Unresolved detail |
| --- | --- | --- |
| Wall A | 206; no known right-angle corners | Corner angles and exact relationship to C |
| Wall B and door | 306; clockwise segments: wall 66, door region 91, wall 149; user-labeled “actual opening” 70; opens inward toward A | Reference for 70 (clear passage, rough opening or frame measurement) unresolved; door height, frame/leaf geometry and position within the 91 region unresolved |
| Wall C | 217; opposite A; no known right-angle corners | Corner angles and exact relationship to A |
| Wall D | 306; clockwise segments: wall 105, window 91, wall 111; 105 confirmed by user | Segments total 307 rather than 306; reconcile total or segment measurement |
| Window elevation | Sill top is 47 above floor | Window frame/section elevation relative to sill top |
| Window | Total height 162; lower fixed part 30; upper half nearer A slides over the other half | Frame/divider dimensions and width/height measurement references |
| Window sill | Approximately 23 total depth, protrudes 10 into room; wall thickness 15; frame accounts for 2 | Confirm depth reference; possible interpretation is 10 + 15 - 2 = 23 |
| Beams spanning B–D | Six beams; one flush against C; corrected height 14, width 9; stated outer-edge-to-outer-edge spacing 56; confirmed underside elevation 224 | Whether 56 means corresponding edges or the far outer edges; endpoint geometry |
| Beam spanning A–C near B | Corrected height 19; confirmed underside elevation 204; stated distance from B to beam 24 | Confirm 24 is to nearest face of this beam; whether width 9 also applies |
| Ceiling | Corrected height 237; B–D beam tops calculate to 238 | Beam tops extend 1 above the ceiling plane; clarify whether this is intentional embedment or measurement approximation |

Derived values, conditional on the stated measurement references:

- Window top: 47 + 162 = 209 above floor, only if total window height is measured from sill top.
- Lower fixed section top: 47 + 30 = 77, only if its height begins at sill top and includes the intended section boundary.
- B–D beam tops: 224 + 14 = 238, extending 1 above the corrected ceiling plane at 237. Their exposed depth below the ceiling is 237 - 224 = 13. Preserve the confirmed measurements; whether the 1 cm represents embedment or measurement approximation remains unresolved.
- A–C beam top: 204 + 19 = 223.

These derived values must not resolve beam elevations or frame dimensions by assumption. No right-angle corners are known. A nonrectangular quadrilateral with the supplied wall lengths remains underdetermined without additional geometric information or an accepted approximation.

## 10. Initial release acceptance criteria

1. A consumer can create the same measured room through the supported entry methods and edit its dimensions in either 2D or 3D.
2. Unequal opposing walls are retained, not normalized into a rectangle. Underdetermined geometry is identified or explicitly approximated.
3. Entering the unresolved D measurements as 105/91/111 against 306 produces a visible 1 cm discrepancy and a previewable repair, without silently changing the input.
4. The acceptance room's fixed lower window section, protruding sill, frames, and beams appear at their entered positions and affect applicable overlap checks.
5. A consumer can add every required door family and create both a preset and custom split window.
6. A consumer can place supported outlets and fixtures at specified elevations and observe conflicts with furniture.
7. A consumer can install the included IKEA Israel plugin, add an Israeli product by URL, inspect provenance, choose supported variants, and place it with correct recorded dimensions. Missing detailed geometry falls back visibly to inferred or generic geometry.
8. Catalog updates cannot silently change saved placements or product options. Keep/preview/replace choices work as specified.
9. A dimensioned generic table, chair, or cabinet can be resized and placed using both touch and desktop controls.
10. Overlap and door-movement conflicts are reported visually and textually without preventing intentional object placement.
11. Named layout alternatives, product references, and saved undo history survive a save/open round trip in a separate browser profile. Referenced products enter the recipient's library only through explicit action.
12. Missing external assets do not prevent opening the rest of the project and produce identifiable placeholders.
13. Metric/imperial switching preserves geometry; English/Hebrew switching preserves model meaning and supports the corresponding interface direction.
14. The agreed export matrix produces dimensioned drawings, schedules, quantities, and shopping information consistent with the selected layout.
15. Release 2 acceptance (not a v1 gate): an AI client using WebMCP can perform the example consumer edits with the same ambiguity handling, previews, and undo behavior as the interface.
16. Mobile can open, inspect, rotate, pan, and zoom a shared project. Desktop/tablet can complete the editing workflows.

Performance budgets, browser/version support, rendering-quality references, regional outlet inventory, export versions, and representative IKEA product URLs must be established before release acceptance can be considered complete.

## 11. Outstanding decisions

- Reconcile wall D's stated 306 total with its confirmed 105/91/111 segments totaling 307.
- Establish the acceptance room's angles or approve an approximate shape; clarify door height/frame placement, beam spacing references, and the A–C beam's width/offset reference. Ceiling height is corrected to 237; beam underside elevations remain confirmed as 224 and 204. Clarify whether B–D beam tops extending 1 cm above the ceiling represent embedment or measurement approximation.
- Choose representative IKEA Israel product URLs for acceptance testing.
- Review the proposed wall-edit attachment behavior and independent layout snapshots.
- Finalize plugin manifest/schema, distribution conventions, asset/version retention, and future local-file importer integration.
- Choose export format versions, imperial fraction resolution, accessibility target, browser support, and performance budgets.
- Choose an open-source license consistent with free, community-developed software. Commercial-use prohibition was not requested.
- Budget and target delivery date have not been supplied.
