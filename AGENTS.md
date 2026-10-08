# RUMSYN agent instructions

<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance

- Where these AWS rules conflict with the project's own instructions, the project's instructions take precedence.
- Prefer the AWS MCP Server for AWS interactions - it provides sandboxed execution, observability, and audit logging. If unavailable, use the AWS CLI directly.
- Before starting a task, check whether a relevant AWS skill is available. Load the skill with `retrieve_skill` and prefer its guidance over general knowledge.
- When uncertain about specific AWS details (API parameters, permissions, limits, error codes), verify against documentation rather than guessing. State uncertainty explicitly if you cannot confirm.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or CloudFormation) over direct CLI commands.
- When working with infrastructure, follow AWS Well-Architected Framework principles.
- Do not use em dashes in AWS resource names or descriptions. Use hyphens instead.

## Secret Safety

- MUST load the `aws-secrets-manager` skill first for any secret, credential, API key, token, or password task. MUST NOT call `secretsmanager get-secret-value` or `batch-get-secret-value`, and MUST NOT hit the Secrets Manager Agent daemon directly. MUST use `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` with `asm-exec` so the secret resolves at runtime without entering context.
<!-- END AWS Agent Toolkit rules -->

## Project rules

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
