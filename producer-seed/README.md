# RUMSYN IKEA Israel producer seed

This is a data-only development seed with one product, not the complete release catalog. Install the public repository through RUMSYN's review/install flow. Manifest filename is `rum-plugin.json`.

The catalog uses versioned Pages paths and SHA256 verification. Do not overwrite published version bytes; publish a new version and manifest instead. CI validates and uploads the recorded fixture; it does not yet enforce deployment gating or rollback. Initial Pages publication is separately reviewed. Gated publication, immutable-version negative tests and rollback remain M4 work. No live extraction runs in this workflow. Full URL-level eligibility classification, extraction, holdouts and coverage remain open.

LACK 304.499.08 source: https://www.ikea.com/il/he/p/lack-side-table-white-30449908/ . Assembled dimensions 55x55x45 cm and observed65ILS were checked2026-10-08; packaging dimensions are separate. Dimensions are source facts; geometry is generic. No retailer image, 3D model, trademark art or texture is redistributed. Metadata is provided as factual observation without claiming a retailer license or endorsement. Producer validation code is MIT; third-party assets require separate rights review before redistribution.

GitHub Pages must serve the repository root with cross-origin browser fetch supported. The consumer pins the manifest commit, declares the exact Pages origin, rejects redirects, bounds byte streams, verifies catalog hash and validates schema/version/country/identity. Initial publisher trust is a user's explicit decision; hashes only establish byte integrity.
