//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AttachmentSchema
 * @description
 * Images, audio, video, and documents become bounded references to native asset
 * manifests. Awtsmoos.com receives expressive Chesed only through a Gevurah vessel
 * that refuses executable URLs, unbounded lists, and ambiguous attachment kinds.
 */

const { cleanText, cleanUrl } = require('./TextSanitizer.js');

const ATTACHMENT_TYPES = Object.freeze(['image', 'audio', 'video', 'gif', 'document']);
const ATTACHMENT_ROLES = Object.freeze(['cover', 'inline', 'gallery', 'audio-note', 'video', 'download']);

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

function inferType(item) {
	const explicit = cleanText(item.type || item.kind, 24).toLowerCase();
	if (ATTACHMENT_TYPES.includes(explicit)) return explicit;
	const mime = cleanText(item.mime, 100).toLowerCase();
	if (mime === 'image/gif') return 'gif';
	if (mime.startsWith('image/')) return 'image';
	if (mime.startsWith('audio/')) return 'audio';
	if (mime.startsWith('video/')) return 'video';
	return 'document';
}

function normalizeNumber(value, maximum) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric < 0) return undefined;
	return Math.min(maximum, numeric);
}

function normalizeAttachment(value, index = 0) {
	const item = typeof value === 'string' ? { id: value } : (value || {});
	const id = cleanText(item.id || item.assetId, 160);
	const publicPath = cleanUrl(item.publicPath || item.url);
	if (!id && !publicPath) return null;
	const type = inferType(item);
	const role = ATTACHMENT_ROLES.includes(item.role)
		? item.role
		: type === 'audio'
			? 'audio-note'
			: type === 'video'
				? 'video'
				: 'inline';
	return {
		id: id || `external_${index + 1}`,
		type,
		mime: cleanText(item.mime, 100),
		publicPath,
		alt: cleanText(item.alt || item.title, 240),
		caption: cleanText(item.caption, 600),
		role,
		width: normalizeNumber(item.width, 20000),
		height: normalizeNumber(item.height, 20000),
		duration: normalizeNumber(item.duration, 86400),
		size: normalizeNumber(item.size, 1024 * 1024 * 1024),
		order: index
	};
}

function normalizeAttachments(value, maximum = 20) {
	return parseArray(value)
		.map(normalizeAttachment)
		.filter(Boolean)
		.slice(0, maximum);
}

function attachmentSummary(attachments = []) {
	return attachments.reduce((summary, attachment) => {
		summary.total += 1;
		summary[attachment.type] = (summary[attachment.type] || 0) + 1;
		return summary;
	}, { total: 0 });
}

module.exports = {
	ATTACHMENT_TYPES,
	ATTACHMENT_ROLES,
	normalizeAttachment,
	normalizeAttachments,
	attachmentSummary
};
