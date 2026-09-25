//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SemanticNaming
 * @description Suggests human file names from machine file names, dependency-free.
 * A name like IMG_20240920_153012.jpg carries a date but no meaning; Awtsmoos.com
 * turns the date into a readable slug and leaves the final word to the person.
 * Upgrade path (not built): replace suggestSemanticName with an AI-assisted
 * version behind the same signature; applySemanticName and the UI need no changes.
 */
import { updateMetadata } from './entryMetadata.js';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MAX_SLUG = 80;
const MACHINE_PATTERNS = [
	/^(IMG|PXL|DSC|DSCN|VID|MVIMG|Screenshot|Screen[ _]Shot)[_\s-]*\d/i,
	/^IMG-\d{8}-WA\d+/i,
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
	/^(image|photo|pasted)[\s(_-]*\d+/i
];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic', 'avif', 'bmp'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'mkv', 'avi'];

/**
 * Suggests one human-readable file name, preserving the original extension.
 * Machine names become "<kind>-<mon>-<year>.<ext>" (e.g. photo-sep-2024.jpg);
 * a contextHint becomes the slug basis ("sunset overlook" -> sunset-overlook-sep-2024.jpg).
 * Human names are slugified as-is. Folders get no extension.
 */
export function suggestSemanticName(entry = {}, contextHint = '') {
	const rawName = String(entry?.name || entry?.path || '').split('/').filter(Boolean).pop() || '';
	const { base, extension } = splitName(rawName);
	const hint = slugify(contextHint);
	const date = dateSuffix(entry, rawName);
	if (hint) return joinName(`${hint}${date}`, extension);
	if (isMachineName(base)) return joinName(`${kindWord(entry, extension)}${date}`, extension);
	return joinName(slugify(base) || 'file', extension);
}

/** Applies a human name through the single metadata write path. */
export function applySemanticName(entry, name, options = {}) {
	return updateMetadata(entry, { semanticName: String(name || '').trim() }, options);
}

/** Splits "archive.tar.gz" -> base "archive.tar", extension "gz". */
function splitName(name) {
	const leaf = String(name || '');
	if (leaf.startsWith('.') && leaf.indexOf('.', 1) === -1) return { base: leaf, extension: '' };
	const dot = leaf.lastIndexOf('.');
	if (dot <= 0) return { base: leaf, extension: '' };
	return { base: leaf.slice(0, dot), extension: leaf.slice(dot + 1).toLowerCase() };
}

function joinName(slug, extension) {
	return extension ? `${slug}.${extension}` : slug;
}

/** Lowercase ASCII slug; diacritics stripped, runs collapsed, bounded. */
export function slugify(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-')
		.slice(0, MAX_SLUG)
		.replace(/-+$/g, '');
}

function isMachineName(base) {
	return MACHINE_PATTERNS.some(pattern => pattern.test(base));
}

function kindWord(entry, extension) {
	const mime = String(entry?.mimeType || entry?.mime || '').toLowerCase();
	if (mime.startsWith('image/')) return 'photo';
	if (mime.startsWith('video/')) return 'video';
	if (mime.startsWith('audio/')) return 'audio';
	if (IMAGE_EXTENSIONS.includes(extension)) return 'photo';
	if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
	return 'file';
}

/** "-sep-2024" from a filename date, else from createdAt/updatedAt, else "". */
function dateSuffix(entry, rawName) {
	const match = String(rawName || '').match(/((?:19|20)\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
	let year = '';
	let month = 0;
	if (match) {
		year = match[1];
		month = Number(match[2]);
	} else {
		const stamp = entry?.createdAt || entry?.updatedAt;
		if (!stamp) return '';
		const date = new Date(stamp);
		if (Number.isNaN(date.getTime())) return '';
		year = String(date.getUTCFullYear());
		month = date.getUTCMonth() + 1;
	}
	if (month < 1 || month > 12) return '';
	return `-${MONTHS[month - 1]}-${year}`;
}
