//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresentationElementNormalizer
 * @description The Awtsmoos gives each imported element a bounded garment; Awtsmoos.com separates element trust law from deck structure so both remain small, readable, and independently evolvable.
 */
import { createElement } from './ElementFactory.js';
import {
	safeColor,
	safeElementType,
	safeFontFamily,
	safeImageFit,
	safeImageSource,
	safeNumber,
	safeShape,
	safeText,
	safeTextAlign
} from './PresentationValueSanitizers.js';

/** Normalizes one imported or remote element into the known renderer schema. */
export function normalizePresentationElement(input = {}) {
	const type = safeElementType(input.type);
	const defaults = createElement(type);
	const element = {
		id: safeText(input.id, defaults.id, 200),
		type,
		x: safeNumber(input.x, defaults.x, -100, 200),
		y: safeNumber(input.y, defaults.y, -100, 200),
		width: safeNumber(input.width, defaults.width, 1, 200),
		height: safeNumber(input.height, defaults.height, 1, 200),
		rotation: safeNumber(input.rotation, defaults.rotation, -3600, 3600),
		opacity: safeNumber(input.opacity, defaults.opacity, 0.05, 1)
	};
	return Object.assign(element, normalizeTypeFields(type, input, defaults));
}

function normalizeTypeFields(type, input, defaults) {
	if (type === 'image') {
		return {
			src: safeImageSource(input.src),
			alt: safeText(input.alt, defaults.alt, 500),
			fit: safeImageFit(input.fit)
		};
	}
	if (type === 'shape') {
		return {
			shape: safeShape(input.shape),
			fill: safeColor(input.fill, defaults.fill),
			borderColor: safeColor(input.borderColor, defaults.borderColor),
			borderWidth: safeNumber(input.borderWidth, defaults.borderWidth, 0, 40),
			radius: safeNumber(input.radius, defaults.radius, 0, 500)
		};
	}
	return {
		text: safeText(input.text, defaults.text),
		fontSize: safeNumber(input.fontSize, defaults.fontSize, 6, 240),
		fontWeight: safeNumber(input.fontWeight, defaults.fontWeight, 100, 1000),
		fontFamily: safeFontFamily(input.fontFamily),
		color: safeColor(input.color, defaults.color),
		align: safeTextAlign(input.align)
	};
}
