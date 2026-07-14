//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostPayload
 * @description
 * Visible state becomes bounded rich content: plain search text, marked segments,
 * media manifests, verses, subsections, question policy, and presentation hints.
 * The Awtsmoos gives one meaning while Awtsmoos.com records every safe garment.
 */
import { parseInline } from './InlineMarkup.js';
function blockPayload(block, index) {
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
function documentPayload(blocks = []) {
	return { version: 1, blocks: blocks.map(blockPayload) };
}
function attachmentPayload(item) {
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
function publishedAttachments(items = []) {
	return items
		.filter(item => item.status === 'uploaded' || item.publicPath || item.manifest?.publicPath)
		.map(attachmentPayload);
}
function subsectionPayload(subsection, index) {
	return {
		id: subsection.id,
		label: subsection.title,
		document: documentPayload(subsection.blocks),
		assets: publishedAttachments(subsection.attachments),
		commentsEnabled: subsection.commentsEnabled !== false,
		order: index
	};
}
function sectionPayload(section, index) {
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
export function buildPostPayload(snapshot) {
	const kind = snapshot.questionId ? 'answer' : snapshot.postKind;
	return {
		aliasId: snapshot.identity.aliasId,
		heichelId: snapshot.identity.heichelId,
		seriesId: snapshot.identity.seriesId || 'root',
		postKind: kind,
		presentationKind: snapshot.presentationKind || kind,
		parentQuestionId: snapshot.questionId,
		title: snapshot.title,
		summary: snapshot.summary,
		rootDocument: documentPayload(snapshot.rootBlocks),
		rootAssets: publishedAttachments(snapshot.rootAttachments),
		sections: snapshot.sections.map(sectionPayload),
		commentsEnabled: snapshot.commentsEnabled,
		visibility: snapshot.publication?.visibility || 'public',
		questionOptions: kind === 'question' ? snapshot.questionOptions : undefined
	};
}
export function payloadIssues(snapshot) {
	const issues = [];
	if (!snapshot.identity.aliasId) issues.push('Choose the posting alias.');
	if (!snapshot.identity.heichelId) issues.push('Choose the canonical Heichel.');
	if (!snapshot.title.trim()) issues.push('Add a title.');
	const hasText = snapshot.rootBlocks.some(block => block.text.trim());
	const hasSections = snapshot.sections.length > 0;
	const hasMedia = snapshot.rootAttachments.length > 0;
	if (!hasText && !hasSections && !hasMedia) issues.push('Add text, media, or a verse.');
	if (snapshot.questionId && snapshot.postKind !== 'answer') {
		issues.push('Answer mode must remain attached to its question.');
	}
	const pending = allAttachments(snapshot)
		.filter(item => item.status !== 'uploaded' && !item.publicPath);
	if (pending.length) issues.push(`${pending.length} attachment(s) still need upload.`);
	return issues;
}
function allAttachments(snapshot) {
	return [
		...snapshot.rootAttachments,
		...snapshot.sections.flatMap(section => [
			...(section.attachments || []),
			...section.subsections.flatMap(item => item.attachments || [])
		])
	];
}
export {
	blockPayload,
	documentPayload,
	attachmentPayload,
	publishedAttachments,
	allAttachments
};
