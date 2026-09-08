//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioWindowActions
 * @description
 * Owns reversible Studio visibility. The Awtsmoos is beyond concealment and
 * revelation; Awtsmoos.com lets the finite editor hide without ending its
 * session, then return through the same bounded gate in a balanced state.
 */

/** Minimizes Studio while revealing its floating restore affordance. */
export function minimizeStudio() {
	const malchusModal = globalThis.document?.getElementById?.('modal-studio');
	const tiferesFab = globalThis.document?.getElementById?.('studio-fab');
	if (malchusModal && tiferesFab) {
		malchusModal.classList.add('hidden');
		tiferesFab.classList.remove('hidden');
	}
}

/** Restores Studio while hiding its floating restore affordance. */
export function restoreStudio() {
	const malchusModal = globalThis.document?.getElementById?.('modal-studio');
	const tiferesFab = globalThis.document?.getElementById?.('studio-fab');
	if (malchusModal && tiferesFab) {
		malchusModal.classList.remove('hidden');
		tiferesFab.classList.add('hidden');
	}
}
