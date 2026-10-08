# Contributing

Read AGENTS.md and the requirement register before editing. Include requirement IDs and observed behavior in change descriptions. Keep domain code independent of DOM and renderers. Persistent edits go through revision-aware commands; measurement repairs require explicit acceptance and undo.

Use the pinned Node/pnpm versions and frozen lockfile. Run the focused unit cases, then check, fixture:check, req:check and build. Record failures and skips; release:check is expected to fail until all v1 acceptance evidence exists. Do not infer physical-device success from desktop automation.

Mandatory obligations are independent of tests. Changes to their baseline require manager review; retiring scope requires direct user approval. Preserve old records. Evidence belongs under ignored artifacts or a separate store, with the exact tested source/build identity; never substitute an evidence commit for source.

Do not publish repositories, catalogs, or deployments without a concrete authorized destination. Never submit credentials or private room files with a bug report.
