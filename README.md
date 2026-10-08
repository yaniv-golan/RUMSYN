# RUMSYN

Browser-only room modeling. Implementation is at M0 feasibility; this is not release 1.

Use Node 24.18.0 and pnpm 10.33.0. With nvm installed: `nvm use`, then `corepack pnpm install --frozen-lockfile`. Run `pnpm doctor`, `pnpm check`, `pnpm fixture:check`, `pnpm req:check`, `pnpm build`, `pnpm test:unit`, and `pnpm preview`.

`pnpm dev` opens a bounded feasibility harness. It is not the consumer editor. Dependencies are bundled locally. No account or application backend is required.

See [requirements](docs/requirements.md), [status](docs/implementation-status.md), and [contributing](CONTRIBUTING.md). All physical-device, catalog coverage, and user acceptance gaps remain tracked. MIT covers application code; third-party data/assets require their own licenses.
