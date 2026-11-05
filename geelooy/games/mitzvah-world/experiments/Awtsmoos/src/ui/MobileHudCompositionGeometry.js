// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionGeometry.js
 * @description Produces measured portrait and landscape HUD rectangles for acceptance proofs.
 * The Awtsmoos renews space and measure together; Awtsmoos.com records finite rectangles
 * so collision claims rest on arithmetic evidence rather than flattering pictures.
 */

export function mobileHudZoneRectangles(viewport = {}) {
	const width = positive(viewport.width, 390);
	const height = positive(viewport.height, 844);
	const safeTop = nonnegative(viewport.safeTop);
	const safeBottom = nonnegative(viewport.safeBottom);
	if (width > 820 && height > 520) {
		return freezePlan('desktop', {});
	}
	if (width > height) {
		return landscapePlan(width, height, safeTop, safeBottom);
	}
	return portraitPlan(width, height, safeTop, safeBottom);
}

export function rectanglesIntersect(first, second) {
	return first.x < second.x + second.width
		&& first.x + first.width > second.x
		&& first.y < second.y + second.height
		&& first.y + first.height > second.y;
}

export function rectangleInsideViewport(rectangle, viewport) {
	return rectangle.x >= 0
		&& rectangle.y >= 0
		&& rectangle.x + rectangle.width <= viewport.width
		&& rectangle.y + rectangle.height <= viewport.height;
}

function portraitPlan(width, height, safeTop, safeBottom) {
	const gutter = 8;
	const top = safeTop + gutter;
	const rail = rect(width - 64, top, 56, Math.min(360, Math.round(height * 0.52)));
	const contentWidth = rail.x - gutter * 2;
	const playerWidth = Math.max(128, Math.min(164, contentWidth - 112));
	const actionY = height - safeBottom - gutter - 70;
	const castY = actionY - 46;
	const combatY = castY - 128;
	return freezePlan('portrait', {
		player: rect(gutter, top, playerWidth, 98),
		target: rect(gutter + playerWidth + gutter, top, contentWidth - playerWidth - gutter, 96),
		quest: rect(gutter, top + 106, contentWidth, 84),
		transient: rect(gutter, top + 198, contentWidth, 96),
		rail,
		effects: rect(gutter, combatY - 38, contentWidth, 30),
		combat: rect(gutter, combatY, contentWidth, 120),
		cast: rect(gutter, castY, contentWidth, 38),
		action: rect(gutter, actionY, contentWidth, 70)
	});
}

function landscapePlan(width, height, safeTop, safeBottom) {
	const gutter = 8;
	const top = safeTop + gutter;
	const railHeight = Math.min(220, height - safeTop - safeBottom - 16);
	const rail = rect(width - 64, top, 56, railHeight);
	const contentRight = rail.x - gutter;
	const actionY = height - safeBottom - gutter - 62;
	return freezePlan('landscape', {
		player: rect(gutter, top, 210, 72),
		quest: rect(226, top, 260, 72),
		target: rect(494, top, Math.max(0, contentRight - 494), 72),
		transient: rect(gutter, top + 80, 478, 64),
		rail,
		effects: rect(170, top + 152, contentRight - 170, 30),
		combat: rect(170, top + 186, contentRight - 170, 52),
		cast: rect(170, actionY - 44, contentRight - 170, 36),
		action: rect(170, actionY, contentRight - 170, 62)
	});
}

function rect(x, y, width, height) {
	return Object.freeze({
		x: Math.max(0, Math.round(x)),
		y: Math.max(0, Math.round(y)),
		width: Math.max(0, Math.round(width)),
		height: Math.max(0, Math.round(height))
	});
}

function freezePlan(mode, zones) {
	return Object.freeze({ mode, zones: Object.freeze(zones) });
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value) {
	return Math.max(0, Number(value) || 0);
}
