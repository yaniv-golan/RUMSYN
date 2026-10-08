# ADR0004 - Data-only plugin seed install boundary

2026-10-08. In progress; R022/R024/R025/R026/R027/R028/R033. Full producer/contract qualification remains incomplete.

Public GitHub repository URL resolves through public metadata to a commit-pinned `rum-plugin.json`. Contract1 supports IL catalog schema1 and generic-table geometry only in this bounded increment. Origins are declared and restricted to the repository owner's HTTPS GitHub Pages origin. Catalog URL contains a version path, pinned SHA256; redirects, oversized streams, unsupported schema/version/country, duplicate or mismatched product identity and unsafe display links reject before install. Manifest limit32KB, GitHub metadata256KB, catalog2MB. No plugin code executes.

Review presents repository, publisher, ID, version and country before an explicit Install action. Publisher trust is separate from integrity. Installed manifest/commit/catalog snapshot are personal browser state; Dexie database1→2 adds the plugins table without changing project format1 or the recovery/library tables. Cache bytes are hash-verified before product import. Library/placed snapshots survive uninstall; imports use the development bundled seed only when no plugin is installed, with its limitation visible. Full community-provider dispatch, update preview/keep/replace, external assets and broader geometry remain outstanding.

`producer-seed/` is the separate producer handoff payload, not an app backend. It contains a one-product immutable Pages fixture, metadata provenance, validation and static Pages payload CI. Manager owns publication and Pages configuration. Real cross-origin production browser proof must follow publication. Fixture interception and unit mocks cannot substitute for that evidence.

The accepted raw manifest text is retained with its byte hash. Cache reads verify those bytes and agreement with the parsed manifest before trusting the catalog pin. Mutating both the cached catalog and parsed hash pointer cannot borrow the original published manifest identity. This detects cache inconsistency, not an attacker able to replace every local trust anchor.
