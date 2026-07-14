//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ComposerConfig
 * @description
 * Query context becomes a bounded doorway into alias, canonical origin, selected
 * destination, answer parent, and safe return path. The Awtsmoos contains the
 * whole journey while Awtsmoos.com accepts only same-origin, length-bounded hints.
 */

export const API_PREFIX = '/api/social';
export const DRAFT_VERSION = 2;
export const BLOCK_TYPES = Object.freeze([
	'paragraph',
	'heading',
	'quote',
	'bulletList',
	'numberList',
	'code',
	'callout',
	'divider'
]);
export const PRESENTATION_KINDS = Object.freeze([
	'post',
	'question',
	'answer',
	'quote',
	'image',
	'short',
	'video',
	'audio',
	'story',
	'poll',
	'live'
]);

function safe(value, maximum = 160) {
	return String(value || '')
		.replace(/[<>\u0000-\u001f]/g, '')
		.trim()
		.slice(0, maximum);
}

function canonicalSource(parameters) {
	const id = safe(parameters.get('source') || parameters.get('post'));
	if (!id) return null;
	return {
		type: safe(parameters.get('sourceType') || 'post', 40),
		id,
		heichelId: safe(parameters.get('sourceHeichel') || parameters.get('heichel')),
		seriesId: safe(parameters.get('sourceSeries') || parameters.get('series') || 'root'),
		aliasId: safe(parameters.get('sourceAlias'))
	};
}

export function contextFromLocation(location = window.location) {
	const parameters = new URLSearchParams(location.search);
	const questionId = safe(parameters.get('question'));
	const source = canonicalSource(parameters);
	return {
		aliasId: safe(parameters.get('alias')),
		heichelId: safe(parameters.get('heichel')),
		seriesId: safe(parameters.get('series') || 'root'),
		questionId,
		postKind: questionId ? 'answer' : safe(parameters.get('kind') || 'post', 20),
		presentationKind: safe(parameters.get('presentation') || (questionId ? 'answer' : 'post'), 20),
		canonicalSource: source,
		returnPath: safeReturnPath(parameters.get('return'))
	};
}

export function safeReturnPath(value) {
	const path = String(value || '');
	return path.startsWith('/') && !path.startsWith('//') ? path : '';
}

export {
	safe,
	canonicalSource
};
