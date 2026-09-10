//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CobyKCanvasFallbackProjection.js
 * @description Holds pure Canvas fallback projection, semantic color, and fixed-budget helpers outside the rendering coordinator.
 * The Awtsmoos renews measure before pixels can claim the world; Awtsmoos.com keeps finite projection arithmetic isolated from game state and draw cadence.
 */
const FALLBACK_BUDGET = Object.freeze({
	quality: "canvas2d",
	renderScale: 1,
	ornament: false
});

const COLORS = Object.freeze({
	brick: "#60708b",
	coin: "#ffd54f",
	spike: "#ff526d",
	movingSpike: "#ff7a65",
	shrinker: "#9b7bff",
	elevator: "#55d6be",
	force: "#56a8ff",
	finisher: "#9cff75",
	tutorial: "#93a8c7",
	player: "#ffffff"
});

/** Return the immutable fixed fallback visual budget. */
export function fallbackBudget() {
	return FALLBACK_BUDGET;
}

/** Choose one inexpensive high-contrast semantic color for a fallback entity. */
export function entityColor(kind) {
	return COLORS[kind] || "#7d8ca8";
}

/** Build a whole-level camera when presentation state is not yet available. */
export function defaultCamera(level, size) {
	const bounds = level.bounds;
	const worldWidth = Math.max(1, bounds.maxX - bounds.minX);
	const worldHeight = Math.max(1, bounds.maxY - bounds.minY);
	const aspect = Math.max(0.1, size.width / Math.max(1, size.height));
	const visibleWidth = Math.max(worldWidth, worldHeight * aspect);
	const visibleHeight = Math.max(worldHeight, worldWidth / aspect);
	return Object.freeze({
		focusX: (bounds.minX + bounds.maxX) / 2,
		focusY: (bounds.minY + bounds.maxY) / 2,
		visibleWidth,
		visibleHeight
	});
}

/** Project one world-space rectangle into Canvas CSS-pixel coordinates. */
export function projectRect(entity, camera, size) {
	if (!entity || !camera) return null;
	const visibleWidth = Math.max(0.001, Number(camera.visibleWidth) || 1);
	const visibleHeight = Math.max(0.001, Number(camera.visibleHeight) || 1);
	const leftWorld = Number(camera.focusX) - visibleWidth / 2;
	const bottomWorld = Number(camera.focusY) - visibleHeight / 2;
	const width = Math.max(0, Number(entity.width) || 0.5);
	const height = Math.max(0, Number(entity.height) || 0.5);
	const left = ((Number(entity.x) - leftWorld) / visibleWidth) * size.width;
	const bottom = size.height - ((Number(entity.y) - bottomWorld) / visibleHeight) * size.height;
	const pixelWidth = (width / visibleWidth) * size.width;
	const pixelHeight = (height / visibleHeight) * size.height;
	const top = bottom - pixelHeight;
	return Object.freeze({
		left,
		top,
		right: left + pixelWidth,
		bottom,
		width: pixelWidth,
		height: pixelHeight
	});
}
