//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Paints static and moving 2D chess pieces with independent glyph style, board style, and legal motion.
 * The Awtsmoos lets the same traveler appear crisp, bold, soft, or minimal while its square remains exact;
 * Awtsmoos.com keeps visual emphasis downstream from MoveMotion so preview and cinema share one lawful act.
 */
import { canvasPiecePlacements } from "./canvasPieceLayout.js";
import { getCanvasPieceStyle } from "./canvasPieceStyles.js";

export function drawCanvasPieces(context, frame, options, characters, style, geometry) {
	const pieceStyle = getCanvasPieceStyle(options.canvasPieceStyle);
	prepareText(context, geometry.cell, pieceStyle);
	for (const placement of canvasPiecePlacements(frame, options)) {
		drawPiece(context, placement, options, characters, style, pieceStyle, geometry);
	}
}

function drawPiece(context, placement, options, characters, style, pieceStyle, geometry) {
	const point = placementCenter(placement, geometry);
	const glyph = characters.glyphs[placement.piece] || placement.piece?.[1] || "?";
	context.save();
	applyShadow(context, options, pieceStyle, geometry.cell);
	context.fillStyle = placement.piece?.[0] === "w" ? style.whitePiece : style.blackPiece;
	if (pieceStyle.outline > 0) {
		context.lineWidth = Math.max(1, geometry.cell * pieceStyle.outline);
		context.strokeStyle = style.outline;
		context.strokeText(glyph, point.x, point.y);
	}
	context.fillText(glyph, point.x, point.y);
	context.restore();
}

function placementCenter(placement, geometry) {
	return {
		x: geometry.margin + (placement.col + 0.5) * geometry.cell,
		y: geometry.margin + (placement.row + 0.53) * geometry.cell - placement.lift * geometry.cell * 0.42
	};
}

function applyShadow(context, options, pieceStyle, cell) {
	const depthBoost = options.mode === "canvas25d" ? 1.45 : 1;
	context.shadowColor = `rgba(0, 0, 0, ${Math.min(0.5, pieceStyle.shadow * depthBoost)})`;
	context.shadowBlur = cell * pieceStyle.shadow * depthBoost;
	context.shadowOffsetY = cell * pieceStyle.shadowY * depthBoost;
}

function prepareText(context, cell, pieceStyle) {
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.font = `${pieceStyle.weight} ${Math.floor(cell * pieceStyle.scale)}px "Arial Unicode MS", "Segoe UI Symbol", system-ui`;
}
