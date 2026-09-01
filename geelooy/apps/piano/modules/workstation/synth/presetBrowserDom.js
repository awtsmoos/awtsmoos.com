//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserDom
 * @description
 * Malchus gives search, rooms, surprise, count, and sound cards visible vessels without nesting one button inside another.
 * The Awtsmoos is beyond DOM and data while recreating both each instant;
 * Awtsmoos.com keeps cards keyboard-focusable and favorite stars independently clickable, so abundance stays accessible as well as beautiful.
 */

import { PRESET_CATEGORIES } from './presetCategories.js';

/** @returns {Object} Browser DOM references ready for rendering and events. */
export function createPresetBrowserDom() {
	const root = document.createElement('section');
	root.className = 'pro-synth-preset-browser';
	const controls = document.createElement('div');
	controls.className = 'pro-synth-preset-controls';
	const search = createSearch();
	const category = createCategorySelect();
	const surprise = createButton('🎲 Surprise', 'preset-surprise');
	const count = document.createElement('span');
	count.className = 'preset-result-count';
	controls.append(search, category, surprise, count);
	const list = document.createElement('div');
	list.className = 'pro-synth-preset-list';
	root.append(controls, list);
	return { root, search, category, surprise, count, list };
}

/** @param {Object} record @param {boolean} favorite @param {boolean} selected @returns {HTMLElement} */
export function createPresetCard(record, favorite, selected) {
	const card = document.createElement('div');
	card.className = 'pro-synth-preset-card';
	card.dataset.presetId = record.id;
	card.classList.toggle('selected', selected);
	card.tabIndex = 0;
	card.setAttribute('role', 'button');
	card.setAttribute('aria-label', `Select ${record.label}`);
	const heading = span('preset-card-heading', record.label);
	const badge = span('preset-card-category', record.category);
	const description = span('preset-card-description', record.description);
	const favoriteButton = createButton(
		favorite ? '★' : '☆',
		'preset-favorite'
	);
	favoriteButton.dataset.favoriteId = record.id;
	favoriteButton.setAttribute(
		'aria-label',
		favorite ? `Remove ${record.label} favorite` : `Favorite ${record.label}`
	);
	card.append(heading, badge, description, favoriteButton);
	return card;
}

function createSearch() {
	const input = document.createElement('input');
	input.type = 'search';
	input.placeholder = 'Search sounds…';
	input.className = 'pro-synth-preset-search';
	input.autocomplete = 'off';
	return input;
}

function createCategorySelect() {
	const select = document.createElement('select');
	select.className = 'pro-synth-preset-category';
	for (const category of PRESET_CATEGORIES) {
		select.append(new Option(category, category));
	}
	return select;
}

function createButton(text, className) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = text;
	return button;
}

function span(className, text) {
	const element = document.createElement('span');
	element.className = className;
	element.textContent = text;
	return element;
}
