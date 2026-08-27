B"H
Boruch Hashem
Blessed is He

# Awtsmoos Code

The Awtsmoos lets source become an interactive developer world while Awtsmoos.com connects browser editing, compiler/runtime services, AI assistance, shared platform code and project previews.

## Canonical source

`geelooy/apps/code/`

This is one of the largest application projects in the repository. Its local `DOCUMENTATION.md` is the in-tree entry point; central developer docs explain how it connects to the rest of Awtsmoos.com.

## Surrounding systems

- Compiler API and compiler application behavior.
- Native/runtime APIs and platform execution.
- Shared browser/platform modules.
- AI/model assistance and provider configuration where enabled.
- Tunnel/native-preview workflows where remote execution is involved.

## Generated evidence

Use `PROJECT_SYMBOL_SUMMARY.md` for lexical symbol scale, `PROJECT_DEPENDENCIES.md` for cross-project source references, `EXTERNAL_DEPENDENCIES.md` for package imports, `PUBLIC_ENTRY_POINTS.md` for the browser entry and `TEST_OWNERSHIP.md` for test neighborhoods.

## Human manuals

- `docs/APPS/DEVELOPER_TOOLS.md`
- `docs/SYSTEMS/GEELOOY_OS.md`
- `docs/SYSTEMS/AI.md`
- `docs/API/OTHER_FAMILIES.md`
- `docs/DEVELOPMENT/README.md`

## Change strategy

A UI-only editor change may remain local, but compiler, native execution, AI orchestration, filesystem/project loading or shared platform changes can cross multiple projects. Trace generated dependency edges, inspect the owning backend contract and run Code-specific plus shared-platform tests when those boundaries move.
