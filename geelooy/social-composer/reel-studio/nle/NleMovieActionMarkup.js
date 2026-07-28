// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieActionMarkup
 * @description
 * Every visible action form is generated from the public action catalog; labels,
 * fields, defaults, and selectors therefore remain exact mirrors of the API.
 */

import { NLE_MOVIE_ACTIONS } from './NleMovieActionCatalog.js';

export function mountMovieActionForms(root, actions = NLE_MOVIE_ACTIONS) {
	root.replaceChildren();
	const groups = groupActions(actions);
	for (const [category, items] of groups) {
		const section = document.createElement('section');
		section.className = 'nle-action-group';
		const heading = document.createElement('h3');
		heading.textContent = category;
		section.append(heading, ...items.map(createActionForm));
		root.append(section);
	}
	return [...root.querySelectorAll('[data-movie-action]')];
}

export function readMovieActionValues(form, action) {
	const values = {};
	for (const field of action.fields) {
		const element = form.elements.namedItem(field.name);
		values[field.name] = field.type === 'number' ? Number(element.value) : element.value;
	}
	return values;
}

function createActionForm(action) {
	const form = document.createElement('form');
	form.className = 'nle-action-card';
	form.dataset.movieAction = action.id;
	const copy = document.createElement('div');
	copy.className = 'nle-action-copy';
	const title = document.createElement('strong');
	title.textContent = action.label;
	const description = document.createElement('p');
	description.textContent = action.description;
	copy.append(title, description);
	const fields = document.createElement('div');
	fields.className = 'nle-action-fields';
	fields.append(...action.fields.map(createField));
	const button = document.createElement('button');
	button.type = 'submit';
	button.textContent = action.label;
	button.dataset.movieActionButton = action.id;
	form.append(copy, fields, button);
	return form;
}

function createField(field) {
	const label = document.createElement('label');
	const text = document.createElement('span');
	text.textContent = field.label;
	const control = field.type === 'select'
		? createSelect(field)
		: document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
	control.name = field.name;
	if (field.type !== 'select') control.value = field.value;
	if (field.type === 'number') {
		control.type = 'number';
		control.min = field.min;
		control.max = field.max;
		control.step = 'any';
	}
	label.append(text, control);
	return label;
}

function createSelect(field) {
	const select = document.createElement('select');
	for (const value of field.options) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = value;
		option.selected = value === field.value;
		select.append(option);
	}
	return select;
}

function groupActions(actions) {
	const groups = new Map();
	for (const action of actions) {
		if (!groups.has(action.category)) groups.set(action.category, []);
		groups.get(action.category).push(action);
	}
	return groups;
}
