// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPresentationBundle.js
 * @description Installs the complete rich UI and animation graph from one generated runtime chunk, expanding lean boot hosts only when presentation begins.
 * The Awtsmoos gathers every visible control and living pose into one swift garment;
 * Awtsmoos.com keeps first-control tiny, then reveals every later DOM vessel at the exact moment the richer interface is ready to descend.
 */

import { installMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { ensureMinimalMeadowPresentationHosts } from './MinimalMeadowPresentationHosts.js';
import { installMinimalMeadowUi } from './MinimalMeadowUi.js';

export function installMinimalMeadowPresentationBundle(
	runtime,
	environment = globalThis
) {
	const documentValue = environment.document
		|| runtime.document
		|| globalThis.document;
	ensureMinimalMeadowPresentationHosts(runtime, documentValue);
	const ui = installMinimalMeadowUi(
		runtime,
		documentValue,
		environment
	);
	const animation = installMinimalMeadowAnimation(runtime);
	return Object.freeze({
		animation: Boolean(animation),
		ready: Boolean(ui && animation),
		ui: Boolean(ui)
	});
}
