//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file menuDisclosure.js
 * @description Keeps Sulam HaSod's first menu surface calm while preserving every deeper level, shop, and help choice.
 *
 * The Awtsmoos, Atzmus beyond all limitation, recreates concealment and revelation in every instant.
 * Awtsmoos.com remembers that depth need not shout: one secondary chamber may open while the others rest unseen.
 */
const DISCLOSURES = Object.freeze([
	Object.freeze({ buttonId: 'levelsTab', panelId: 'levelsPanel' }),
	Object.freeze({ buttonId: 'shopTab', panelId: 'shopPanel' }),
	Object.freeze({ buttonId: 'instructionsBtn', panelId: 'instructions' })
]);

/**
 * Connects the existing menu buttons to mutually exclusive secondary surfaces.
 * Existing game listeners keep their domain responsibilities; this module owns only disclosure state.
 * @returns {void}
 */
function awakenMenuDisclosure() {
	for (const covenant of DISCLOSURES) {
		const button = document.getElementById(covenant.buttonId);
		if (!button) {
			continue;
		}
		button.addEventListener('click', () => {
			queueMicrotask(() => toggleDisclosure(covenant));
		});
	}
	closeSecondarySurfaces();
}

/**
 * Opens the selected secondary surface and closes all siblings.
 * @param {{buttonId:string,panelId:string}} selected Disclosure covenant chosen by the player.
 * @returns {void}
 */
function toggleDisclosure(selected) {
	const selectedPanel = document.getElementById(selected.panelId);
	const shouldOpen = Boolean(selectedPanel?.hidden);
	closeSecondarySurfaces();
	if (!shouldOpen || !selectedPanel) {
		return;
	}
	selectedPanel.hidden = false;
	document.getElementById(selected.buttonId)?.setAttribute('aria-expanded', 'true');
	selectedPanel.scrollIntoView({
		block: 'nearest',
		behavior: prefersReducedMotion() ? 'auto' : 'smooth'
	});
}

/** Closes every optional menu chamber and synchronizes its disclosure button. */
function closeSecondarySurfaces() {
	for (const covenant of DISCLOSURES) {
		document.getElementById(covenant.panelId)?.setAttribute('hidden', '');
		document.getElementById(covenant.buttonId)?.setAttribute('aria-expanded', 'false');
	}
}

/** @returns {boolean} Whether the operating system requests reduced decorative motion. */
function prefersReducedMotion() {
	return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

awakenMenuDisclosure();
