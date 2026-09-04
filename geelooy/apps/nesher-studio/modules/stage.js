//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stage.js
 * @description Coordinates only critical Canvas drawing and direct manipulation while optional inspector/source-row projections subscribe through a lazy registry.
 * The Awtsmoos lets the hand move one visible source before every deeper vessel has descended;
 * Awtsmoos.com keeps first Canvas light free of inspector weight, then publishes one signal when hidden rooms are ready to be fed.
 */
import { dom, ctx } from './dom.js';
import { renderScene } from './renderers/sceneRenderer.js';
import {
	beginStageDrag,
	endStageDrag,
	keyMoveSelected,
	moveStageDrag
} from './stage/stageDrag.js';
import { publishStageProjection } from './stage/StageProjectionRegistry.js';

/** Resizes the real canvas to canonical project dimensions and redraws immediately. */
export function resizeStage(state) {
	dom.stage.width = state.width;
	dom.stage.height = state.height;
	drawStage(state);
	publishCanvasResize(state);
}

/** Draws the current scene while preserving the transient Stage editing tool. */
export function drawStage(state, options = {}) {
	state.stageTool ||= 'transform';
	renderScene(ctx, state, options);
}

/**
 * Publishes current Stage state only to projections that have actually loaded.
 * @param {object} state Shared Studio runtime state.
 * @returns {void}
 */
export function refreshSources(state) {
	publishStageProjection(state);
	publishStageRefresh(state);
}

/** Binds pointer and keyboard direct manipulation to the shared Stage state. */
export function bindDragging(state) {
	state.stageTool ||= 'transform';

	dom.stage.addEventListener('pointerdown', (event) => {
		beginStageDrag(state, event, dom.stage);
		drawStage(state);
		refreshSources(state);
	});

	dom.stage.addEventListener('pointermove', (event) => {
		if (!moveStageDrag(state, event, dom.stage)) {
			return;
		}

		drawStage(state);
		refreshSources(state);
	});

	window.addEventListener('pointerup', () => {
		endStageDrag(state);
	});

	window.addEventListener('keydown', (event) => {
		if (!keyMoveSelected(state, event)) {
			return;
		}

		drawStage(state);
		refreshSources(state);
	});
}

/** Publishes editor-only selection context for the lightweight intent shell. */
function publishStageRefresh(state) {
	publishStudioEvent('awtsmoos-studio:stage-refresh', {
		selectedId: state.selectedId || null,
		sceneId: state.currentSceneId || null
	});
}

/** Publishes project-dimension changes so an already-loaded Timeline can rebuild itself. */
function publishCanvasResize(state) {
	publishStudioEvent('awtsmoos-studio:canvas-resize', {
		width: state.width,
		height: state.height,
		fps: state.fps
	});
}

/** Publishes one optional editor event only when the host environment supports CustomEvent. */
function publishStudioEvent(name, detail) {
	if (
		typeof globalThis.dispatchEvent !== 'function'
		|| typeof globalThis.CustomEvent !== 'function'
	) {
		return;
	}

	globalThis.dispatchEvent(
		new globalThis.CustomEvent(name, {
			detail
		})
	);
}
