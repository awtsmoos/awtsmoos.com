B"H
Boruch Hashem
Blessed is He

# How to Choose a Project Boundary

Choose a boundary by the behavior you need to understand, not by which directory happens to be largest.

## First question: what kind of surface is this?

- End-user browser experience → look for `app` / `public` boundaries and public entry evidence.
- Dynamic HTTP behavior → start with an `api` project, then switch to route tutorials for URL semantics.
- Game/world → use `game` projects plus realtime evidence where applicable.
- Server/database/runtime → use `runtime`, `runtime-root`, `infrastructure`, `data`, or `operations` projects.
- Shared implementation → use `library` or `tooling` boundaries and inspect incoming consumers.
- Compatibility/navigation root → inspect `alias` or generic `project` evidence carefully.
- Planning/discovery material → `evidence` is not automatically a product.

## Use Project Explorer

`/docs/?view=projects` exposes the generated boundary model directly. Filter by exact type, whether a public entry exists, whether test files exist, documentation coverage, or a path/dependency/entry search term.

## What each project packet can answer

- **Where is it?** exact project path.
- **How does source enter?** source entry files and symbol samples.
- **How can a user enter?** discovered public HTML entries when present.
- **What does it reference?** lexical outgoing project edges and external-package evidence.
- **What references it?** lexical incoming project edges.
- **How might I verify it?** nearby test-file evidence and human docs.

## What it cannot prove

- runtime call frequency or reachability;
- application health;
- complete dynamic imports/registrations;
- behavioral test coverage quality;
- authentication/authorization policy;
- production deployment status.

For those questions, continue into current source, dedicated API/realtime/data/security docs, tests, and runtime checks.
