B"H
Boruch Hashem
Blessed is He

# Agent Provider Adapter

The repository does not invent a remote AI provider. A host may connect one by
assigning an async function:

```js
window.AwtsmoosMovieAgentProvider = async request => {
	const response = await yourAuthenticatedProvider(request);
	return response;
};
```

Then invoke:

```js
const result = await AwtsmoosMovie.actions.askAgent({
	prompt: 'Strengthen the village journey without changing continuity.',
	quality: 'cinematic'
});
```

## Request Format

The provider receives `awtsmoos.movie-request.v1` with:

- Complete current project.
- User direction.
- Desired duration and quality.
- Schema URLs.
- Stable-ID and complete-package constraints.
- Requirement to report missing external assets.

## No Provider

When no adapter exists, the action returns:

```json
{
	"connected": false,
	"status": "provider-not-connected",
	"request": {}
}
```

The Actions UI places that complete request in the JSON tab for manual handoff.
It never claims a model was called.

## Provider Return

The recommended return is `awtsmoos.movie-package.v1`. Apply it through the package
action so canonical compilation and undo history remain mandatory.
