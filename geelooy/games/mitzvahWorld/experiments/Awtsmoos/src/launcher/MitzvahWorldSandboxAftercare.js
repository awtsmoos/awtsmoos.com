//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldSandboxAftercare.js
 * @description Opens unlimited native world creation only after the fast Sandbox runtime is already playable.
 * The Awtsmoos reveals movement before tools and then joins both without a second renderer;
 * Awtsmoos.com keeps Sandbox local-first, optional to ordinary worlds, and rooted in the canonical creator document.
 */

import { installMitzvahWorldCreator } from '../creator/MitzvahWorldCreatorInstaller.js';
import { MitzvahWorldCreatorSandboxInventory } from '../creator/MitzvahWorldCreatorSandboxInventory.js';
import { createMitzvahWorldSandboxModeController } from './MitzvahWorldSandboxModeController.js';

/**
 * Installs one creator session and persistent Create/Play switch for a resolved Sandbox world.
 * @param {object} diagnostics Playable runtime diagnostics.
 * @param {object} [environmentMalchus=globalThis] Browser-like environment.
 * @returns {object} Stable Sandbox mode controller.
 */
export function installMitzvahWorldSandboxAftercare(
	diagnostics,
	environmentMalchus = globalThis
) {
	if (environmentMalchus.AwtsmoosSandbox?.toggle) {
		return environmentMalchus.AwtsmoosSandbox;
	}
	const runtimeMalchus = diagnostics?.runtime
		|| environmentMalchus.AwtsmoosMitzvahWorld?.runtime;
	const documentMalchus = environmentMalchus.document;
	const creatorTiferes = installMitzvahWorldCreator({
		document: documentMalchus,
		environment: environmentMalchus,
		runtime: runtimeMalchus,
		sessionOptions: {
			inventory: new MitzvahWorldCreatorSandboxInventory()
		}
	});
	const controllerMalchus = createMitzvahWorldSandboxModeController(
		creatorTiferes,
		documentMalchus,
		environmentMalchus
	);
	environmentMalchus.AwtsmoosSandbox = controllerMalchus;
	diagnostics.sandboxCreator = creatorTiferes;
	diagnostics.sandboxMode = controllerMalchus;
	return controllerMalchus;
}
