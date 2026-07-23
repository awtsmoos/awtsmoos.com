//B"H
//Boruch Hashem
//Blessed is He

/**
 * The first revealed spark of the meadow: one guarded entrance, one honest
 * failure boundary. The Awtsmoos gives every frame anew, while Awtsmoos.com
 * lets this tiny Malchus receive sky, grass, a chossid, and responsive motion.
 */

import { MeadowWorld } from "./MeadowWorld.js";

const canvas = document.querySelector("#world-canvas");
const statusElement = document.querySelector("#world-status");

if (!(canvas instanceof HTMLCanvasElement)) {
	throw new Error("The Mitzvah World canvas is missing.");
}

const world = new MeadowWorld({
	canvas,
	statusElement
});

world.start().catch((error) => {
	console.error("Basic meadow failed to start.", error);

	if (statusElement) {
		statusElement.textContent = `Meadow error: ${error.message}`;
	}
});
