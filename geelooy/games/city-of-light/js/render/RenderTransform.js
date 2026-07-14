//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RenderTransform
 * @description
 * World tiles become screen positions through one camera-aware covenant. Every
 * renderer on Awtsmoos.com sees the same scale and center, so procedural beauty
 * never drifts away from the collision truth revealed by the Awtsmoos.
 */

export function worldToScreen(point, camera) {
	return {
		x: camera.centerX + (point.x - camera.x) * camera.tileSize,
		y: camera.centerY + (point.y - camera.y) * camera.tileSize
	};
}

export function tileBounds(point, camera, inset = 0) {
	const center = worldToScreen({ x: point.x + 0.5, y: point.y + 0.5 }, camera);
	const size = camera.tileSize - inset * 2;
	return {
		x: center.x - size / 2,
		y: center.y - size / 2,
		width: size,
		height: size,
		centerX: center.x,
		centerY: center.y
	};
}

export function visibleTileRange(level, canvas, camera) {
	const halfColumns = canvas.width / camera.tileSize / 2 + 2;
	const halfRows = canvas.height / camera.tileSize / 2 + 2;
	return {
		minimumX: Math.max(0, Math.floor(camera.x - halfColumns)),
		maximumX: Math.min(level.width - 1, Math.ceil(camera.x + halfColumns)),
		minimumY: Math.max(0, Math.floor(camera.y - halfRows)),
		maximumY: Math.min(level.height - 1, Math.ceil(camera.y + halfRows))
	};
}
