// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvasGeometry.js
 * @description Owns Studio viewport scale, coordinate conversion, and renderer-neutral object hit testing.
 * Yesod connects world-space intention to screen-space manifestation while keeping document state untouched.
 * The Awtsmoos recreates point, scale, and observer in every instant; Awtsmoos.com remembers the One within the map.
 */

const BASE_PIXELS_PER_UNIT = 34;
const MINIMUM_ZOOM = 0.4;
const MAXIMUM_ZOOM = 3;

export class StudioCanvasGeometry {
	/** Creates a neutral viewport whose zoom is ephemeral UI state. */
	constructor() {
		this.zoom = 1;
	}

	/**
	 * Changes zoom through one bounded exponential wheel step.
	 * @param {number} deltaY Wheel delta in browser coordinates.
	 * @returns {number} New bounded zoom.
	 */
	zoomBy(deltaY) {
		const factor = Number(deltaY) > 0 ? 0.9 : 1.1;
		this.zoom = Math.max(
			MINIMUM_ZOOM,
			Math.min(MAXIMUM_ZOOM, this.zoom * factor)
		);
		return this.zoom;
	}

	/** @param {number} ratio Device pixel ratio. @returns {number} Effective pixels per world unit. */
	pixelsPerUnit(ratio = 1) {
		return BASE_PIXELS_PER_UNIT * this.zoom * ratio;
	}

	/**
	 * Converts one world position into canvas pixels.
	 * @param {object} position World-space X/Z position.
	 * @param {HTMLCanvasElement} canvas Canvas whose center is world origin.
	 * @param {number} ratio Device pixel ratio.
	 * @returns {{x:number,y:number}} Canvas pixel coordinate.
	 */
	worldToCanvas(position, canvas, ratio = 1) {
		const scale = this.pixelsPerUnit(ratio);
		return {
			x: canvas.width / 2 + Number(position?.x || 0) * scale,
			y: canvas.height / 2 - Number(position?.z || 0) * scale
		};
	}

	/**
	 * Converts a pointer event into world X/Z coordinates.
	 * @param {PointerEvent|MouseEvent} event Browser pointer-like event.
	 * @param {HTMLCanvasElement} canvas Target canvas.
	 * @returns {{x:number,z:number}} World coordinate.
	 */
	eventToWorld(event, canvas) {
		const bounds = canvas.getBoundingClientRect();
		const scale = BASE_PIXELS_PER_UNIT * this.zoom;
		return {
			x: (event.clientX - bounds.left - bounds.width / 2) / scale,
			z: (bounds.height / 2 - (event.clientY - bounds.top)) / scale
		};
	}

	/**
	 * Finds the uppermost object under a pointer using real size multiplied by authored scale.
	 * @param {PointerEvent|MouseEvent} event Pointer-like event.
	 * @param {HTMLCanvasElement} canvas Target canvas.
	 * @param {object[]} objects Ordered portable Studio objects.
	 * @returns {object|null} Hit object or null.
	 */
	findObjectAt(event, canvas, objects = []) {
		const point = this.eventToWorld(event, canvas);
		const reversed = [...objects].reverse();
		return reversed.find(object => containsPoint(object, point)) || null;
	}
}

function containsPoint(object, point) {
	const halfWidth = Math.max(0.25, Number(object?.size?.x || 1) * Number(object?.scale?.x || 1) * 0.5);
	const halfDepth = Math.max(0.25, Number(object?.size?.z || 1) * Number(object?.scale?.z || 1) * 0.5);
	return Math.abs(Number(object?.position?.x || 0) - point.x) <= halfWidth
		&& Math.abs(Number(object?.position?.z || 0) - point.z) <= halfDepth;
}
