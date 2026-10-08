# Scope changes

## 2026-10-08: first included catalog

- Previous requirement: IKEA support across all country catalogs in the initial release.
- User direction: “first version should include a plugin for IKEA Israel.”
- New release boundary: IKEA Israel in v1; preserve country-aware plugin/data design for later countries.
- All other agreed v1 features remain in scope unless separately deferred.

## 2026-10-08: WebMCP release boundary

- Previous requirement: native WebMCP consumer workflows in v1.
- User direction: “WebMCP can be deferred to the 2nd release”.
- New release boundary: native WebMCP tooling, browser/agent integration, and AI conversation acceptance move to v2.
- V1 keeps a shared editing command layer for validation, preview, mutation, and undo because both UI views need it. Native WebMCP access or tests are not a v1 prerequisite.

## 2026-10-08: camera-facing wall visibility

- User marked the two near-side walls in the3D preview and requested semi-transparency for walls facing the viewer.
- Use automatic camera-relative semi-transparency for near-side walls while retaining opaque far walls; update as the user orbits.
- This is a viewing behavior, not a change to room geometry, assigned materials, or exported dimensions. It replaces the earlier implementation suggestion to hide near walls entirely.

## 2026-10-08: IKEA-inspired consumer UI

- User requested a vision subagent exploration of IKEA home-design and adoption of its best UI ideas, then asked to confirm this remains in the plan.
- Release1 includes the adapted persistent canvas/focused panels, illustrated room presets, stable view controls, contextual properties, and searchable product cards with options/provenance. See delivery-plan3.5 and reviews/ikea-visual-ux.md for milestone mapping and observation limits.
- Existing partial implementation does not remove the remaining illustrated preset, richer catalog browsing, measurement guidance, project/layout, accessibility or device requirements. No IKEA branding/assets or account/scan workflow is required by this adaptation.
