// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostModel
 * @description
 * The Awtsmoos translates real feed objects into visible provenance without
 * changing their source. Every Awtsmoos.com model keeps the untouched raw object.
 */
import { detectArchetype, extractSpecialFields } from './specialFields.js';
import {
	chooseSourceKind,
	interactionCounts,
	sourceColor,
	sourceIcon,
	sourceLabel
} from './sourceMetadata.js';
import { cleanText, safeHref, safeImage, text } from './modelValues.js';

/**
 * Builds a conservative presentation model from one real feed object.
 *
 * @param {object} object - Normalized feed object with raw source data.
 * @returns {object} Provenance-rich card model.
 */
export function createPostModel(object) {
	const raw = object.raw || {};
	const special = extractSpecialFields(raw);
	const alias = text(raw.aliasId, raw.authorAlias, object.author);
	const heichelId = text(raw.heichelId, raw.parentHeichelId);
	const seriesId = text(raw.seriesId);
	const sourceKind = chooseSourceKind(object, raw, special);

	return {
		id: text(object.id, raw.id, raw.postId, 'unknown'),
		type: text(object.type, raw.type, 'post'),
		href: safeHref(object.href),
		title: text(object.title, raw.title, 'Untitled post'),
		body: cleanText(object.summary || raw.content || raw.body || raw.description),
		raw,
		alias,
		authorName: text(
			raw.authorName,
			raw.displayName,
			object.author,
			alias,
			'Geelooy member'
		),
		avatar: safeImage(raw.avatar || raw.profilePicture || raw.authorAvatar),
		verified: raw.verified === true || raw.isVerified === true,
		role: text(raw.role, raw.authorRole),
		timestamp: text(raw.timestamp, raw.createdAt, raw.date),
		visibility: text(raw.visibility, raw.public === false ? 'Restricted' : 'Public'),
		heichelId,
		heichelName: text(raw.heichelName, raw.communityName, heichelId),
		seriesId,
		seriesName: text(raw.seriesName, seriesId),
		sourceKind,
		sourceLabel: sourceLabel(sourceKind, raw),
		sourceColor: sourceColor(sourceKind),
		sourceIcon: sourceIcon(sourceKind),
		interactions: interactionCounts(raw),
		special,
		archetype: detectArchetype(special, raw)
	};
}
