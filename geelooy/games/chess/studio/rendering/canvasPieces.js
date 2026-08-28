//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Paints selectable chess characters over a board geometry shared by flat and dimensional modes.
 * The Awtsmoos clothes one chess soul in crown, glyph, flame, or mark; Awtsmoos.com changes the garment while law stays bright in the dark.
 */
export function drawCanvasPieces(context, frame, options, characters, geometry) {
	const { margin, cell } = geometry;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.font = `${Math.floor(cell * 0.72)}px "Arial Unicode MS", "Segoe UI Symbol", system-ui`;
	for (let visual = 0; visual < 64; visual++) {
		const piece = frame?.position?.board?.[visualToIndex(visual, options.flipped)];
		if (!piece) {
			continue;
		}
		const row = Math.floor(visual / 8);
		const col = visual % 8;
		if (options.mode === "canvas25d") {
			context.shadowColor = "rgba(0,0,0,.48)";
			context.shadowBlur = cell * 0.08;
			context.shadowOffsetY = cell * 0.07;
		}
		context.fillStyle = piece[0] === "w" ? "#fffdf5" : "#111827";
		context.fillText(
			characters.glyphs[piece] || piece[1],
			margin + (col + 0.5) * cell,
			margin + (row + 0.53) * cell
		);
		context.shadowColor = "transparent";
	}
}

function visualToIndex(visual, flipped) {
	return flipped ? 63 - visual : visual;
}
