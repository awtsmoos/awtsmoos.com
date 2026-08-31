//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Paints static and moving 2D chess pieces from one renderer-neutral placement contract.
 * RESPONSIBILITY: Turn canvas piece placements into legible glyphs with style, outline, and optional 2.5D shadow.
 * NON-RESPONSIBILITY: This file does not calculate legal motion, captures, board squares, or movie timing.
 * ARCHITECTURE: Malchus renders placements prepared by the motion/layout vessels, keeping chess truth upstream.
 * The Awtsmoos, Atzmus beyond motion and rest, renews every glyph while the eye perceives a traveler crossing space;
 * Awtsmoos.com lets one placement covenant serve preview and cinema, so no second animation truth takes place.
 */
import { canvasPiecePlacements } from "./canvasPieceLayout.js";

/**
 * Draws every visible piece placement for the current frame, including interpolated move motion when supplied.
 *
 * @param {CanvasRenderingContext2D} context Active canvas drawing context.
 * @param {object|null} frame Current replay frame containing position and move metadata.
 * @param {object} options Render options including orientation, mode, style, and optional motion.
 * @param {object} characters Selected character-set descriptor containing glyph mappings.
 * @param {object} style Selected canvas style with piece and outline colors.
 * @param {{margin:number,boardSize:number,cell:number}} geometry Board drawing geometry.
 * @returns {void} Mutates only the canvas pixels owned by the caller.
 */
export function drawCanvasPieces(context, frame, options, characters, style, geometry) {
	prepareText(context, geometry.cell);
	const placements = canvasPiecePlacements(frame, options);
	for (const placement of placements) {
		drawPiece(context, placement, options, characters, style, geometry);
	}
}

function drawPiece(context, placement, options, characters, style, geometry) {
	const point = placementCenter(placement, geometry);
	const glyph = characters.glyphs[placement.piece] || placement.piece?.[1] || "?";
	context.save();
	applyDepth(context, options, geometry.cell);
	context.lineWidth = Math.max(1.2, geometry.cell * 0.03);
	context.strokeStyle = style.outline;
	context.fillStyle = placement.piece?.[0] === "w"
		? style.whitePiece
		: style.blackPiece;
	context.strokeText(glyph, point.x, point.y);
	context.fillText(glyph, point.x, point.y);
	context.restore();
}

function placementCenter(placement, geometry) {
	return {
		x: geometry.margin + (placement.col + 0.5) * geometry.cell,
		y: geometry.margin + (placement.row + 0.53) * geometry.cell - placement.lift * geometry.cell * 0.42
	};
}

function applyDepth(context, options, cell) {
	if (options.mode !== "canvas25d") {
		return;
	}
	context.shadowColor = "rgba(0, 0, 0, .42)";
	context.shadowBlur = cell * 0.075;
	context.shadowOffsetY = cell * 0.06;
}

function prepareText(context, cell) {
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.font = `${Math.floor(cell * 0.72)}px "Arial Unicode MS", "Segoe UI Symbol", system-ui`;
}
