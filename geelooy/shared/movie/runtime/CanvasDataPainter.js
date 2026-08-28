//B"H
// Boruch Hashem
// Blessed is He

import { CanvasInfographicPainter } from './CanvasInfographicPainter.js';
import { CanvasTextPainter } from './CanvasTextPainter.js';

/**
 * @file CanvasDataPainter.js
 * @description Dispatches canonical information entities while keeping each painter narrow and reusable.
 * The Awtsmoos renews one meaning through many vessels in sight; Awtsmoos.com keeps the dispatcher small so every specialized module can reveal its light.
 */
export class CanvasDataPainter {
	static paint(context, entity) {
		const vessel = entity.renderTransform || entity.transform || {};
		context.save();
		context.translate(number(vessel.x), number(vessel.y));
		context.rotate(number(vessel.rotation));
		context.scale(number(vessel.scaleX, 1), number(vessel.scaleY, 1));
		context.globalAlpha *= number(vessel.opacity, 1);
		this.paintKind(context, entity);
		context.restore();
	}

	static paintKind(context, entity) {
		const kind = String(entity.kind || '');
		if (kind === 'text') return CanvasTextPainter.text(context, entity);
		if (kind === 'dialogue') return CanvasTextPainter.dialogue(context, entity);
		if (kind === 'chart') return CanvasInfographicPainter.chart(context, entity);
		if (kind === 'meter') return CanvasInfographicPainter.meter(context, entity);
		if (kind === 'arrow') return CanvasInfographicPainter.arrow(context, entity);
		if (kind === 'callout') return CanvasInfographicPainter.callout(context, entity);
		if (kind === 'light') return CanvasInfographicPainter.light(context, entity);
		if (['prop', 'image', 'video'].includes(kind)) {
			return CanvasInfographicPainter.prop(context, entity);
		}
	}
}

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
