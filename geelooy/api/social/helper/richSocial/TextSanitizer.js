//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TextSanitizer
 * @description
 * Rich expression enters through a bounded document rather than arbitrary HTML.
 * Awtsmoos.com preserves headings, quotations, lists, code, links, and emphasis
 * while Gevurah removes scripts and malformed light from the vessel of Malchus.
 */
const BLOCK_TYPES = Object.freeze([
	'paragraph',
	'heading',
	'quote',
	'bulletList',
	'numberList',
	'code',
	'callout',
	'divider'
]);
const MARK_TYPES = Object.freeze(['bold', 'italic', 'underline', 'strike', 'code', 'link']);

function cleanText(value, maximum = 12000) {
	return String(value || '')
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
		.replace(/[<>]/g, '')
		.replace(/\r\n?/g, '\n')
		.trim()
		.slice(0, maximum);
}
function cleanUrl(value) {
	const url = cleanText(value, 1200);
	if (!url) return '';
	if (url.startsWith('/') && !url.startsWith('//')) return url;
	try {
		const parsed = new URL(url);
		return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
	} catch {
		return '';
	}
}
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
function normalizeMark(mark) {
	const item = typeof mark === 'string' ? { type: mark } : (mark || {});
	const type = MARK_TYPES.includes(item.type) ? item.type : '';
	if (!type) return null;
	if (type !== 'link') return { type };
	const href = cleanUrl(item.href || item.url);
	return href ? { type, href } : null;
}
function normalizeSegment(segment) {
	const item = typeof segment === 'string' ? { text: segment } : (segment || {});
	const text = cleanText(item.text || item.content, 4000);
	if (!text) return null;
	return {
		text,
		marks: parseArray(item.marks).map(normalizeMark).filter(Boolean).slice(0, 8)
	};
}
function normalizeBlock(block, index) {
	const item = typeof block === 'string' ? { type: 'paragraph', text: block } : (block || {});
	const type = BLOCK_TYPES.includes(item.type) ? item.type : 'paragraph';
	const segments = parseArray(item.segments).map(normalizeSegment).filter(Boolean).slice(0, 100);
	const text = cleanText(item.text || item.content, 12000);
	if (type !== 'divider' && !text && !segments.length) return null;
	return {
		id: cleanText(item.id || `block_${index + 1}`, 100),
		type,
		text,
		segments,
		level: type === 'heading' ? Math.max(2, Math.min(4, Number(item.level) || 2)) : undefined,
		language: type === 'code' ? cleanText(item.language, 40) : undefined,
		order: index
	};
}
function normalizeDocument(value) {
	let raw = value;
	if (typeof value === 'string') {
		try {
			raw = JSON.parse(value);
		} catch {
			raw = [{ type: 'paragraph', text: value }];
		}
	}
	const blocks = Array.isArray(raw) ? raw : parseArray(raw?.blocks);
	return {
		version: 1,
		blocks: blocks.map(normalizeBlock).filter(Boolean).slice(0, 80)
	};
}
function documentToText(document) {
	return (document?.blocks || [])
		.map(block => block.segments?.length
			? block.segments.map(segment => segment.text).join('')
			: block.text)
		.filter(Boolean)
		.join('\n\n')
		.slice(0, 24000);
}

module.exports = {
	BLOCK_TYPES,
	MARK_TYPES,
	cleanText,
	cleanUrl,
	normalizeDocument,
	documentToText
};
