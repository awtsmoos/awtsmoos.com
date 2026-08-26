B"H
Boruch Hashem
Blessed is He

# Awtsmoos Animator Agent API

> The Awtsmoos renews every frame before an agent can name its motion or light; Awtsmoos.com exposes animation as discoverable data so automation can inspect first and mutate only when the vessel is right.

## Contract

The browser API is **Awtsmoos Animator Agent API v1.1.0** using protocol `awtsmoos-animator-json-v1`. It is installed only after the shared NLE store exists, and the Creator Dock uses the same facade.

```js
window.addEventListener('awtsmoos-animator-ready', ({ detail }) => {
	console.log(detail.version);
});

const animator = window.AwtsmoosAnimator;
```

## Discover Before Acting

```js
const manifest = animator.capabilities();
console.table(manifest.commands);
```

Every command publishes mutation behavior, idempotency, payload shape, description, and an example. Feature-detect from this manifest instead of guessing internal editor behavior.

## Command Envelope

```js
const result = await animator.execute({
	requestId: 'opening-preview',
	command: 'project.previewPrompt',
	payload: { prompt: 'Two friends discover a glowing door.' }
});
```

`requestId` is optional. The API generates one when absent and echoes the same ID in success and failure envelopes.

```js
{ ok: true, requestId, command, data }
{ ok: false, requestId, command, error: { code, message } }
```

## Read Commands

`project.snapshot` returns a compact project summary: title, duration, entity count, clip count, selected entity, and preview summary.

`performance.capabilities` returns expression names, motion names, gaze targets, face channels, micro-motion channels, timing channels, and safe intensity bounds.

`performance.compile` converts semantic acting direction into camera, face, gaze, body-motion, and timing data while preserving the legacy fields `emotion`, `speechEnergy`, `gesture`, and `camera`.

```js
await animator.execute({
	command: 'performance.compile',
	payload: {
		prompt: 'Subtle concern, partner gaze, then nod with a soft settle.'
	}
});
```

`animation.planPasses` expands timed beats into inspectable professional production passes while preserving legacy pass IDs.

## Preview Before Mutation

Generated cartoons use a three-stage safety contract:

1. `project.previewPrompt` creates and validates transient preview state.
2. Inspect the returned summary/document and visible editor.
3. Call `project.applyPreview` only when accepted, or `project.discardPreview` to leave the active project unchanged.

```js
const preview = await animator.execute({
	command: 'project.previewPrompt',
	payload: {
		prompt: 'A child notices a tiny robot, reacts with warm surprise, then walks closer with natural breathing and blinking.'
	}
});

if (preview.ok) {
	await animator.execute({
		command: 'project.applyPreview',
		payload: {}
	});
}
```

## Acting Data

Expressions resolve into normalized brow, eye, mouth, and head-tilt channels. Motions expose tempo, amplitude, loop intent, breath, blink, sway, secondary lag, anticipation, and settle. Query `performance.capabilities` before creating reusable agent recipes.

## Integration Rules

- Treat `project.applyPreview` as a real project mutation.
- Treat preview generation as transient editor state, not an installed document replacement.
- Never mutate private `window.__AWTSMOOS_PARK_APP__` internals when a public command exists.
- Use request IDs for retries, telemetry, and correlation.
- Prefer semantic acting language to raw channel values unless a future public command explicitly exposes channel mutation.
- Inspect `ok` before reading `data`.
- Preserve unknown response fields so minor API versions can add metadata safely.

## Minimal Agent Recipe

```js
const animator = window.AwtsmoosAnimator;
const discovery = await animator.execute({
	command: 'performance.capabilities',
	payload: {}
});
const preview = await animator.execute({
	command: 'project.previewPrompt',
	payload: { prompt: 'Create a short expressive two-character cartoon.' }
});

if (discovery.ok && preview.ok) {
	await animator.execute({
		command: 'project.applyPreview',
		payload: {}
	});
}
```

The public surface is intentionally small. New power should arrive as discoverable data and commands rather than unstable editor internals.
