//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RichDocumentView
 * @description
 * Preview renders only elements created by code and text nodes supplied by the
 * writer. Awtsmoos.com reveals emphasis, lists, code, and media without ever
 * pouring arbitrary HTML into the visible vessel of the Awtsmoos.
 */
const ELEMENTS = Object.freeze({
	paragraph: 'p',
	heading: 'h2',
	quote: 'blockquote',
	bulletList: 'p',
	numberList: 'p',
	code: 'pre',
	callout: 'aside',
	divider: 'hr'
});
export function renderDocument(container, richDocument) {
	for (const block of richDocument?.blocks || []) {
		container.append(documentElement(block));
	}
}
export function renderAttachments(container, attachments = []) {
	if (!attachments.length) return;
	const gallery = document.createElement('div');
	gallery.className = 'previewMedia';
	for (const attachment of attachments) gallery.append(mediaElement(attachment));
	container.append(gallery);
}
function documentElement(block) {
	const tag = ELEMENTS[block.type] || 'p';
	const element = document.createElement(tag);
	if (block.type === 'divider') return element;
	if (block.type === 'code') {
		const code = document.createElement('code');
		code.textContent = block.text || segmentsText(block.segments);
		element.append(code);
		return element;
	}
	const segments = block.segments?.length
		? block.segments
		: [{ text: block.text || '', marks: [] }];
	for (const segment of segments) element.append(segmentNode(segment));
	if (block.type === 'bulletList') element.classList.add('bulletLine');
	if (block.type === 'numberList') element.classList.add('numberLine');
	return element;
}
function segmentNode(segment) {
	let node = document.createTextNode(segment.text || '');
	for (const mark of segment.marks || []) {
		const wrapper = markWrapper(mark);
		if (!wrapper) continue;
		wrapper.append(node);
		node = wrapper;
	}
	return node;
}
function markWrapper(mark) {
	const tags = {
		bold: 'strong',
		italic: 'em',
		underline: 'u',
		strike: 's',
		code: 'code'
	};
	if (tags[mark.type]) return document.createElement(tags[mark.type]);
	if (mark.type !== 'link') return null;
	const href = safeHref(mark.href);
	if (!href) return null;
	const anchor = document.createElement('a');
	anchor.href = href;
	anchor.rel = 'noopener noreferrer';
	return anchor;
}
function safeHref(value) {
	const href = String(value || '');
	if (href.startsWith('/') && !href.startsWith('//')) return href;
	try {
		const parsed = new URL(href);
		return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
	} catch {
		return '';
	}
}
function mediaElement(attachment) {
	const source = attachment.publicPath || attachment.manifest?.publicPath || attachment.localUrl || '';
	const figure = document.createElement('figure');
	let media;
	if (attachment.type === 'image' || attachment.type === 'gif') {
		media = document.createElement('img');
		media.alt = attachment.alt || '';
	} else if (attachment.type === 'audio') {
		media = document.createElement('audio');
		media.controls = true;
	} else if (attachment.type === 'video') {
		media = document.createElement('video');
		media.controls = true;
	} else {
		media = document.createElement('a');
		media.textContent = attachment.name || 'Open document';
		media.href = source;
	}
	if ('src' in media) media.src = source;
	figure.append(media);
	if (attachment.caption) {
		const caption = document.createElement('figcaption');
		caption.textContent = attachment.caption;
		figure.append(caption);
	}
	return figure;
}
function segmentsText(segments = []) {
	return segments.map(segment => segment.text).join('');
}
