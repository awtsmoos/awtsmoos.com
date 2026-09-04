//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file sceneRenderer.js
 * @description Draws the critical Stage background, grid, source forms, and selection overlays without importing optional workroom controllers.
 * The Awtsmoos lets every visible source receive a truthful outline while hidden chambers remain outside first light;
 * Awtsmoos.com keeps rendering direct and measured, so Canvas arrives quickly before deeper tools take flight.
 */
import { drawSourceOverlay } from './sourceOverlay.js';
import { renderSource } from './sourceRenderers.js';

/**
 * Draws the current scene and optional editor overlays.
 * @param {CanvasRenderingContext2D} context Stage 2D rendering context.
 * @param {object} state Shared Studio runtime state.
 * @param {object} options Rendering options.
 * @returns {void}
 */
export function renderScene(context, state, options = {}) {
	drawBackground(context, state);
	drawGrid(context, state);

	for (const source of state.sources) {
		renderSource(context, source);
	}

	if (options.overlay === false) {
		return;
	}

	for (const [index, source] of state.sources.entries()) {
		drawSourceOverlay(
			context,
			source,
			state.selectedId === source.id,
			index,
			{
				tool: state.stageTool || 'transform'
			}
		);
	}
}

/** Paints the canonical dark Stage gradient. */
function drawBackground(context, state) {
	const gradient = context.createLinearGradient(
		0,
		0,
		state.width,
		state.height
	);
	gradient.addColorStop(0, '#0a1020');
	gradient.addColorStop(1, '#111827');
	context.fillStyle = gradient;
	context.fillRect(0, 0, state.width, state.height);
}

/** Draws the lightweight alignment grid behind all scene sources. */
function drawGrid(context, state) {
	context.strokeStyle = '#22304b99';
	context.lineWidth = 1;

	for (let x = 0; x < state.width; x += 80) {
		drawLine(context, x, 0, x, state.height);
	}

	for (let y = 0; y < state.height; y += 80) {
		drawLine(context, 0, y, state.width, y);
	}
}

/** Draws one straight grid segment through the supplied Stage context. */
function drawLine(context, x1, y1, x2, y2) {
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}
