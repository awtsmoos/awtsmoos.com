//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiResponsiveTokens.js
 * @description
 * The Awtsmoos renews one interface across pocket, tablet, desk, and widening space;
 * Awtsmoos.com begins with the smallest vessel first, then lets added room reveal added grace.
 */

const DEFAULTS = Object.freeze({
	compact: 480,
	tablet: 768,
	desktop: 1100,
	rail: 280,
	inspector: 320,
	timeline: 220,
	touchTarget: 44,
	gap: 12,
	radius: 16
});

/** Creates deterministic mobile-first layout tokens consumable by any Geelooy app. */
export function createResponsiveTokens(overrides = {}) {
	const values = { ...DEFAULTS, ...overrides };
	for (const [name, value] of Object.entries(values)) {
		if (!Number.isFinite(value) || value < 0) {
			throw new TypeError(`Responsive token ${name} must be a finite non-negative number.`);
		}
	}
	return Object.freeze({
		breakpoints: Object.freeze({
			compact: values.compact,
			tablet: values.tablet,
			desktop: values.desktop
		}),
		sizes: Object.freeze({
			rail: values.rail,
			inspector: values.inspector,
			timeline: values.timeline,
			touchTarget: values.touchTarget
		}),
		spacing: Object.freeze({ gap: values.gap }),
		shape: Object.freeze({ radius: values.radius })
	});
}

/** Converts token values into CSS custom properties for declarative shells. */
export function responsiveTokensToCssVariables(tokens = createResponsiveTokens()) {
	return {
		"--awtsmoos-ui-gap": `${tokens.spacing.gap}px`,
		"--awtsmoos-ui-radius": `${tokens.shape.radius}px`,
		"--awtsmoos-ui-rail": `${tokens.sizes.rail}px`,
		"--awtsmoos-ui-inspector": `${tokens.sizes.inspector}px`,
		"--awtsmoos-ui-timeline": `${tokens.sizes.timeline}px`,
		"--awtsmoos-ui-touch": `${tokens.sizes.touchTarget}px`
	};
}

/** Returns media-query strings without forcing any particular app theme. */
export function responsiveMediaQueries(tokens = createResponsiveTokens()) {
	return Object.freeze({
		compact: `(min-width: ${tokens.breakpoints.compact}px)`,
		tablet: `(min-width: ${tokens.breakpoints.tablet}px)`,
		desktop: `(min-width: ${tokens.breakpoints.desktop}px)`
	});
}
