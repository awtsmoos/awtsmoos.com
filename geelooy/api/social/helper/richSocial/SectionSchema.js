//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SectionSchema
 * @description
 * A long post may unfold as verses and subsections without losing stable comment
 * coordinates. Awtsmoos.com preserves each ordered vessel while the Awtsmoos-
 * given meaning remains addressable at root, verse, and subsection depth.
 */

const { cleanText, normalizeDocument, documentToText } = require('./TextSanitizer.js');
const { normalizeAttachments } = require('./AttachmentSchema.js');

function parseArray(value) {
	if (Array.isArray(value)) return value;
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function stableId(value, prefix, index) {
	const cleaned = cleanText(value, 100)
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return cleaned || `${prefix}_${index + 1}`;
}

function normalizeSubsection(value, index = 0) {
	const item = value && typeof value === 'object' ? value : { document: value };
	const document = normalizeDocument(item.document || item.richDocument || item.content || item.text);
	const id = stableId(item.id || item.subsectionId, 'subsection', index);
	return {
		id,
		label: cleanText(item.label || item.title || `Subsection ${index + 1}`, 200),
		content: documentToText(document),
		html: '',
		assets: normalizeAttachments(item.assets, 12),
		order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
		options: {
			richSocialVersion: 1,
			richDocument: document,
			commentsEnabled: item.commentsEnabled !== false && item.commentsEnabled !== 'false'
		}
	};
}

function normalizeSection(value, index = 0) {
	const item = value && typeof value === 'object' ? value : { document: value };
	const document = normalizeDocument(item.document || item.richDocument || item.content || item.text);
	const id = stableId(item.id || item.verseSection || item.verseId, 'verse', index);
	const subsections = parseArray(item.subsections || item.segments)
		.map(normalizeSubsection)
		.filter(subsection => subsection.content || subsection.assets.length)
		.slice(0, 16);
	return {
		id,
		verseSection: id,
		title: cleanText(item.title || item.label || `Verse ${index + 1}`, 220),
		content: documentToText(document),
		html: '',
		assets: normalizeAttachments(item.assets, 16),
		segments: subsections,
		segmentType: cleanText(item.segmentType || 'verse', 60),
		order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
		options: {
			richSocialVersion: 1,
			richDocument: document,
			commentsEnabled: item.commentsEnabled !== false && item.commentsEnabled !== 'false'
		}
	};
}

function normalizeSections(value) {
	return parseArray(value)
		.map(normalizeSection)
		.filter(section => section.content || section.assets.length || section.segments.length)
		.slice(0, 24)
		.sort((left, right) => left.order - right.order);
}

module.exports = {
	stableId,
	normalizeSubsection,
	normalizeSection,
	normalizeSections
};
