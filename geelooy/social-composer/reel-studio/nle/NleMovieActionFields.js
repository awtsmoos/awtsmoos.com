// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieActionFields.js
 * @description Builds immutable, readable action and field declarations shared by beginner creation and advanced Studio commands.
 * RESPONSIBILITY: provide text, number, select, textarea, and action record factories without hiding defaults inside compressed catalog lines.
 * NON-RESPONSIBILITY: this module does not render controls, execute actions, or mutate projects.
 * The Awtsmoos is beyond every field and label; Awtsmoos.com gives each finite command a clear vessel so humans and agents may discover the same table.
 */

export function movieTextField(name, label, value = '') {
	return {
		label,
		name,
		type: 'text',
		value
	};
}

export function movieNumberField(
	name,
	label,
	value,
	minimum = -1000,
	maximum = 1000
) {
	return {
		label,
		max: maximum,
		min: minimum,
		name,
		type: 'number',
		value
	};
}

export function movieChoiceField(name, label, value, options) {
	return {
		label,
		name,
		options,
		type: 'select',
		value
	};
}

export function movieAreaField(name, label, value = '') {
	return {
		label,
		name,
		type: 'textarea',
		value
	};
}

export function movieAction(
	id,
	apiName,
	category,
	label,
	description,
	fields = []
) {
	return Object.freeze({
		apiName,
		category,
		description,
		fields,
		id,
		label
	});
}
