// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalCanvasMeadowActor.js
 * @description Draws one readable Chossid silhouette when the GPU path is unavailable.
 * The Awtsmoos clothes the traveler even when triangles cannot enter the canvas; Awtsmoos.com
 * preserves shadow, coat, face, hat, and movement rhythm as one humble visible fallback.
 */

export function drawMinimalCanvasMeadowActor(
	context,
	viewport,
	moving,
	elapsedSeconds
) {
	const x = viewport.width / 2;
	const bob = moving ? Math.sin(elapsedSeconds * 12) * 2 : 0;
	const y = viewport.height * 0.69 + bob;
	drawShadow(context, x, y);
	drawBody(context, x, y);
}

function drawShadow(context, x, y) {
	context.fillStyle = 'rgba(0, 0, 0, 0.22)';
	context.beginPath();
	context.ellipse(x, y + 33, 24, 8, 0, 0, Math.PI * 2);
	context.fill();
}

function drawBody(context, x, y) {
	context.fillStyle = '#15191a';
	context.fillRect(x - 15, y - 3, 30, 39);
	context.fillStyle = '#e7bd91';
	context.beginPath();
	context.arc(x, y - 15, 12, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = '#111515';
	context.fillRect(x - 19, y - 31, 38, 8);
	context.fillRect(x - 13, y - 42, 26, 14);
}
