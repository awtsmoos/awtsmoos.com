//B"H
//Boruch Hashem
//Blessed is He

import { parseInline } from './InlineMarkup.js';

/**
 * @module PostPayloadParts
 * @description
 * The Awtsmoos lets blocks, attachments, verses, and subsections become bounded payload fragments;
 * Awtsmoos.com keeps this transformation separate so the final post covenant remains short and legible.
 */
export function blockPayload(block, index) {
	return {
		id: block.id,
		type: block.type,
		text: String(block.text || ''),
		segments: parseInline(block.text),
		level: block.type === 'heading' ? 2 : undefined,
		language: block.type === 'code' ? 'text' : undefined,
		order: index
	};
}

export function documentPayload(blocks = []) {
	return {
		version: 1,
		blocks: blocks.map(blockPayload)
	};
}

export function attachmentPayload(item) {
	const manifest = item.manifest || item;
	return {
		id: manifest.id || item.id,
		type: manifest.type || item.type,
		mime: manifest.mime || item.mime,
		publicPath: manifest.publicPath || item.publicPath || '',
		alt: item.alt || '',
		caption: item.caption || '',
		role: item.role || 'inline',
		width: item.width,
		height: item.height,
		duration: item.duration,
		size: manifest.size || item.size
	};
}

export function publishedAttachments(items = []) {
	return items
		.filter(item =>
			item.status === 'uploaded'
			|| item.publicPath
			|| item.manifest?.publicPath
		)
		.map(attachmentPayload);
}

export function subsectionPayload(subsection, index) {
	return {
		id: subsection.id,
		label: subsection.title,
		document: documentPayload(subsection.blocks),
		assets: publishedAttachments(subsection.attachments),
		commentsEnabled: subsection.commentsEnabled !== false,
		order: index
	};
}

export function sectionPayload(section, index) {
	return {
		id: section.id,
		verseSection: section.id,
		title: section.title,
		document: documentPayload(section.blocks),
		assets: publishedAttachments(section.attachments),
		subsections: (section.subsections || []).map(subsectionPayload),
		commentsEnabled: section.commentsEnabled !== false,
		order: index
	};
}

export function allAttachments(snapshot) {
	return [
		...snapshot.rootAttachments,
		...snapshot.sections.flatMap(section => [
			...(section.attachments || []),
			...section.subsections.flatMap(item => item.attachments || [])
		])
	];
}
