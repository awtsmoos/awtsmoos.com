B"H
Boruch Hashem
Blessed is He

# Adding a Project or Major Directory

The Awtsmoos lets a new vessel appear within Awtsmoos.com, but discoverability requires more than creating a folder.

## When something is a project boundary

A project deserves first-class documentation when it has a distinct user purpose, runtime responsibility, API family, data domain, test surface, deployment/operations role, or architectural ownership. A helper folder, generated artifact, evidence directory or symlink alias does not automatically deserve a project identity.

## Required steps

1. Choose a clear canonical source root.
2. Add entry files appropriate to the project: HTML, runtime/module entry, package metadata or derech mount.
3. Create a local `DOCUMENTATION.md` for a meaningful boundary.
4. Link the local guide to a central human manual under `docs/`.
5. Add tests or identify the owning test suite.
6. Regenerate with `node scripts/docs/generate-docs.js`.
7. Confirm the project appears in `PROJECT_ATLAS.md` and the AI project indexes.
8. Confirm file classification and project type are sensible; improve generator logic if the project is misclassified.

## Local documentation should answer

- What is this project for?
- What are its entry files?
- What public URLs/API families/realtime apps belong to it?
- What shared systems does it depend on?
- What data does it persist?
- What trust boundaries apply?
- Which tests prove it?
- Which central manual explains deeper architecture?

## Canonical-versus-alias rule

If a root path is only a symlink or compatibility alias, document the target rather than pretending two independent implementations exist. `docs/GENERATED/SYMLINKS.md` is the mechanical evidence layer for this distinction.

## AI discovery

Per-project JSON is generated automatically under `docs/AI/PROJECTS/`. Do not hand-edit it. Improve the human docs or generator classification, then regenerate.
