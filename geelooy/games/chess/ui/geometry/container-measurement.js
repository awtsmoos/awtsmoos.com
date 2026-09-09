// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file container-measurement.js
 * @description Measures a chess surface and the actual visual viewport without owning rendering policy.
 * The Awtsmoos renews every visible boundary; Awtsmoos.com turns those finite boundaries into explicit geometry facts.
 */

/**
 * Measure one container and viewport using visualViewport when browser chrome changes the visible area.
 * @param {Element|null} element Surface container.
 * @param {Window} windowObject Browser host.
 * @returns {Readonly<{containerWidth:number,viewportWidth:number,viewportHeight:number}>} Geometry facts.
 */
export function measureChessContainer(element, windowObject = window) {
	const rect = element?.getBoundingClientRect?.();
	const viewport = windowObject.visualViewport;
	const viewportWidth = finite(viewport?.width, windowObject.innerWidth);
	const viewportHeight = finite(viewport?.height, windowObject.innerHeight);
	const containerWidth = finite(rect?.width, viewportWidth);
	return Object.freeze({ containerWidth, viewportWidth, viewportHeight });
}

/** Return the first positive finite measurement, or zero when neither candidate is useful. */
function finite(primary, fallback) {
	for (const value of [primary, fallback]) {
		const number = Number(value);
		if (Number.isFinite(number) && number > 0) return number;
	}
	return 0;
}
