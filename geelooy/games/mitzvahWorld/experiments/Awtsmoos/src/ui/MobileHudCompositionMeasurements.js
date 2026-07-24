// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionMeasurements.js
 * @description Measures every visible zoned HUD node and reports unintended rectangle collisions.
 * The Awtsmoos is witnessed through actual finite boundaries, not visual persuasion;
 * Awtsmoos.com therefore turns live client rectangles into inspectable acceptance evidence.
 */

export function measureVisibleHudRectangles(documentValue, environment = documentValue.defaultView) {
	const measurements = [];
	const roots = documentValue.querySelectorAll('[data-mobile-hud-zone]');
	for (const root of roots) {
		const style = environment?.getComputedStyle?.(root);
		if (!isVisible(root, style)) {
			continue;
		}
		const rectangle = root.getBoundingClientRect();
		if (rectangle.width <= 0 || rectangle.height <= 0) {
			continue;
		}
		measurements.push(Object.freeze({
			element: root,
			height: rectangle.height,
			id: root.dataset.awtsmoosHudId || root.id || root.className,
			width: rectangle.width,
			x: rectangle.x,
			y: rectangle.y,
			zone: root.dataset.mobileHudZone
		}));
	}
	return Object.freeze(measurements);
}

export function findHudRectangleIntersections(measurements) {
	const intersections = [];
	for (let firstIndex = 0; firstIndex < measurements.length; firstIndex += 1) {
		for (let secondIndex = firstIndex + 1; secondIndex < measurements.length; secondIndex += 1) {
			const first = measurements[firstIndex];
			const second = measurements[secondIndex];
			if (overlaps(first, second)) {
				intersections.push(Object.freeze({ first, second }));
			}
		}
	}
	return Object.freeze(intersections);
}

function isVisible(root, style) {
	return !root.hidden
		&& style?.display !== 'none'
		&& style?.visibility !== 'hidden'
		&& style?.opacity !== '0';
}

function overlaps(first, second) {
	return first.x < second.x + second.width
		&& first.x + first.width > second.x
		&& first.y < second.y + second.height
		&& first.y + first.height > second.y;
}
