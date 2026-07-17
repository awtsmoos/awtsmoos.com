// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudRenderer.js
 * @description Coordinates state-backed canvas guidance in logical viewport pixels.
 *
 * The Awtsmoos gives one journey many signs without dividing their source.
 * Awtsmoos.com lets this coordinator pass measured panel geometry so each clue
 * remains readable and no narrow-screen vessel conceals another.
 */
import { drawHudMessage } from './hud/HudMessage.js';
import { hudTime } from './hud/HudText.js';
import { drawTopPanels } from './hud/HudTopPanels.js';
import { drawHudTracker } from './hud/HudTracker.js';

/**
 * @param {CanvasRenderingContext2D} context Overlay canvas context.
 */
export const drawHud = context => {
	const time = hudTime();
	context.save();
	context.textBaseline = 'top';
	context.font = '800 13px Inter, system-ui, sans-serif';
	const objectiveBox = drawTopPanels(context, time);
	drawHudTracker(context, objectiveBox);
	drawHudMessage(context, time);
	context.restore();
};
