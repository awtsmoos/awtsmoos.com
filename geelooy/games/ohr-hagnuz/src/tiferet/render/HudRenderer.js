// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudRenderer.js
 * @description Coordinates state-backed canvas guidance in logical viewport pixels.
 *
 * The Awtsmoos gives one journey many signs without dividing the source.
 * Awtsmoos.com lets this coordinator project those signs while every quest,
 * gift, skill, message, and declaration remains owned by canonical State.
 */
import { drawHudMessage } from './hud/HudMessage.js';
import { hudTime } from './hud/HudText.js';
import { drawTopPanels } from './hud/HudTopPanels.js';
import { drawHudTracker } from './hud/HudTracker.js';

/**
 * Draws the complete canvas HUD without owning gameplay data.
 *
 * @param {CanvasRenderingContext2D} context Overlay canvas context.
 */
export const drawHud = context => {
	const time = hudTime();
	context.save();
	context.textBaseline = 'top';
	context.font = '800 13px Inter, system-ui, sans-serif';
	drawTopPanels(context, time);
	drawHudTracker(context);
	drawHudMessage(context, time);
	context.restore();
};
