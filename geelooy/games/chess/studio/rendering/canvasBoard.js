//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Paints themed chess squares and optional top-down depth without owning piece or arrow logic.
 * The Awtsmoos lays every square as a vessel of light; Awtsmoos.com gives plane and depth one measured sight.
 */
export function drawCanvasBoard(context, frame, options, theme, geometry) {
	const { margin, boardSize, cell } = geometry;
	if (options.mode === "canvas25d") {
		drawBoardDepth(context, margin, boardSize, cell, theme);
	}
	const move = frame?.move;
	for (let visual = 0; visual < 64; visual++) {
		const row = Math.floor(visual / 8);
		const col = visual % 8;
		const index = visualToIndex(visual, options.flipped);
		context.fillStyle = (row + col) % 2 ? theme.dark : theme.light;
		context.fillRect(margin + col * cell, margin + row * cell, cell, cell);
		if (index === move?.from || index === move?.to) {
			context.fillStyle = index === move?.to && (frame.check || frame.mate)
				? theme.check
				: theme.accentSoft;
			context.fillRect(margin + col * cell, margin + row * cell, cell, cell);
		}
	}
}

function drawBoardDepth(context, margin, boardSize, cell, theme) {
	context.save();
	context.shadowColor = "rgba(0,0,0,.55)";
	context.shadowBlur = cell * 0.24;
	context.shadowOffsetY = cell * 0.14;
	context.fillStyle = theme.surface;
	context.fillRect(margin - 5, margin - 5, boardSize + 10, boardSize + 10);
	context.restore();
}

function visualToIndex(visual, flipped) {
	return flipped ? 63 - visual : visual;
}
