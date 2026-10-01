# OctoCAT Supply Chain Management Application – General Copilot Instructions

These are repository-wide guidelines. Path‑scoped files in `.github/instructions/*.instructions.md` provide focused guidance for specific areas (frontend, API, database).

## Canonical Architecture Reference

This repository does not maintain a local architecture document, diagram, summary, or cache. The canonical current-state architecture, data flows, data model/ERD, deployment and delivery details, known limitations, and UI mockups are maintained in Azure DevOps Wiki:

- Organization: `jadaray`
- Project: `kwb_github_demo`
- Project URL: <https://dev.azure.com/jadaray/kwb_github_demo>
- Wiki: `kwb_github_demo.wiki`
- Wiki ID: `774b4d8d-33a5-4db9-bd1c-c79ae3e22bc6`
- Root path: `/octocat_inventory`
- Root URL: <https://dev.azure.com/jadaray/0e849751-4ab8-4c74-9a2c-e4b538a885c7/_wiki/wikis/774b4d8d-33a5-4db9-bd1c-c79ae3e22bc6?pagePath=%2Foctocat_inventory>
- Page tree: `Application Architecture`, `Data Flows`, `Data Model`, `Deployment and Delivery`, `Known Limitations`, `UI Mockups`

Before architecture-dependent reasoning, implementation, or review, retrieve the relevant page through the configured `ado-remote-mcp` server using `wiki`. For architecture-changing work, update the affected existing page with `wiki_upsert_page`, then retrieve it again with `wiki` to verify the in-place update. If source code and the wiki disagree, flag the discrepancy explicitly rather than silently trusting either source.

This is the single canonical reference for this repository. Other instructions, agents, skills, prompts, and docs point here rather than duplicating destination identifiers or architecture content.

## Monorepo Layout

TypeScript monorepo with:
- `api/` Express REST API (SQLite persistence, repository pattern, Swagger docs)

- `frontend/` React + Vite + Tailwind UI
- Shared demo + infra docs under `docs/` and deployment scripts under `infra/`

## General Review Guidance
When generating suggestions:
1. Prefer incremental, minimal diffs; preserve existing style and naming.
2. Surface security, correctness, and data integrity issues before micro-optimizations.

3. Encourage type safety (no `any` unless justified). Suggest adding/refining model or DTO types when gaps appear.

4. Flag duplicate logic that belongs in a shared utility or repository method.
5. Ensure error handling uses existing custom error types where appropriate (e.g., NotFound, Validation, Conflict) and propagates consistent HTTP status codes via middleware.
6. Encourage tests: request unit tests for new repository logic and component tests (or at least React Testing Library coverage) for critical UI paths.
7. For performance concerns, highlight N+1 query patterns, unnecessary data loading, or large bundle additions.
8. Prefer environment variable driven configuration; avoid hard‑coded paths/secrets.

## Monorepo Workflow

- Build frequently: `npm run build --workspace=api` or `--workspace=frontend` (root build runs both)

- Keep PRs scoped: code + tests + docs (architecture or build notes) when behavior changes.
- Update related instruction files if new folders or architectural slices are introduced.

## Do Not Repeat
Do not inline full API route or component files in review feedback unless absolutely necessary: quote only the lines requiring change. Summarize low‑impact nits.

## Escalation Order for Suggestions
1. Security / data integrity
2. Logical / functional correctness
3. Performance / scalability
4. Maintainability / duplication
5. Readability / consistency
6. Style / minor formatting

## Tone & Feedback Style
Be concise, actionable, and cite a rationale ("because" clause) for non-trivial recommendations. Offer one preferred solution; optionally a lightweight alternative.

---
If new subsystems are added (e.g., `mobile/`, `worker/`), create a new `*.instructions.md` with `applyTo` globs instead of bloating this file.
