// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalCanvasMeadowBackdrop.js
 * @description Paints a moving sky, field, hills, path, and flower rhythm without WebGL.
 * The Awtsmoos renews horizon and blossom beyond every failed GPU context; Awtsmoos.com keeps
 * the best sparks of earlier meadow vessels inside one canonical fallback landscape.
 */

export function drawMinimalCanvasMeadowBackdrop(
	context,
	viewport,
	interactor,
	elapsedSeconds
) {
	drawSky(context, viewport);
	drawHills(context, viewport);
	drawGrass(context, viewport);
	drawPath(context, viewport, interactor);
	drawFlowers(context, viewport, interactor, elapsedSeconds);
}

function drawSky(context, { width, height }) {
	const horizon = height * 0.48;
	const gradient = context.createLinearGradient(0, 0, 0, horizon);
	gradient.addColorStop(0, '#68b9ed');
	gradient.addColorStop(1, '#dff5f0');
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, horizon);
}

function drawHills(context, { width, height }) {
	context.fillStyle = '#397e38';
	context.beginPath();
	context.ellipse(
		width * 0.2,
		height * 0.58,
		width * 0.28,
		height * 0.17,
		0,
		0,
		Math.PI * 2
	);
	context.ellipse(
		width * 0.78,
		height * 0.59,
		width * 0.35,
		height * 0.21,
		0,
		0,
		Math.PI * 2
	);
	context.fill();
}

function drawGrass(context, { width, height }) {
	const horizon = height * 0.52;
	const gradient = context.createLinearGradient(0, horizon, 0, height);
	gradient.addColorStop(0, '#6aa853');
	gradient.addColorStop(1, '#1f5f34');
	context.fillStyle = gradient;
	context.fillRect(0, horizon, width, height - horizon);
}

function drawPath(context, { width, height }, interactor) {
	const drift = wrap(interactor.x * 2.4, width * 0.08);
	context.strokeStyle = 'rgba(236, 214, 157, 0.62)';
	context.lineWidth = Math.max(18, width * 0.035);
	context.beginPath();
	context.moveTo(width * 0.44 - drift, height);
	context.quadraticCurveTo(
		width * 0.59 - drift * 0.4,
		height * 0.72,
		width * 0.51,
		height * 0.5
	);
	context.stroke();
}

function drawFlowers(context, viewport, interactor, elapsedSeconds) {
	for (let row = -8; row <= 8; row += 1) {
		for (let column = -14; column <= 14; column += 1) {
			const worldX = column * 3.4 - interactor.x;
			const worldZ = row * 3.4 - interactor.z;
			const point = project(viewport, worldX, worldZ);
			if (!inside(viewport, point)) continue;
			const sway = Math.sin(elapsedSeconds * 2 + column + row) * 1.5;
			context.fillStyle = (column + row) % 4 ? '#d8ec73' : '#f5d8e8';
			context.fillRect(point.x + sway, point.y, 2.5, 5);
		}
	}
}

function project(viewport, relativeX, relativeZ) {
	return {
		x: viewport.width / 2 + relativeX * 11,
		y: viewport.height * 0.7 + relativeZ * 7
	};
}

function inside(viewport, point) {
	return point.x >= -8
		&& point.x <= viewport.width + 8
		&& point.y >= viewport.height * 0.5
		&& point.y <= viewport.height + 8;
}

function wrap(value, span) {
	return ((value % span) + span) % span;
}
