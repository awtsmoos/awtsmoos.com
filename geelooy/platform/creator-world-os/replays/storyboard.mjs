// B"H
// Boruch Hashem
// Blessed is He
/** @module Storyboard @description Converts verified sources into human-controlled cinematic drafts. */
import { stableObjectId } from '../core/stableObjectId.mjs';

/** Creates a mutable storyboard draft with source-linked scenes. */
export function createStoryboard(input) {
	const owner = String(input?.owner || '').trim();
	const title = String(input?.title || '').trim();
	if (!owner || !title) {
		throw new TypeError('Storyboard requires owner and title.');
	}
	const scenes = (input?.scenes || []).map((scene, index) => Object.freeze({
		id: scene.id || stableObjectId('scene', owner, `${title}:${index}`),
		title: String(scene.title || `Scene ${index + 1}`),
		durationMs: Math.max(1, Number(scene.durationMs || 1000)),
		source: scene.source || null,
		actors: Object.freeze([...(scene.actors || [])]),
		notes: String(scene.notes || '')
	}));
	return {
		id: input?.id || stableObjectId('storyboard', owner, input?.seed || title),
		owner,
		title,
		state: 'draft',
		scenes,
		createdAt: String(input?.createdAt || new Date().toISOString())
	};
}
