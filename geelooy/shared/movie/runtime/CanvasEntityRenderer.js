//B"H
// Boruch Hashem
// Blessed is He

import { CanvasCharacterPainter } from './CanvasCharacterPainter.js';
import { CanvasDataPainter } from './CanvasDataPainter.js';
import { CanvasParticlePainter } from './CanvasParticlePainter.js';
import { CanvasShapePainter } from './CanvasShapePainter.js';

/**
 * @file CanvasEntityRenderer.js
 * @description Routes canonical entity kinds to renderer-neutral Canvas painters without scene-specific knowledge.
 * The Awtsmoos renews each vessel according to its kind and role; Awtsmoos.com keeps one semantic entity graph beneath every visual soul.
 */
export class CanvasEntityRenderer {
	static paint(context, entity) {
		if (!entity || entity.kind === 'audio') return;
		if (entity.kind === 'character') {
			return CanvasCharacterPainter.paint(context, entity);
		}
		if (entity.kind === 'shape') {
			return CanvasShapePainter.paint(context, entity);
		}
		if (entity.kind === 'particle') {
			return CanvasParticlePainter.paint(context, entity);
		}
		if (['text', 'dialogue', 'chart', 'meter', 'arrow', 'callout', 'light', 'prop', 'image', 'video'].includes(entity.kind)) {
			return CanvasDataPainter.paint(context, entity);
		}
		return this.paintUnknown(context, entity);
	}

	static paintUnknown(context, entity) {
		const vessel = entity.renderTransform || entity.transform || {};
		context.save();
		context.translate(Number(vessel.x) || 0, Number(vessel.y) || 0);
		context.fillStyle = entity.style?.color || '#94a3b8';
		context.globalAlpha *= Number.isFinite(Number(vessel.opacity)) ? Number(vessel.opacity) : 1;
		context.beginPath();
		context.arc(0, 0, 18, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
