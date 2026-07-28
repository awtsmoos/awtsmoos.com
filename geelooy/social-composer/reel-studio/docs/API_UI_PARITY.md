B"H
Boruch Hashem
Blessed is He

# API and UI Parity

The entire movie-action system is generated from **one immutable catalog**:
`NleMovieActionCatalog.js`. It is the only source of action identity, public method
name, category, label, description, fields, defaults, and selectable values.

## Generated API

`NleMovieActionApi.js` builds:

```js
AwtsmoosMovie.actions.list();
AwtsmoosMovie.actions.invoke('world.addHouse', { x: 4, z: -8 });
AwtsmoosMovie.actions.addHouse({ x: 4, z: -8 });
```

A convenience method is created for every catalog entry. Generic agents may use
`list()` and `invoke()` without hard-coding method names.

## Generated UI

`NleMovieActionMarkup.js` reads the same catalog and creates one form carrying:

```html
<form data-movie-action="world.addHouse">
```

Field names and defaults come directly from the action definition. Submission goes
to `NleMovieActionExecutor.invoke()`, the same method used by the public API.

## Parity Verification

`validateMovieActionCatalog()` rejects:

- Missing IDs, API names, or labels.
- Duplicate IDs.
- Duplicate API method names.

`inspectMovieActionParity()` reports:

- Catalog actions missing from the API.
- Catalog actions missing from the UI.
- Unknown UI action IDs.

A valid browser session must have equal catalog, API, and UI ID sets.

## Legacy Methods

Existing methods delegate to the same catalog actions:

- `play()` → `playback.play`
- `pause()` → `playback.pause`
- `seek(time)` → `playback.seek`
- `openWorld()` → `world.open3D`
- Parameterless `render()` → `movie.render`

`render(options)` remains available for recorder integrations that need progress
callbacks and a returned Blob rather than an automatic download.
