// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicFallbackRenderer
 * @description
 * Context loss or unavailable WebGL still reveals the same houses, trees, character,
 * atmosphere, and particles through the exact shared frame description.
 */

export function drawCinematicFallback(context, frame, points) {
	context.save();
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	for (const triangle of frame.triangles) {
		context.beginPath();
		context.moveTo(...triangle.points[0]);
		context.lineTo(...triangle.points[1]);
		context.lineTo(...triangle.points[2]);
		context.closePath();
		context.fillStyle = cssColor(triangle.color);
		context.fill();
	}
	for (const point of points) {
		context.beginPath();
		context.arc(point.x, point.y, Math.max(1, point.size / 2), 0, Math.PI * 2);
		context.fillStyle = cssColor(point.color);
		context.fill();
	}
	context.restore();
}

function cssColor(color) {
	const [red, green, blue, alpha = 1] = color;
	return `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`;
}
