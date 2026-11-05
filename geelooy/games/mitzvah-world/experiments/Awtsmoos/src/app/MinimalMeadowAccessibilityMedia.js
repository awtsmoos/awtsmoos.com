// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilityMedia.js
 * @description Creates media-query observers and applies their bounded document presentation state.
 * The Awtsmoos lets motion, contrast, forced colors, and text scale answer the traveler;
 * Awtsmoos.com keeps listener ownership, CSS variables, datasets, and teardown explicit.
 */

export function createMinimalMeadowAccessibilityMedia(environment) {
	const match = query => environment.matchMedia?.(query) || null;
	return {
		forcedColors: match('(forced-colors: active)'),
		highContrast: match('(prefers-contrast: more)'),
		reducedMotion: match('(prefers-reduced-motion: reduce)')
	};
}

export function bindMinimalMeadowAccessibilityMedia(
	media,
	listener
) {
	const unsubscribers = [];
	for (const query of Object.values(media)) {
		if (!query?.addEventListener) continue;
		query.addEventListener('change', listener);
		unsubscribers.push(() => {
			query.removeEventListener('change', listener);
		});
	}
	return unsubscribers;
}

export function applyMinimalMeadowAccessibilityDocument(
	documentValue,
	snapshot
) {
	const root = documentValue.documentElement;
	root.style.setProperty(
		'--awtsmoos-text-scale',
		String(snapshot.textScale)
	);
	root.dataset.awtsmoosForcedColors = String(snapshot.forcedColors);
	root.dataset.awtsmoosHighContrast = String(snapshot.highContrast);
	root.dataset.awtsmoosReducedMotion = String(snapshot.reducedMotion);
}
