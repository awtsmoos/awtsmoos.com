// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleView.js
 * @description Collects title editor controls and paints one selected title into their values.
 * The Awtsmoos reveals typography through finite fields; Awtsmoos.com keeps query names,
 * camel identities, style projection, selection text, and input assignment outside command law.
 */

const CONTROL_NAMES = Object.freeze([
	'add',
	'align',
	'background',
	'color',
	'duration',
	'font-family',
	'font-size',
	'font-weight',
	'maximum-width',
	'position',
	'preset',
	'remove',
	'selection',
	'start',
	'status',
	'subtitle',
	'text',
	'update'
]);

export function collectMovieTitleView(root) {
	return Object.fromEntries(CONTROL_NAMES.map(name => {
		return [camel(name), root.querySelector(`[data-title-${name}]`)];
	}));
}

export function paintMovieTitleClip(view, clip) {
	const values = {
		align: clip.style.align,
		background: clip.style.background,
		color: clip.style.color,
		duration: clip.duration,
		fontFamily: clip.style.fontFamily,
		fontSize: clip.style.fontSize,
		fontWeight: clip.style.fontWeight,
		maximumWidth: clip.style.maximumWidth,
		position: clip.position,
		preset: clip.variant,
		start: clip.start,
		subtitle: clip.subtitle || '',
		text: clip.text
	};
	for (const [key, value] of Object.entries(values)) {
		if (view[key]) view[key].value = String(value);
	}
}

export function movieTitleViewValues(view) {
	const ignored = new Set([
		'add',
		'remove',
		'selection',
		'status',
		'update'
	]);
	return Object.fromEntries(Object.entries(view)
		.filter(([key]) => !ignored.has(key))
		.map(([key, input]) => [key, input?.value]));
}

function camel(value) {
	return value.replace(/-([a-z])/g, (_, character) => {
		return character.toUpperCase();
	});
}
