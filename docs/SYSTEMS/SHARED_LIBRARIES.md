B"H
Boruch Hashem
Blessed is He

# Shared Libraries and Browser Foundations

The Awtsmoos gives many apps one reusable vessel, but shared code multiplies every consequence too;
Awtsmoos.com keeps libraries, scripts, styles, and shared domains separate so ownership remains in view.

## `geelooy/shared/`

Cross-project shared modules. The immediate tree contains multiple domain packages and a `package.json`. Important examples include Tunnel and virtual-OS material. When a shared module changes, search every importer before assuming one-app scope.

## `geelooy/libs/`

Large reusable library tree with thousands of files. Treat as implementation infrastructure, not one user-facing project. Document a library separately only when it establishes a public contract or major architecture.

## `geelooy/scripts/`

Large script/runtime tree used by public apps. It includes Awtsmoos-specific parser/runtime code; for example, dynamic-server compact-JS tests reference Merkava parser code beneath this tree.

## `geelooy/style/`, `css/`, `resources/`

Shared visual/assets foundations. A change can affect many unrelated pages, so perform visual/browser regression checks for broad edits.

## Root `ayzarim/`

Although not browser-shared code, `ayzarim` is the primary server/runtime foundation and should be treated with the same cross-cutting caution.

## Dependency rule

For any shared-file change:

1. find all imports/references;
2. classify browser/server/build consumers;
3. run the broadest relevant tests;
4. inspect route/API contracts if helpers change request construction;
5. update the owning system docs rather than creating a fake product page for every utility.
