// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentSchema
 * @description Rich comment sections and bodies built from small normalization primitives.
 */
const {
	array,
	cleanAsset,
	cleanLink,
	first,
	previewForLink,
	text
} = require('./richCommentSchemaPrimitives.js');

function cleanSection(section, index = 0) {
	const item = section && typeof section === 'object'
		? section
		: { content: section };
	const links = array(item.links)
		.map(cleanLink)
		.filter(Boolean)
		.slice(0, 10);
	return {
		id: text(item.id || item.sectionId || `comment_section_${index + 1}`, 120),
		title: text(item.title || item.label || `Section ${index + 1}`, 180),
		content: text(item.content || item.text || item.html || '', 8000),
		html: text(item.html || item.content || item.text || '', 8000),
		assets: array(item.assets)
			.map(cleanAsset)
			.filter(Boolean)
			.slice(0, 20),
		links,
		previews: links.map(previewForLink),
		order: Number.isFinite(Number(item.order)) ? Number(item.order) : index
	};
}

function parseDayuhLoose(value) {
	if (!value) return null;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value) || null;
	} catch {
		return null;
	}
}

function sectionText(sections) {
	return sections
		.map(section => section.content || section.html || '')
		.filter(Boolean)
		.join('\n\n');
}

function normalizeCommentBody(body = {}) {
	const assets = array(body.assets || body.attachments)
		.map(cleanAsset)
		.filter(Boolean)
		.filter(asset => asset.id || asset.publicPath)
		.slice(0, 30);
	const links = array(body.links)
		.map(cleanLink)
		.filter(Boolean)
		.filter(link => link.url || link.postId || link.commentId)
		.slice(0, 16);
	const sections = array(body.sections || body.commentSections)
		.map(cleanSection)
		.filter(section => section.content || section.assets.length || section.links.length)
		.slice(0, 24);
	// The flat body is the shape every reader and renderer consumes. Some
	// composers (the section composer, legacy dayuh clients) deliver the
	// author's words only inside sections[] or dayuh while the flat content
	// field stays empty; those records used to render as an empty card.
	// Promote the authored text into the flat body so a stored comment
	// always carries its words in the canonical field. Sections are kept
	// intact alongside for section-aware renderers.
	let content = text(body.content || body.text || '', 8000);
	if (!content) {
		content = text(sectionText(sections), 8000);
	}
	if (!content) {
		const dayuh = parseDayuhLoose(body.dayuh ?? body.legacyDayuh);
		if (dayuh) {
			content = text(dayuh.content || dayuh.text || '', 8000);
			if (!content) {
				const dayuhSections = array(dayuh.sections || dayuh.commentSections)
					.map(cleanSection)
					.filter(section => section.content || section.assets.length || section.links.length);
				content = text(sectionText(dayuhSections), 8000);
			}
		}
	}
	return {
		content,
		audioNoteText: text(body.audioNoteText || body.transcript || '', 2000),
		verseSection: text(first(body.verseSection, first(body.verseId, 'root')), 100),
		subsectionId: text(first(body.subsectionId, first(body.segmentId, '')), 100),
		parentSectionId: text(body.parentSectionId || body.replyToSectionId || '', 120),
		assets,
		sections,
		links,
		previews: links.map(previewForLink),
		mood: text(body.mood || '', 40)
	};
}

function uniqueCommentUrl(comment) {
	return `/heichelos/${encodeURIComponent(comment.heichelId)}/posts/${encodeURIComponent(comment.postId)}/comments/${encodeURIComponent(comment.id)}`;
}

module.exports = {
	cleanAsset,
	cleanLink,
	cleanSection,
	normalizeCommentBody,
	previewForLink,
	uniqueCommentUrl
};
