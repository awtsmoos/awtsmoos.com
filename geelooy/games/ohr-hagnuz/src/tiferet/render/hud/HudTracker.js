// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudTracker.js
 * @description Projects gifts, declaration, Musag, and skill progress from State.
 *
 * The Awtsmoos hides no second ledger behind the screen. Awtsmoos.com reads the
 * one canonical state and lets this small vessel report progress without owning
 * or mutating any quest, inventory, or reward.
 */
import { State } from '../../../binah/State.js';
import { readCanvasViewport } from '../canvas/CanvasViewport.js';
import { HUD_COLORS, drawHudBox } from './HudTheme.js';

export const drawHudTracker = context => {
	const viewport = readCanvasViewport(context);
	const width = Math.min(174, viewport.width * 0.42);
	const x = viewport.width - width - 10;
	const rows = trackerRows();
	context.save();
	context.font = '800 11px Inter, system-ui, sans-serif';
	drawHudBox(context, {
		x,
		y: 84,
		width,
		height: 92,
		radius: 12,
		fill: HUD_COLORS.deep
	});
	rows.forEach((row, index) => drawRow(context, x, 92 + index * 20, row));
	context.restore();
};

const trackerRows = () => {
	const gift = giftSummary();
	const declaration = declarationSummary();
	const musag = State.MusagDex || {};
	return [
		['Gifts', gift.text, gift.complete ? HUD_COLORS.green : HUD_COLORS.gold],
		['Declaration', declaration.text, declaration.ready ? HUD_COLORS.green : HUD_COLORS.red],
		['Musag', `${musag.sweetenedCount || 0}/${musag.seenCount || 0} sweetened`, HUD_COLORS.cyan],
		['Skill', bestSkill(), HUD_COLORS.violet]
	];
};

const drawRow = (context, x, y, row) => {
	context.fillStyle = HUD_COLORS.white;
	context.fillText(`${row[0]}:`, x + 8, y);
	context.fillStyle = row[2];
	context.fillText(String(row[1]), x + 68, y);
};

const giftSummary = () => {
	const names = ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim'];
	const given = State.Gifts?.given || {};
	const count = names.filter(id => (given[id] || 0) > 0).length;
	return {
		text: `${count}/5 restored`,
		complete: count >= 5
	};
};

const declarationSummary = () => {
	const declaration = State.Gifts?.declaration || {};
	const unlocked = declaration.unlocked?.length || 0;
	const total = declaration.total || 6;
	const ready = declaration.ready || unlocked >= total;
	return {
		text: ready ? 'ready' : `${unlocked}/${total} lines`,
		ready
	};
};

const bestSkill = () => {
	const entries = Object.values(State.Skills || {});
	if (!entries.length) return 'Learning 1';
	const top = entries.reduce((best, candidate) => {
		return (candidate.level || 1) > (best.level || 1) ? candidate : best;
	}, entries[0]);
	return `${top.name} ${top.level || 1}`;
};
