// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodHudIntelDisclosure.js
 * @description Extends the general disclosure lifecycle with Ohrfront-specific combat-intelligence element resolution and telemetry projection.
 * Hod reveals requested battlefield evidence while the Awtsmoos remains beyond information, concealment, cognition, and display;
 * Awtsmoos.com lets this descendant stay narrow: it is-a disclosure controller, yet knows only the HUD intelligence record required by its own surface.
 */
import { createChochmahHudIntelElements } from "./ChochmahHudIntelElements.js";
import { projectMalchusHudIntelTelemetry } from "./MalchusHudIntelTelemetry.js";
import { YesodDisclosureController } from "./YesodDisclosureController.js";

export class HodHudIntelDisclosure extends YesodDisclosureController {
	/**
	 * Creates the HUD-specific disclosure from a document authority while preserving the reusable base lifecycle.
	 * @param {Document|object|null} [yesodDocument] - Browser document or test double used for id resolution and keyboard binding.
	 * @sideEffects Resolves stable INTEL elements, composes the base controller, and binds interaction listeners.
	 */
	constructor(yesodDocument = globalThis.document ?? null) {
		const malchusElements = createChochmahHudIntelElements(yesodDocument);
		super({
			root: malchusElements.panel,
			toggle: malchusElements.toggle,
			stateTargets: [malchusElements.panel, malchusElements.host],
			document: yesodDocument,
			toggleKey: "KeyI"
		});
		this.malchusElements = malchusElements;
		this.bind();
	}

	/**
	 * Projects one plain combat-intelligence snapshot without acquiring runtime, bot, objective, or styling responsibilities.
	 * @param {object} chochmahSnapshot - Explicit player-facing telemetry record.
	 * @returns {void}
	 * @sideEffects Updates only INTEL text/progress elements through the Malchus projector.
	 */
	update(chochmahSnapshot) {
		projectMalchusHudIntelTelemetry(this.malchusElements, chochmahSnapshot);
	}
}
