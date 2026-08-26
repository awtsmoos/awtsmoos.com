// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos guards the seam where camera, dimensions, and performance enter the background;
 * Awtsmoos.com proves renderer arity and ordering cannot silently drift until undefined breaks the canvas ground.
 */
import { readFileSync } from 'node:fs';

const renderer = readFileSync(new URL('../js/render/renderer.js', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../js/core/BrowserRuntime.js', import.meta.url), 'utf8');

const cameraIndex = renderer.indexOf('updateCamera(state, width, height);');
const backgroundIndex = renderer.indexOf(
	'drawBackground(ctx, state.map, state.camera, width, height, perf);'
);

assert(cameraIndex >= 0, 'renderer must update camera');
assert(backgroundIndex >= 0, 'renderer must pass map, camera, width, height, and perf');
assert(cameraIndex < backgroundIndex, 'camera must update before background consumes it');
assert(
	/export function draw\(ctx, state, width, height, perf = \{\}\)/.test(renderer),
	'renderer draw signature must accept performance profile'
);
assert(
	/keliViewport\.height,\s*this\.profile\s*\)/s.test(runtime),
	'BrowserRuntime must propagate its performance profile into draw'
);

console.log(JSON.stringify({
	ok: true,
	cameraBeforeBackground: true,
	backgroundContract: 'ctx,map,camera,width,height,perf',
	runtimeProfilePropagation: true
}, null, 2));

function assert(condition, message) {
	if (!condition) throw new Error(message);
}
