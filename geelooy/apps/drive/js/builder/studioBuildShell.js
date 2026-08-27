//B"H
// Boruch Hashem
// Blessed is He

import { button, element, field, pane, text } from './studioDom.js';

/**
 * @module SiteBuilderBuildShell
 * @description
 * The Awtsmoos lets purpose become source without forcing infrastructure into the first creative moment;
 * Awtsmoos.com separates the human brief, starter creation, and real-file inventory so beginners see one path while advanced source remains fully theirs.
 */

export function createBuildShell() {
	const vessel = pane('builder-build', 'Build', true);
	vessel.body.append(
		briefCard(),
		starterCard(),
		sourceCard(),
		jumpRow()
	);
	return vessel.root;
}

function briefCard() {
	const card = element('section', 'builder-surface-card');
	card.append(
		text('h3', '', 'Describe the website'),
		text('p', 'builder-help', 'Optional private notes help humans and agents understand what you are building.')
	);
	const form = element('form', 'builder-grid');
	form.id = 'builder-brief-form';
	form.append(
		field('Website name', 'builder-name', { name: 'name', placeholder: 'My website' }).wrapper,
		field('Purpose', 'builder-purpose', { name: 'purpose', tagName: 'textarea', placeholder: 'What should this website accomplish?' }).wrapper,
		field('Audience', 'builder-audience', { name: 'audience', placeholder: 'Who is it for?' }).wrapper,
		field('Notes', 'builder-notes', { name: 'notes', tagName: 'textarea', placeholder: 'Style, sections, constraints, ideas…' }).wrapper
	);
	const save = button('Save brief', '', 'builder-button-secondary');
	save.type = 'submit';
	form.append(save);
	card.append(form);
	return card;
}

function starterCard() {
	const card = element('section', 'builder-surface-card builder-surface-card--primary');
	card.append(
		text('h3', '', 'Create website source'),
		text('p', 'builder-help', 'Choose a starter. The result is ordinary HTML/CSS/JS you can edit anywhere.')
	);
	card.append(starterForm());
	return card;
}

function starterForm() {
	const form = element('form', 'builder-grid builder-grid-two');
	form.id = 'builder-starter-form';
	const siteId = field('Site ID', 'builder-starter-site-id', { name: 'siteId', placeholder: 'friend-site', required: true });
	const kind = field('Starter', 'builder-starter-kind', { name: 'kind', tagName: 'select' });
	for (const value of ['blank', 'landing', 'portfolio', 'docs']) {
		const option = element('option');
		option.value = value;
		option.textContent = value[0].toUpperCase() + value.slice(1);
		kind.input.append(option);
	}
	const primary = field('Make primary site', 'builder-starter-primary', { name: 'primary', type: 'checkbox' });
	primary.wrapper.classList.add('builder-check');
	const submit = button('Create website source', '', 'builder-button-primary');
	submit.type = 'submit';
	form.append(siteId.wrapper, kind.wrapper, primary.wrapper, submit);
	return form;
}

function sourceCard() {
	const card = element('section', 'builder-surface-card');
	const state = text('p', 'builder-status-line', 'No index state yet.');
	state.id = 'builder-index-state';
	const count = text('small', 'builder-muted', '0 source files');
	count.id = 'builder-source-count';
	const list = element('div', 'builder-source-list');
	list.id = 'builder-source-list';
	card.append(text('h3', '', 'Real source files'), state, count, list, button('Open all Drive files', 'builder-open-files'));
	return card;
}

function jumpRow() {
	const row = element('div', 'builder-actions');
	for (const [label, target] of [['Preview website', 'preview'], ['Edit code', 'code'], ['Publish', 'publish']]) {
		const item = button(label);
		item.dataset.builderJump = target;
		row.append(item);
	}
	return row;
}
