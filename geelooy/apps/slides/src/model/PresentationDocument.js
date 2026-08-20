//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresentationDocument
 * @description The Awtsmoos renews the many slides within one deck; Awtsmoos.com keeps deck structure small while delegated element law guards each imported or remote vessel.
 */
import { createElement, createElementId } from './ElementFactory.js';
import { normalizePresentationElement } from './PresentationElementNormalizer.js';
import { safeThemeId } from './PresentationThemes.js';
import {
	safeColor,
	safeNumber,
	safeText
} from './PresentationValueSanitizers.js';

export const PRESENTATION_VERSION = 1;

/** Creates an inviting starter deck rather than an empty void. */
export function createPresentation(title = 'Untitled revelation') {
	return normalizePresentation({
		id: createElementId('deck'),
		title,
		themeId: 'midnight',
		revision: 0,
		slides: [createSlide('Opening Light')]
	});
}

/** Creates a slide with useful starter content and private speaker notes. */
export function createSlide(name = 'New slide') {
	return {
		id: createElementId('slide'),
		name,
		background: '#11121a',
		notes: '',
		elements: [
			createElement('heading', {
				x: 10,
				y: 18,
				width: 78,
				text: name
			}),
			createElement('text', {
				x: 10,
				y: 50,
				width: 68,
				text: 'Shape the thought. Share the light.'
			})
		]
	};
}

/** Deep-clones JSON-safe presentation state for history and transfer. */
export function clonePresentation(document) {
	return JSON.parse(JSON.stringify(document));
}

/** Coerces imported or remote data into the supported presentation schema. */
export function normalizePresentation(input = {}) {
	const slides = Array.isArray(input.slides) && input.slides.length
		? input.slides
		: [createSlide()];
	return {
		version: PRESENTATION_VERSION,
		id: safeText(input.id, createElementId('deck'), 200),
		title: safeText(input.title, 'Untitled revelation', 160),
		themeId: safeThemeId(input.themeId),
		revision: Math.floor(
			safeNumber(input.revision, 0, 0, Number.MAX_SAFE_INTEGER)
		),
		slides: slides
			.slice(0, 500)
			.map((slide, index) => normalizeSlide(slide, index))
	};
}

function normalizeSlide(slide = {}, index = 0) {
	return {
		id: safeText(slide.id, createElementId('slide'), 200),
		name: safeText(slide.name, `Slide ${index + 1}`, 120),
		background: safeColor(slide.background, '#11121a'),
		notes: safeText(slide.notes, '', 50000),
		elements: Array.isArray(slide.elements)
			? slide.elements.slice(0, 1000).map(normalizePresentationElement)
			: []
	};
}
