// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudTopPanels.js
 * @description Draws compact state-backed chips, act ribbon, and objective card.
 *
 * The Awtsmoos reveals direction without replacing free movement. Awtsmoos.com
 * places these clues near the edge of the vessel so the overhead world remains
 * the hero of every frame.
 */
import { State } from '../../../binah/State.js';
import { readCanvasViewport } from '../canvas/CanvasViewport.js';
import { HUD_COLORS, drawHudBox } from './HudTheme.js';
import { wrapHudText } from './HudText.js';

export const drawTopPanels = (context, time) => {
	drawChips(context);
	drawActRibbon(context, time);
	drawObjective(context);
};

const drawChips = context => {
	const viewport = readCanvasViewport(context);
	const entries = [
		[`☀ ${State.Stats.light}`, HUD_COLORS.gold, State.Stats.light < 35],
		[`✦ ${State.Stats.sparks}`, HUD_COLORS.cyan, false],
		[`Lv ${State.Stats.level}`, HUD_COLORS.green, false],
		[(State.MapId || '').replace(/_/g, ' '), HUD_COLORS.violet, false]
	];
	let x = 10;
	for (const entry of entries) {
		if (x > viewport.width - 68) break;
		x += drawChip(context, x, entry[0], entry[1], entry[2]);
	}
};

const drawChip = (context, x, text, color, glow) => {
	const viewport = readCanvasViewport(context);
	const width = Math.min(viewport.width * 0.3, Math.max(58, context.measureText(text).width + 20));
	context.save();
	context.shadowColor = glow ? color : 'transparent';
	context.shadowBlur = glow ? 10 : 0;
	drawHudBox(context, { x, y: 10, width, height: 28, radius: 8 });
	context.fillStyle = color;
	context.fillText(text, x + 9, 17);
	context.restore();
	return width + 6;
};

const drawActRibbon = (context, time) => {
	const viewport = readCanvasViewport(context);
	const story = State.Story || {};
	const label = `Act ${story.act || story.chapter || 1}: ${story.active || 'Village of Beginnings'}`;
	const width = Math.min(viewport.width - 84, Math.max(230, context.measureText(label).width + 38));
	const x = (viewport.width - width) / 2;
	context.save();
	context.globalAlpha = 0.92;
	context.shadowColor = '#fff176';
	context.shadowBlur = 5 + Math.sin(time * 4) * 2;
	drawHudBox(context, { x, y: 45, width, height: 30, radius: 10, fill: 'rgba(8,10,24,.84)' });
	context.shadowBlur = 0;
	context.fillStyle = HUD_COLORS.gold;
	context.font = '850 13px Inter, system-ui, sans-serif';
	context.textAlign = 'center';
	context.fillText(label, viewport.width / 2, 53);
	context.restore();
};

const drawObjective = context => {
	const viewport = readCanvasViewport(context);
	const story = State.Story || {};
	const width = Math.min(284, viewport.width - 20);
	const lines = [
		`Region: ${story.region || State.MapId || 'Unknown'}`,
		`Goal: ${story.objective || 'Find the next restoration.'}`,
		`Next: ${story.nextStep || 'Open Journal.'}`
	].flatMap(line => wrapHudText(context, line, width - 18, 2));
	context.save();
	context.font = '750 11px Inter, system-ui, sans-serif';
	drawHudBox(context, { x: 10, y: 84, width, height: 18 + lines.length * 14, radius: 12, fill: HUD_COLORS.deep });
	lines.forEach((line, index) => {
		context.fillStyle = index === 0 ? HUD_COLORS.cyan : HUD_COLORS.white;
		context.fillText(line, 19, 93 + index * 14);
	});
	context.restore();
};
