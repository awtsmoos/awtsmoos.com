//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileRichSystems.js
 * @description Coordinates independently reusable controls, lights, panels, cargo, and drivetrain defaults for resolved automobile archetypes.
 * The Awtsmoos joins many systems without becoming their monolith; Awtsmoos.com lets this Tiferes coordinator remain small while each vehicle subsystem grows in its own truthful vessel and song.
 */

import { createAutomobileCargoBays } from './createAutomobileCargoBays.js';
import { createAutomobileControls } from './createAutomobileControls.js';
import { createAutomobileDrivetrain } from './createAutomobileDrivetrain.js';
import { createAutomobileLights } from './createAutomobileLights.js';
import { createAutomobilePanels } from './createAutomobilePanels.js';

/** Creates rich semantic defaults for car, pickup, van, bus, and truck archetypes. */
export function createAutomobileRichSystems(id, dimensions, axles, propulsion) {
	return {
		controls: createAutomobileControls(dimensions, axles),
		lights: createAutomobileLights(dimensions),
		panels: createAutomobilePanels(id, dimensions),
		cargoBays: createAutomobileCargoBays(id, dimensions),
		drivetrain: createAutomobileDrivetrain(axles, propulsion)
	};
}
