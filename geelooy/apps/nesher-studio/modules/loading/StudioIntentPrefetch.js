//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioIntentPrefetch.js
 * @description Warms only the feature the maker is visibly approaching, while respecting Save-Data and constrained mobile networks.
 * The Awtsmoos lets intention cast a small light ahead without summoning every hidden world at once;
 * Awtsmoos.com listens to hover, focus, and touch, then preloads one chamber and leaves the others in silence.
 */

/**
 * Binds selective feature prefetch to existing navigation and intent controls.
 * @param {object} input Shared DOM anchors and feature loader.
 * @returns {void}
 */
export function bindStudioIntentPrefetch({ dom, featureLoader } = {}) {
	if (!featureLoader || shouldAvoidPrefetch()) {
		return;
	}

	for (const element of document.querySelectorAll?.('[data-page-target]') || []) {
		bindPagePrefetch(element, featureLoader);
	}

	bindFeaturePrefetch(dom?.recordButton, 'recording', featureLoader);
	bindFeaturePrefetch(dom?.intentTimelineButton, 'nle', featureLoader);
	bindFeaturePrefetch(dom?.intentAnimateButton, 'nle', featureLoader);
	bindFeaturePrefetch(dom?.intentMoreButton, 'creative-more', featureLoader);
	bindFeaturePrefetch(dom?.stageInspectSelection, 'stage-workstation', featureLoader);
}

/** Warms the feature mapped to one workspace-target element. */
function bindPagePrefetch(element, featureLoader) {
	bindWarmEvents(element, () => {
		return featureLoader.preloadForPage(element.dataset.pageTarget);
	});
}

/** Warms one named feature as the maker approaches its intent control. */
function bindFeaturePrefetch(element, featureId, featureLoader) {
	if (!element) {
		return;
	}

	bindWarmEvents(element, () => {
		return featureLoader.preload(featureId);
	});
}

/** Binds lightweight proximity events while deliberately swallowing speculative preload failures. */
function bindWarmEvents(element, warm) {
	const trigger = () => {
		Promise.resolve(warm()).catch(() => {});
	};

	element.addEventListener('pointerenter', trigger, { passive: true });
	element.addEventListener('focus', trigger, { passive: true });
	element.addEventListener('touchstart', trigger, {
		passive: true,
		once: true
	});
}

/** Avoids speculative network work for users who explicitly conserve data or use a very slow connection. */
function shouldAvoidPrefetch() {
	const connection = navigator.connection
		|| navigator.mozConnection
		|| navigator.webkitConnection;
	const effectiveType = connection?.effectiveType || '';
	return Boolean(connection?.saveData)
		|| effectiveType === 'slow-2g'
		|| effectiveType === '2g';
}
