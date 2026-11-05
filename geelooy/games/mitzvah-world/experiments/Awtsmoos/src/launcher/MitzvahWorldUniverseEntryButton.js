// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseEntryButton.js
 * @description Mounts the prominent "Create Universe" entry into the game HUD.
 * Yaakov 2026-10-11: every player must find universe creation, not stumble on it.
 * The button opens the creative dock's live builder (creator mode) directly;
 * when the dock is not installed yet it installs on demand and degrades silently.
 */

const BUTTON_ID = 'Awtsmoos-universe-entry';

export function installUniverseEntryButton(options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = options.document || environment.document;
	if (!documentValue?.createElement) return null;
	if (documentValue.getElementById(BUTTON_ID)) {
		return documentValue.getElementById(BUTTON_ID);
	}
	const host = documentValue.querySelector('#actions') || documentValue.body;
	if (!host) return null;
	const button = documentValue.createElement('button');
	button.id = BUTTON_ID;
	button.type = 'button';
	button.setAttribute('data-universe-entry', 'true');
	button.setAttribute('aria-label', 'Create your own universe');
	button.textContent = '🌍 Create Universe';
	button.addEventListener('click', () => openUniverseBuilder(environment, options));
	host.appendChild(button);
	return button;
}

async function openUniverseBuilder(environment, options) {
	try {
		let dock = environment.AwtsmoosCreativeDock;
		if (!dock && typeof options.installDock === 'function') {
			dock = await options.installDock();
		}
		if (dock?.openBuilder) {
			dock.openBuilder();
			return true;
		}
		if (dock?.open) {
			dock.open();
			return true;
		}
	} catch (error) {
		console.warn('[MitzvahWorld] universe entry unavailable:', error?.message || error);
	}
	return false;
}

export default installUniverseEntryButton;
