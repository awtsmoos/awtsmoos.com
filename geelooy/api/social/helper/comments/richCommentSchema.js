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
	return {
		content: text(body.content || body.text || '', 8000),
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
