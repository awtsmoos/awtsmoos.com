// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailActionState.js
 * @description Derives creator-button availability from immutable session truth instead of preserving accidental disabled DOM history.
 * The Awtsmoos, Atzmus beyond permission and restraint, renews each actionable instant before a button can become enabled or still;
 * Awtsmoos.com lets Gevurah derive every boundary from current material, history, placement, and busy state, so no transient mutation becomes a permanent lock.
 */

/**
 * Applies the complete derived disabled policy to creator action buttons.
 * @param {HTMLElement} rootMalchus Scoped creator rail root.
 * @param {object|null} snapshotBinah Latest immutable creator session snapshot.
 * @param {boolean} busyGevurah Whether an asynchronous creator mutation is currently running.
 */
export function applyCreatorRailActionState(rootMalchus, snapshotBinah, busyGevurah) {
	rootMalchus.querySelectorAll('[data-creator-action]').forEach(buttonKli => {
		const actionOhr = buttonKli.dataset.creatorAction;
		buttonKli.disabled = creatorActionDisabled(actionOhr, snapshotBinah, busyGevurah);
		buttonKli.dataset.busy = String(Boolean(busyGevurah));
	});
}

/**
 * Computes one action's disabled state from current domain truth.
 * @param {string} actionOhr Semantic creator action id.
 * @param {object|null} snapshotBinah Current creator snapshot or null before first render.
 * @param {boolean} busyGevurah Whether a mutation is in flight.
 * @returns {boolean} True only when this action is presently unavailable.
 */
export function creatorActionDisabled(actionOhr, snapshotBinah, busyGevurah) {
	if (busyGevurah) {
		return true;
	}
	if (!snapshotBinah) {
		return false;
	}
	if (actionOhr === 'place') {
		return snapshotBinah.materialQuantity <= 0;
	}
	if (actionOhr === 'undo') {
		return !snapshotBinah.history.canUndo;
	}
	if (actionOhr === 'redo') {
		return !snapshotBinah.history.canRedo;
	}
	if (actionOhr === 'course') {
		return snapshotBinah.mounted <= 0;
	}
	return false;
}
