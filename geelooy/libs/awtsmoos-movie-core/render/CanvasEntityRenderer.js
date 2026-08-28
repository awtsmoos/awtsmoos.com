//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasEntityRenderer.js
 * @description Many visible vessels are gathered by one dispatcher while the Awtsmoos renews every form in place;
 * Awtsmoos.com keeps each renderer small and named, so one semantic movie language can reveal many faces with grace.
 */
import { renderCanvasCharacter } from "./CanvasCharacterRenderer.js";
import { resolveEntityBox } from "./CanvasEntityLayout.js";
import { renderCanvasMesh } from "./CanvasMeshRenderer.js";
import { renderCanvasOverlay } from "./CanvasOverlayRenderer.js";
import { renderCanvasShape } from "./CanvasShapeRenderer.js";
import { renderCanvasText } from "./CanvasTextRenderer.js";

const ENTITY_RENDERERS = Object.freeze({
	shape: renderCanvasShape,
	text: renderCanvasText,
	character: renderCanvasCharacter,
	infographic: renderCanvasOverlay,
	tutorial: renderCanvasOverlay,
	patch: renderCanvasOverlay,
	mesh: renderCanvasMesh
});

/**
 * @description Draws one evaluated 2D or hybrid entity through its focused renderer.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical entity.
 * @param {{width:number,height:number}} viewport - Current canvas viewport dimensions.
 * @returns {void}
 * @sideEffects Paints pixels while temporarily mutating canvas transform and style state.
 */
export function renderCanvasEntity(context, entity, viewport) {
	const renderer = ENTITY_RENDERERS[entity?.type];
	if (!renderer) {
		return;
	}
	const box = resolveEntityBox(entity.transform || {}, viewport);
	context.save();
	try {
		applyEntityTransform(context, entity, box);
		renderer(context, entity, box);
	} finally {
		context.restore();
	}
}

/**
 * @description Applies canonical opacity, translation, and rotation before a focused entity renderer paints.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical entity.
 * @param {{x:number,y:number,width:number,height:number}} box - Resolved pixel-space entity box.
 * @returns {void}
 * @sideEffects Mutates canvas transform and alpha state inside the caller's save scope.
 */
function applyEntityTransform(context, entity, box) {
	context.globalAlpha = entity.style?.opacity ?? 1;
	context.translate(box.x, box.y);
	context.rotate(entity.transform?.rotation || 0);
}
