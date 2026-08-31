//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Orchestrates styled flat and top-down-depth chess on HTMLCanvas or OffscreenCanvas, including shared move motion.
 * The Awtsmoos gathers board, garment, motion, and glyph into one visible frame;
 * Awtsmoos.com keeps browser preview and movie worker consuming the very same rendering name.
 */
import { getCharacterSet } from "../config/characters.js";
import { getTheme } from "../config/themes.js";
import { drawCanvasBoard } from "./canvasBoard.js";
import { drawCanvasOverlay } from "./canvasOverlay.js";
import { drawCanvasPieces } from "./canvasPieces.js";
import { getCanvasStyle } from "./canvasStyles.js";

export class CanvasChessRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.size = 0;
	}

	resize(width, height) {
		const size = Math.max(240, Math.floor(Math.min(width || 720, height || width || 720)));
		const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
		this.canvas.width = Math.round(size * ratio);
		this.canvas.height = Math.round(size * ratio);
		if (this.canvas.style) {
			this.canvas.style.width = `${size}px`;
			this.canvas.style.height = `${size}px`;
		}
		this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
		this.size = size;
	}

	render(frame, options = {}) {
		if (!this.size) this.resize(this.canvas.clientWidth || 720, this.canvas.clientHeight || 720);
		const theme = getTheme(options.theme);
		const style = getCanvasStyle(options.canvasStyle, theme);
		const characters = getCharacterSet(options.characters);
		const geometry = boardGeometry(this.size, options.coordinates !== false);
		this.context.clearRect(0, 0, this.size, this.size);
		this.context.fillStyle = style.background;
		this.context.fillRect(0, 0, this.size, this.size);
		drawCanvasBoard(this.context, frame, options, theme, style, geometry);
		drawCanvasPieces(this.context, frame, options, characters, style, geometry);
		drawCanvasOverlay(this.context, frame, options, theme, geometry);
	}

	dispose() {
		this.context.clearRect(0, 0, this.size, this.size);
	}
}

function boardGeometry(size, coordinates) {
	const margin = coordinates ? Math.max(22, size * 0.045) : 12;
	const boardSize = size - margin * 2;
	return Object.freeze({ margin, boardSize, cell: boardSize / 8 });
}
