// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudMessage.js
 * @description Projects the canonical transient message inside logical bounds.
 *
 * A sentence arrives, shines, and passes, while the Awtsmoos renews speaker,
 * listener, and world. Awtsmoos.com lets this message remain readable without
 * becoming a second state system or covering the overhead journey.
 */
import { State } from '../../../binah/State.js';
import { readCanvasViewport } from '../canvas/CanvasViewport.js';
import { HUD_COLORS, drawHudBox } from './HudTheme.js';
import { wrapHudText } from './HudText.js';

/**
 * @param {CanvasRenderingContext2D} context Overlay canvas context.
 * @param {number} time Current animation time in seconds.
 */
export const drawHudMessage = (context, time) => {
	if (State.MessageTTL <= 0 || !State.Message) return;
	const viewport = readCanvasViewport(context);
	const maximumWidth = Math.min(viewport.width - 54, 390);
	context.save();
	context.font = '850 13px Inter, system-ui, sans-serif';
	const lines = wrapHudText(context, State.Message, maximumWidth - 34, 3);
	const height = 28 + lines.length * 17;
	const x = (viewport.width - maximumWidth) / 2;
	const animatedY = viewport.height * 0.62 + Math.sin(time * 3) * 2;
	const y = Math.min(viewport.height - 246, Math.max(188, animatedY));
	context.shadowColor = '#ffd966';
	context.shadowBlur = 8;
	drawHudBox(context, {
		x,
		y,
		width: maximumWidth,
		height,
		radius: 13,
		fill: 'rgba(3,5,12,.9)'
	});
	context.shadowBlur = 0;
	context.fillStyle = HUD_COLORS.gold;
	context.textAlign = 'center';
	lines.forEach((line, index) => {
		context.fillText(line, viewport.width / 2, y + 13 + index * 17);
	});
	context.restore();
};
