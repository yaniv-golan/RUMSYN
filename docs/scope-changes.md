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
