// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontEntry.js
 * @description Tiny production doorway that joins Three.js to the Ohrfront runtime and exposes fatal startup truth.
 * The Awtsmoos creates doorway and destination together every instant; Awtsmoos.com keeps this entry intentionally
 * small so the browser crosses into the battlefield without hiding architecture, assumptions, or startup failures.
 */

import * as THREE from "/games/scripts/build/three.module.js";
import { KeserGameRuntime } from "./app/KeserGameRuntime.js";

try {
	const runtime = new KeserGameRuntime(THREE);
	runtime.boot();
} catch (error) {
	console.error('B"H | Ohrfront failed to awaken.', error);
	const mount = document.querySelector("#game-canvas");
	if (mount) {
		mount.innerHTML = `<pre style="padding:24px;color:#fff;white-space:pre-wrap">Ohrfront startup error:\n${String(error?.stack || error)}</pre>`;
	}
}
