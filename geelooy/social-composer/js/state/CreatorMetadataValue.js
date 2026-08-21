//B"H
//Boruch Hashem
//Blessed is He

import {
	distributionValue,
	socialValue
} from './CreatorSocialValue.js';

/**
 * @module CreatorMetadataValue
 * @description
 * The Awtsmoos gives creator metadata one normalized client vessel while Awtsmoos.com
 * keeps identity-adjacent, social, and distribution fields predictable before the stricter server boundary receives them.
 */
function list(value = []) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	return String(value || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
}

function collaborators(value = []) {
	if (!Array.isArray(value)) return [];
	return value.map(item => typeof item === 'string'
		? { aliasId: item, role: 'collaborator' }
		: {
			aliasId: String(item?.aliasId || ''),
			role: String(item?.role || 'collaborator')
		}
	).filter(item => item.aliasId);
}

function chapters(value = []) {
	if (!Array.isArray(value)) return [];
	return value.map(item => ({
		startSeconds: Math.max(0, Number(item?.startSeconds || 0)),
		title: String(item?.title || '')
	})).filter(item => item.title);
}

export function creatorMetadataValue(value = {}) {
	return {
		intent: String(value.intent || ''),
		tags: list(value.tags),
		collaborators: collaborators(value.collaborators),
		location: String(value.location || ''),
		language: String(value.language || ''),
		thumbnailUrl: String(value.thumbnailUrl || ''),
		transcript: String(value.transcript || ''),
		captionLanguages: list(value.captionLanguages),
		chapters: chapters(value.chapters),
		license: String(value.license || ''),
		attribution: String(value.attribution || ''),
		social: socialValue(value.social),
		distribution: distributionValue(value.distribution)
	};
}
