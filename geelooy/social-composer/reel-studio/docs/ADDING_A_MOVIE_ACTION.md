B"H
Boruch Hashem
Blessed is He

# Adding a Movie Action

Every action must have API and UI parity by construction.

1. Add one definition to `NleMovieActionCatalog.js`.
2. Give it a unique `id` and `apiName`.
3. Define its category, label, description, and bounded fields.
4. Add one executor handler to `NleMovieActionExecutor.js`.
5. Put substantial mutation logic in a small dedicated module.
6. Use `state.mutate` or `state.replace` for undoability.
7. Return a serializable result.
8. Add pure tests and a browser action-card proof.
9. Document package or graph changes.

Do not manually add a second button. `NleMovieActionMarkup.js` generates the card.
Do not manually add a public convenience method. `NleMovieActionApi.js` generates it.

## Field Types

- `text`
- `textarea`
- `number`
- `select`

Field names become keys in the values object passed to the executor.

## Example

```js
const action = {
	id: 'lighting.addRig',
	apiName: 'addLightingRig',
	category: 'Lighting',
	label: 'Add lighting rig',
	description: 'Add one editable motivated light setup.',
	fields: []
};
```

The completed feature must pass `validateMovieActionCatalog()` and browser parity.
