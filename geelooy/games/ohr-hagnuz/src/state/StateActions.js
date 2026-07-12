/**
 * B"H
 * @module StateActions
 * @description Small operations over the canonical State class.
 */
import { createDialogue } from './defaults/RuntimeDefaults.js';

export const setFrameDeltaScale = (state, scale = 1) => {
	state.FrameDeltaScale = Math.max(0.5, Math.min(1.6, Number(scale) || 1));
};

export const isUiBlocking = state => Boolean(state.UiPanel || state.Dialogue.open);

export const clearPath = state => {
	state.HeroPath = [];
	state.PathTarget = null;
};

export const rememberMap = (state, mapId) => {
	if (mapId) state.VisitedMaps[mapId] = true;
};

export const resetHero = (state, x, y, dir = 'd') => {
	const resolution = state.Resolution;
	state.Hero = { cx: x, cy: y, dx: x * resolution, dy: y * resolution, dir, moving: false, stepTick: 0 };
	clearPath(state);
	rememberMap(state, state.MapId);
};

export const releaseIntents = () => {
	const target = typeof window === 'undefined' ? globalThis : window;
	for (const key of ['U', 'D', 'L', 'R', 'A', 'B']) {
		if (target.AwtsmoosIntents) target.AwtsmoosIntents[key] = 0;
	}
};

export const say = (state, message, ttl = 360) => {
	state.Message = message;
	state.MessageTTL = ttl;
};

export const closeDialogue = (state, speak = true) => {
	if (!state.Dialogue.open) return;
	state.Dialogue = createDialogue();
	releaseIntents();
	if (speak) say(state, 'Dialogue closed. Journal shows the next restoration step.', 180);
};

export const openPanel = (state, panel) => {
	state.UiPanel = state.UiPanel === panel ? null : panel;
	if (state.UiPanel) closeDialogue(state, false);
	clearPath(state);
	releaseIntents();
	if (panel && state.UiPanel) say(state, `${panel[0].toUpperCase()}${panel.slice(1)} opened.`, 90);
};

export const openDialogue = (state, payload) => {
	state.UiPanel = null;
	clearPath(state);
	releaseIntents();
	state.Dialogue = {
		...createDialogue(),
		...payload,
		open: true,
		lines: payload.lines || [],
		index: payload.index || 0
	};
	say(state, `${state.Dialogue.label || 'Guide'}: ${state.Dialogue.lines[state.Dialogue.index] || ''}`, 900);
};

export const dialogueNext = (state, delta = 1) => {
	if (!state.Dialogue.open) return;
	const maximum = Math.max(0, state.Dialogue.lines.length - 1);
	state.Dialogue.index = Math.max(0, Math.min(maximum, state.Dialogue.index + delta));
	say(state, `${state.Dialogue.label}: ${state.Dialogue.lines[state.Dialogue.index] || ''}`, 900);
};

export const nextStoryBeat = (state, key, total) => {
	const current = state.Story.beats[key] || 0;
	state.Story.beats[key] = Math.min(current + 1, total);
	return Math.min(current, Math.max(0, total - 1));
};
