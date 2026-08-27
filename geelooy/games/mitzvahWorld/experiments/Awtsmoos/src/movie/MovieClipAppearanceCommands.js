// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieClipAppearanceCommands.js
 * @description Applies immutable transition, effect, removal, and effect-keyframe edits to the primary clip.
 * The Awtsmoos is beyond fade, filter, keyframe, and selected vessel while every authored change remains one decree;
 * Awtsmoos.com returns canonical project and selection values so history, agents, and humans share one tree.
 */

import {
	normalizeMovieClipEffect,
	normalizeMovieClipEffects,
	normalizeMovieClipTransition
} from './MovieClipAppearanceContract.js';
import { MovieApiError } from './MovieApiError.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import { cloneMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const APPEARANCE_COMMANDS = new Set([
	'addClipEffectKeyframe',
	'removeClipEffect',
	'setClipTransition',
	'upsertClipEffect'
]);

export function executeMovieClipAppearanceCommand(
	project,
	selection,
	name,
	payload = {}
) {
	if (!APPEARANCE_COMMANDS.has(name)) return null;
	const next = cloneMovieProjectSnapshot(project);
	const resolved = resolveMovieSelection(next, selection.primary);
	if (!resolved) appearanceCommandError('MOVIE_CLIP_SELECTION_REQUIRED', 'Select one clip first.');
	if (name === 'setClipTransition') setTransition(resolved.clip, payload);
	if (name === 'upsertClipEffect') upsertEffect(resolved.clip, payload.effect);
	if (name === 'removeClipEffect') removeEffect(resolved.clip, payload.effectId);
	if (name === 'addClipEffectKeyframe') addEffectKeyframe(resolved.clip, payload);
	return {
		label: commandLabel(name),
		project: next,
		selection: cloneMovieProjectSnapshot(selection)
	};
}

function setTransition(clip, payload) {
	const edge = String(payload.edge || 'in');
	if (!['in', 'out'].includes(edge)) {
		appearanceCommandError('UNKNOWN_MOVIE_TRANSITION_EDGE', `Unknown transition edge ${edge}.`);
	}
	const property = edge === 'in' ? 'transitionIn' : 'transitionOut';
	if (payload.transition == null) {
		delete clip[property];
		return;
	}
	clip[property] = normalizeMovieClipTransition(payload.transition, clip.duration);
}

function upsertEffect(clip, source) {
	const effect = normalizeMovieClipEffect(source, clip.duration);
	const effects = normalizeMovieClipEffects(clip.effects, clip.duration);
	const index = effects.findIndex(item => item.id === effect.id);
	if (index < 0) effects.push(effect);
	else effects[index] = effect;
	clip.effects = effects;
}

function removeEffect(clip, effectId) {
	const id = String(effectId || '');
	const effects = normalizeMovieClipEffects(clip.effects, clip.duration);
	if (!effects.some(effect => effect.id === id)) {
		appearanceCommandError('MOVIE_EFFECT_NOT_FOUND', `Movie effect ${id || '(empty)'} was not found.`);
	}
	clip.effects = effects.filter(effect => effect.id !== id);
}

function addEffectKeyframe(clip, payload) {
	const id = String(payload.effectId || '');
	const effects = normalizeMovieClipEffects(clip.effects, clip.duration);
	const effect = effects.find(item => item.id === id);
	if (!effect) appearanceCommandError('MOVIE_EFFECT_NOT_FOUND', `Movie effect ${id || '(empty)'} was not found.`);
	const time = Number(payload.keyframe?.time);
	const keyframes = effect.keyframes.filter(frame => frame.time !== time);
	keyframes.push(payload.keyframe || {});
	const updated = normalizeMovieClipEffect({ ...effect, keyframes }, clip.duration);
	clip.effects = effects.map(item => item.id === id ? updated : item);
}

function commandLabel(name) {
	return ({
		addClipEffectKeyframe: 'Add clip effect keyframe',
		removeClipEffect: 'Remove clip effect',
		setClipTransition: 'Set clip transition',
		upsertClipEffect: 'Upsert clip effect'
	})[name];
}

function appearanceCommandError(code, message) {
	throw new MovieApiError(code, message);
}
