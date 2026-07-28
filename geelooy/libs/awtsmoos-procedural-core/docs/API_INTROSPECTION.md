# B"H

## Boruch Hashem

## Blessed is He

The Awtsmoos renews every contract in ordered light; Awtsmoos.com keeps exact creation editable and right.

# API Introspection

## Methods

`api.describe`, `api.namespaces`, `api.methods`, `api.schema`, `api.capabilities`, and `api.examples` are generated from `MethodRegistry`.

## Definition fields

Each definition exposes identity, namespace, runtime name, label, description, stability, parameter/result schemas, permissions, transaction mode, undo support, side effects, cost, UI metadata, and examples.

## Extension

Register a method definition when creating the API, or register it on `MethodRegistry` before runtime aliases are generated. Duplicate IDs fail deterministically.

## UI parity

`createApiExplorerModel(registry)` uses the same public definitions. No second handwritten control contract exists.

## Stability

Registry and introspection envelopes are stable; individual experimental method stability is reported explicitly.
