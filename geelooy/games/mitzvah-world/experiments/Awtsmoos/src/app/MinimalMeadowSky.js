// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowSky.js
 * @description Owns one complete procedural atmosphere and moves it only when the camera truly moves.
 * The Awtsmoos renews the ceiling wherever the traveler stands; Awtsmoos.com preserves the full
 * sphere, sun, and clouds while unchanged frames perform no redundant transform publication.
 */

import { createSky3D } from '../world/Sky3D.js?v=20260723-meadow-11';
import { createProceduralSkyImage } from './ProceduralSkyTexture.js';

export function installMinimalMeadowSky(scene, camera, quality = 'high') {
	// B"H: idempotent — the rich renderer mounts the sky early on worlds
	// whose world systems never run (blank meadow), and the world systems
	// later install the same sky; a second dome would double the draw and
	// the diagnostics, so return the existing handle instead.
	const existing = findInstalledSky(scene);
	if (existing) {
		applyProceduralSkyTexture(existing);
		const state = { x: NaN, y: NaN, z: NaN };
		const update = () => centerSky(existing, camera, state);
		update();
		return {
			diagnostics: () => ({ ...existing.userData.AwtsmoosSky }),
			group: existing,
			update
		};
	}
	const sky = createSky3D(quality);
	applyProceduralSkyTexture(sky);
	scene.add(sky);
	const state = { x: NaN, y: NaN, z: NaN };
	const update = () => centerSky(sky, camera, state);
	update();
	return {
		diagnostics: () => ({ ...sky.userData.AwtsmoosSky }),
		group: sky,
		update
	};
}

/** Finds the Core sky already mounted in this scene, if any. */
function findInstalledSky(scene) {
	let found = null;
	scene?.traverse?.(object => {
		if (!found && object?.userData?.AwtsmoosSky) found = object;
	});
	return found;
}

/**
 * Gives the Core sky mesh a generated day-sky texture. The Core mesh ships
 * white: its gradient lives in a procedural shader the tiny renderer never
 * runs, so without a map the rich sky renders as a blank white dome. The
 * raw-pixel image travels the renderer's own map path; fog stays off the
 * sky so distance haze cannot wash the gradient out again.
 */
function applyProceduralSkyTexture(sky) {
	try {
		let material = null;
		sky.traverse?.(object => {
			if (!material && object?.material?.texturePolicy?.proceduralSky) {
				material = object.material;
			}
		});
		if (!material || material.mapImage) return false;
		material.mapImage = createProceduralSkyImage();
		material.mapRepeat = [1, 1];
		material.fog = false;
		material.needsUpdate = true;
		return true;
	} catch {
		return false;
	}
}

function centerSky(sky, camera, state) {
	const position = camera?.position || {};
	const x = Number(position.x) || 0;
	const y = Number(position.y) || 0;
	const z = Number(position.z) || 0;
	if (state.x === x && state.y === y && state.z === z) return false;
	state.x = x;
	state.y = y;
	state.z = z;
	sky.position.set(x, y, z);
	return true;
}
