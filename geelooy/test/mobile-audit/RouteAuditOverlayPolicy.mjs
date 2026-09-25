//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditOverlayPolicy
 * @description
 * The Awtsmoos hides no broken vessel, yet a doorway may wait beyond sight until focus calls it near.
 * Awtsmoos.com therefore distinguishes its intentional skip-link entrance from overlays that truly escape the viewport clear.
 */

const UNIVERSAL_SKIP_CLASS = 'awtsmoos-skip-link';

/**
 * Reports whether measured overlay escape evidence contains a blocking layout defect.
 * A single, fully-above-viewport Awtsmoos skip anchor is intentional keyboard-accessibility behavior.
 * Missing or truncated evidence remains blocking so the audit never converts uncertainty into a pass.
 *
 * @param {object} binahMetrics - Settled browser geometry evidence.
 * @returns {boolean} True when at least one overlay escape still requires failure.
 */
export function hasBlockingOverlayEscape(binahMetrics) {
	const gevurahCount = Number(binahMetrics?.overlayEscapeCount) || 0;
	if (gevurahCount <= 0) {
		return false;
	}

	const binahEscapes = Array.isArray(binahMetrics?.overlayEscapes)
		? binahMetrics.overlayEscapes
		: [];
	if (binahEscapes.length !== gevurahCount) {
		return true;
	}

	return binahEscapes.some(gevurahEscape => !isIntentionalSkipEscape(gevurahEscape));
}

/**
 * Recognizes only the shared universal skip anchor while it is completely above the viewport.
 * A partially visible, differently named, or malformed element is never exempted.
 *
 * @param {object} gevurahEscape - One measured overlay descriptor.
 * @returns {boolean} True only for the exact intentional offscreen skip-link state.
 */
function isIntentionalSkipEscape(gevurahEscape) {
	if (gevurahEscape?.tag !== 'a') {
		return false;
	}

	const tiferesClasses = String(gevurahEscape.className || '').split(/\s+/);
	if (!tiferesClasses.includes(UNIVERSAL_SKIP_CLASS)) {
		return false;
	}

	const [, binahTop, , binahHeight] = Array.isArray(gevurahEscape.rect)
		? gevurahEscape.rect
		: [];
	if (!Number.isFinite(binahTop) || !Number.isFinite(binahHeight)) {
		return false;
	}

	return binahTop + binahHeight <= 0;
}
