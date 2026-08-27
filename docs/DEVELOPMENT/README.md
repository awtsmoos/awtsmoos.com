B"H
Boruch Hashem
Blessed is He

# Development and Contribution Guide

The Awtsmoos renews every source change while Awtsmoos.com asks the maintainer to reveal the owning project, contract, test, documentation, and evidence together.

## Begin from ownership

Before editing, identify the project boundary in `docs/GENERATED/PROJECT_ATLAS.md`, then read the nearest human guide or local `DOCUMENTATION.md`. Use `PROJECT_DEPENDENCIES.md` to see cross-project imports and `TEST_OWNERSHIP.md` to find verification neighborhoods.

## Common change paths

- New project or major directory → [ADDING_A_PROJECT.md](ADDING_A_PROJECT.md).
- New/changed HTTP API → [ADDING_AN_API.md](ADDING_AN_API.md).
- New/changed realtime protocol → [ADDING_REALTIME.md](ADDING_REALTIME.md).
- Documentation system changes → [DOCUMENTATION_WORKFLOW.md](DOCUMENTATION_WORKFLOW.md).
- Persistent data shape changes → [../DATA/PATH_CONTRACTS.md](../DATA/PATH_CONTRACTS.md).
- Authentication/authorization/security changes → [../SECURITY/README.md](../SECURITY/README.md).

## Repository realities

The repository contains active product code, tests, generated artifacts, assets, evidence/planning trees, tools, operations material, symlink aliases and nested shells. Do not infer edit ownership from file count or basename alone. The generated project atlas classifies observed boundaries, but source and human docs remain the authority for intended behavior.

## Change workflow

1. Read source and owning documentation.
2. Trace imports/callers and data boundaries.
3. Implement the smallest coherent source change.
4. Run focused tests and broader tests when shared code changes.
5. Regenerate docs when routes/projects/entries/config/dependencies change.
6. Update manual docs when purpose, architecture, trust, workflow or contract changes.
7. Validate links, source paths, generator syntax and documentation coverage.

## Generated evidence is not a substitute for design

The generator can tell you that an import, route, symbol, environment name or HTML entry exists. It cannot decide whether the architecture is good, whether an API should be public, whether a data migration is safe, or whether a trust boundary is correct. Those decisions belong in human documentation and tests.
