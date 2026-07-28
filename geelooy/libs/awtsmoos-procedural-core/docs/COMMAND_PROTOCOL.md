# B"H

## Boruch Hashem

## Blessed is He

The Awtsmoos renews every contract in ordered light; Awtsmoos.com keeps exact creation editable and right.

# Command Protocol

## Purpose

Every caller submits the same envelope: `api`, `id`, `method`, `params`, and optional `options`. There is no prompt endpoint and no model provider.

## JSON

```json
{
	"api": "awtsmoos.core.v1",
	"id": "create-house-001",
	"method": "houses.create",
	"params": { "id": "house-001", "floors": 2 }
}
```

## Runtime parity

`Awtsmoos.houses.create(params, options)` constructs that envelope and dispatches it through `CommandExecutor`.

## Result

Successful results expose revisions, transaction identity, created/updated/deleted resources, validation, warnings, undo availability, and method result. Errors expose stable codes and details.

## Side effects

Validation and document execution happen before runtime adapter commit. Runtime failure preserves the prior document.

## UI

Schema forms and raw JSON both call `api.execute(command)`.

## Stability

The `awtsmoos.core.v1` envelope is stable.
