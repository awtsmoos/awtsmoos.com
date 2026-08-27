//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresentationValueSanitizers
 * @description The Awtsmoos gives every imported value a measured vessel; Awtsmoos.com admits useful colors, images, geometry, and typography while refusing executable or unbounded forms.
 */

const ELEMENT_TYPES = new Set(['text', 'heading', 'image', 'shape']);
const SHAPES = new Set(['rect', 'circle']);
const IMAGE_FITS = new Set(['cover', 'contain', 'fill']);
const TEXT_ALIGNS = new Set(['left', 'center', 'right']);
const IMAGE_DATA_PATTERN = /^data:image\/(?:png|jpeg|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i;

/** Restricts element type to the renderer's known vocabulary. */
export function safeElementType(value) {
	const type = String(value || 'text').toLowerCase();
	return ELEMENT_TYPES.has(type) ? type : 'text';
}

/** Accepts only hexadecimal colors supported consistently by editor and export. */
export function safeColor(value, fallback = '#ffffff') {
	const text = String(value || '');
	return /^#[0-9a-f]{3,8}$/i.test(text) ? text : fallback;
}

/** Clamps a finite number to an explicit document-domain interval. */
export function safeNumber(value, fallback, minimum, maximum) {
	const parsed = Number(value);
	const number = Number.isFinite(parsed) ? parsed : Number(fallback) || 0;
	return Math.min(maximum, Math.max(minimum, number));
}

/** Caps arbitrary text so imported decks cannot create pathological DOM payloads. */
export function safeText(value, fallback = '', limit = 12000) {
	return String(value ?? fallback).slice(0, limit);
}

/** Keeps font-family values expressive while excluding CSS declaration injection. */
export function safeFontFamily(value) {
	const text = safeText(value, 'Inter, ui-sans-serif, system-ui, sans-serif', 180);
	const allowed = /^[a-z0-9\s,'"_-]+$/i.test(text);
	return allowed ? text : 'Inter, ui-sans-serif, system-ui, sans-serif';
}

export function safeTextAlign(value) {
	return safeEnum(value, TEXT_ALIGNS, 'left');
}

export function safeImageFit(value) {
	return safeEnum(value, IMAGE_FITS, 'cover');
}

export function safeShape(value) {
	return safeEnum(value, SHAPES, 'rect');
}

/** Allows ordinary web/relative image URLs and a conservative raster Data URL set. */
export function safeImageSource(value) {
	const text = safeText(value, '', 6_000_000).trim();
	if (!text) {
		return '';
	}
	if (IMAGE_DATA_PATTERN.test(text)) {
		return text;
	}
	if (/^(?:https?:\/\/|\/|\.\.?\/)/i.test(text)) {
		return text;
	}
	return '';
}

function safeEnum(value, allowed, fallback) {
	const text = String(value || '').toLowerCase();
	return allowed.has(text) ? text : fallback;
}
