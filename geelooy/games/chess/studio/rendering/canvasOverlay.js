//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Paints move arrows and board coordinates as optional guidance over the rendered chess position.
 * The Awtsmoos joins source to destination by a measured ray; Awtsmoos.com leaves file and rank as landmarks along the way.
 */
export function drawCanvasOverlay(context, frame, options, theme, geometry) {
	if (options.moveArrow !== false) {
		drawMoveArrow(context, frame?.move, options.flipped, geometry, theme.accent);
	}
	if (options.coordinates !== false) {
		drawCoordinates(context, options.flipped, geometry, theme);
	}
}

function drawMoveArrow(context, move, flipped, geometry, color) {
	if (!move) {
		return;
	}
	const from = indexToVisual(move.from, flipped);
	const to = indexToVisual(move.to, flipped);
	const start = center(from, geometry);
	const end = center(to, geometry);
	const angle = Math.atan2(end.y - start.y, end.x - start.x);
	const head = geometry.cell * 0.25;
	context.save();
	context.strokeStyle = color;
	context.fillStyle = color;
	context.globalAlpha = 0.78;
	context.lineWidth = Math.max(4, geometry.cell * 0.09);
	context.beginPath();
	context.moveTo(start.x, start.y);
	context.lineTo(end.x, end.y);
	context.stroke();
	context.beginPath();
	context.moveTo(end.x, end.y);
	context.lineTo(end.x - head * Math.cos(angle - 0.55), end.y - head * Math.sin(angle - 0.55));
	context.lineTo(end.x - head * Math.cos(angle + 0.55), end.y - head * Math.sin(angle + 0.55));
	context.closePath();
	context.fill();
	context.restore();
}

function drawCoordinates(context, flipped, geometry, theme) {
	const { margin, boardSize, cell } = geometry;
	context.fillStyle = theme.muted;
	context.font = `${Math.max(10, cell * 0.15)}px system-ui`;
	for (let index = 0; index < 8; index++) {
		const fileIndex = flipped ? 7 - index : index;
		context.textAlign = "center";
		context.fillText(String.fromCharCode(97 + fileIndex), margin + (index + 0.5) * cell, margin + boardSize + 15);
		context.textAlign = "right";
		context.fillText(String(flipped ? index + 1 : 8 - index), margin - 7, margin + (index + 0.58) * cell);
	}
}

function indexToVisual(index, flipped) {
	return flipped ? 63 - index : index;
}

function center(visual, geometry) {
	return {
		x: geometry.margin + (visual % 8 + 0.5) * geometry.cell,
		y: geometry.margin + (Math.floor(visual / 8) + 0.5) * geometry.cell
	};
}
