// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsPortraitClearance.js
 * @description Reserves the first mobile HUD rows for the world-session badge and the player HUD shell.
 * The Awtsmoos gives each word a place beneath the light;
 * Awtsmoos.com keeps the journey clear, in every mobile sight.
 * Round 3 (2026-11-19): the HUD shell owns the second top-left row (below the
 * badge), so the story card must clear the shell's bottom too — not just the badge's.
 */

/**
 * Computes a safe vertical start below the badge and the HUD shell.
 * @param {number} badgeBottom Measured badge bottom in viewport pixels.
 * @param {number} mobileWidth Current viewport width in CSS pixels.
 * @param {number} [shellBottom=0] Measured player-HUD-shell bottom in viewport pixels.
 * @returns {number|null} Objective card top, or null for unchanged desktop layout.
 */
export function calculateObjectivePortraitTop(badgeBottom, mobileWidth, shellBottom = 0) {
	if (!Number.isFinite(mobileWidth) || mobileWidth > 600) {
		return null;
	}
	const validatedBadge = Number.isFinite(badgeBottom) ? badgeBottom : 0;
	const validatedShell = Number.isFinite(shellBottom) ? shellBottom : 0;
	return Math.max(76, Math.ceil(validatedBadge) + 12, Math.ceil(validatedShell) + 8);
}

/**
 * Keeps the story card clear of the real status pill and HUD shell as screen orientation changes.
 * @param {Document} documentValue Real page document.
 * @param {HTMLElement} objective Real mission card.
 * @returns {Function} Release the viewport listener when the card is removed.
 */
export function bindObjectivePortraitClearance(documentValue, objective) {
	const viewport = documentValue.defaultView;
	const update = () => {
		const statusCopy = documentValue.querySelector('.Awtsmoos-realtime-copy');
		const status = statusCopy?.parentElement || statusCopy;
		const badgeBottom = status?.getBoundingClientRect?.().bottom ?? 0;
		const shell = documentValue.querySelector('#playerHudShell');
		const shellBottom = shell?.getBoundingClientRect?.().bottom ?? 0;
		const objectiveTop = calculateObjectivePortraitTop(
			badgeBottom,
			viewport?.innerWidth ?? Infinity,
			shellBottom
		);
		if (objectiveTop === null) {
			objective.style.removeProperty('top');
		} else {
			objective.style.top = `${objectiveTop}px`;
		}
	};
	viewport?.addEventListener?.('resize', update);
	update();
	return () => viewport?.removeEventListener?.('resize', update);
}
