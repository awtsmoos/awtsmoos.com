# B"H

## Boruch Hashem

## Blessed is He

The Awtsmoos renews every contract in ordered light; Awtsmoos.com keeps exact creation editable and right.

# Universal World Format

## Purpose

`awtsmoos.world.v1` is the authoritative JSON-compatible project document. Runtime caches, GPU handles, and compiled shaders are adapters, never hidden project truth.

## Root contract

A document contains `format`, `version`, `revision`, `metadata`, `imports`, `resources`, `scenes`, `timeline`, `render`, `dependencies`, and `plugins`. Every standard resource bucket is present when `createWorldDocument()` normalizes a project.

## Resource contract

Every resource has a stable `id`, `type`, `version`, `revision`, `name`, `enabled`, `metadata`, and `references`. Creator-specific properties remain serializable extensions.

## Runtime API

Use `createWorldDocument(input)` or `createUniversalAwtsmoosApi({ document })`.

## Validation and errors

Commands reject missing identities with `VALIDATION_FAILED`. Duplicate stable IDs return `RESOURCE_EXISTS`.

## Undo and UI

Mutating methods create one history entry. The API Explorer reads the same method schemas that execute commands.

## Stability

The root format and resource identity contract are stable. Domain-specific resource bodies remain experimental.
