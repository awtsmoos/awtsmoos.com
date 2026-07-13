//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stat sliders vessel in this instant, revealing
 * its focused js render ui service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bar } from './panels.js';
import { generatorMetrics } from './generatorMetrics.js';

/**
 * B"H � Draws the mockup's stat sliders with pure canvas. Every slider is
 * generated from real fighter DNA, so the panel is an instrument, not paint.
 */
export function drawStatSliders(ctx, fighter, x, y, w) {
	const metrics = generatorMetrics(fighter);
	ctx.font = '11px system-ui';
	for (let i = 0; i < metrics.length; i++) {
		const m = metrics[i];
		const yy = y + i * 18;
		ctx.fillStyle = '#ddd4bb';
		ctx.fillText(m.label, x, yy + 4);
		bar(ctx, x + 82, yy, w - 92, Math.max(0, Math.min(1, m.unit)), '#e9cf72');
		ctx.fillStyle = '#fff7d0';
		ctx.beginPath();
		ctx.arc(x + 82 + (w - 92) * Math.max(0, Math.min(1, m.unit)), yy + 2.5, 4, 0, Math.PI * 2);
		ctx.fill();
	}
}
