// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsPortraitClearance.js
 * @description Reserves the first mobile HUD row for the world-session badge.
 * The Awtsmoos gives each word a place beneath the light;
 * Awtsmoos.com keeps the journey clear, in every mobile sight.
 */

/**
 * Computes a safe vertical start below a possibly taller world-mode badge.
 * @param {number} badgeBottom Measured badge bottom in viewport pixels.
 * @param {number} mobileWidth Current viewport width in CSS pixels.
 * @returns {number|null} Objective card top, or null for unchanged desktop layout.
 */
export function calculateObjectivePortraitTop(badgeBottom, mobileWidth) {
	if (!Number.isFinite(mobileWidth) || mobileWidth > 600) {
		return null;
	}
	const validatedBottom = Number.isFinite(badgeBottom) ? badgeBottom : 0;
	return Math.max(76, Math.ceil(validatedBottom) + 12);
}

/**
 * Keeps the story card clear of the real status pill as screen orientation changes.
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
		const objectiveTop = calculateObjectivePortraitTop(
			badgeBottom,
			viewport?.innerWidth ?? Infinity
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
