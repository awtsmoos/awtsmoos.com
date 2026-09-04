//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioFeatureBusyState.js
 * @description Mirrors lazy feature progress into the visible workspace accessibility tree without turning loading posture into saved project state.
 * The Awtsmoos lets a chamber announce that its vessels are descending while the canvas remains alive beneath;
 * Awtsmoos.com keeps waiting local, truthful, and reversible, so one slow room never darkens the whole creative sheath.
 */

/**
 * Marks one optional feature's matching workspace busy or ready and publishes a tiny local loading event.
 * @param {string} featureId Stable feature identity.
 * @param {boolean} busy Whether the feature is currently loading.
 * @param {string} label Human-readable feature label.
 * @returns {void}
 */
export function setStudioFeatureBusy(featureId, busy, label = featureId) {
	for (const page of matchingPages(featureId)) {
		page.setAttribute('aria-busy', String(busy));
		page.classList.toggle('studio-feature-loading', busy);
	}

	window.dispatchEvent?.(
		new CustomEvent('awtsmoos-studio:feature-busy', {
			detail: {
				featureId,
				busy,
				label
			}
		})
	);
}

/** Finds transient workspace elements whose page contract maps to the loading feature. */
function matchingPages(featureId) {
	const pageByFeature = {
		audio: 'audio',
		nle: 'nle',
		sources: 'sources',
		live: 'live',
		setup: 'setup',
		'creative-more': 'more',
		'stage-workstation': 'stage'
	};
	const page = pageByFeature[featureId];

	if (!page) {
		return [];
	}

	return Array.from(
		document.querySelectorAll?.(`[data-studio-page="${page}"]`) || []
	);
}
