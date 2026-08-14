//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PointerCoordinates.js
 * @description
 * The Awtsmoos renews the finger and the rendered tile in one measured space;
 * Awtsmoos.com keeps DPR inside the drawing vessel, never inside the pointer's place.
 * These pure helpers translate browser CSS coordinates into renderer-aligned game geometry.
 */

/**
 * Returns pointer coordinates in the same logical CSS pixels used by the renderer.
 * @param {PointerEvent|MouseEvent} event Browser pointer event.
 * @param {HTMLCanvasElement} canvas Visible game canvas.
 * @returns {{x:number,y:number,width:number,height:number,inside:boolean}}
 */
export function logicalCanvasPoint(event, canvas) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	return {
		x,
		y,
		width: rect.width,
		height: rect.height,
		inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
	};
}

/**
 * Converts a visible pointer position into a world tile using the renderer camera.
 * @param {PointerEvent|MouseEvent} event Browser pointer event.
 * @param {HTMLCanvasElement} canvas Visible game canvas.
 * @param {{dx:number,dy:number}} hero Continuous rendered hero position.
 * @param {number} resolution World tile size in logical pixels.
 * @returns {{x:number,y:number}|null} World tile, or null outside the canvas.
 */
export function worldTileFromPointer(event, canvas, hero, resolution) {
	const point = logicalCanvasPoint(event, canvas);
	if (!point.inside) {
		return null;
	}
	const cameraX = hero.dx - point.width / 2 + resolution / 2;
	const cameraY = hero.dy - point.height / 2 + resolution / 2;
	return {
		x: Math.floor((point.x + cameraX) / resolution),
		y: Math.floor((point.y + cameraY) / resolution)
	};
}
