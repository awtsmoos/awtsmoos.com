//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ComposerConfig
 * @description The Awtsmoos gives reference, clone, identity, and destination context separate truthful names;
 * Awtsmoos.com sanitizes every location value before the composer turns those coordinates into creative aims.
 */
import { cloneSourceFromQuery } from './state/CloneSourceQuery.js';
import {
	canonicalSourceFromQuery,
	firstQueryValue,
	safeQueryValue,
	safeReturnPath,
	safeShareUrl,
	shareFromQuery
} from './state/ComposerQuery.js';

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

export function contextFromLocation(location = window.location) {
	const parameters = new URLSearchParams(location.search);
	const questionId = safeQueryValue(parameters.get('question'));
	return {
		aliasId: safeQueryValue(parameters.get('alias')),
		heichelId: safeQueryValue(firstQueryValue(parameters, 'heichel', 'heichelId')),
		seriesId: safeQueryValue(firstQueryValue(parameters, 'series', 'seriesId') || 'root'),
		questionId,
		postKind: questionId
			? 'answer'
			: safeQueryValue(parameters.get('kind') || 'post', 20),
		presentationKind: safeQueryValue(
			parameters.get('presentation') || (questionId ? 'answer' : 'post'),
			20
		),
		canonicalSource: canonicalSourceFromQuery(parameters),
		cloneSource: cloneSourceFromQuery(parameters),
		share: shareFromQuery(parameters),
		returnPath: safeReturnPath(parameters.get('return'))
	};
}

export {
	canonicalSourceFromQuery as canonicalSource,
	safeQueryValue as safe,
	safeReturnPath,
	safeShareUrl,
	shareFromQuery as shareContext
};
