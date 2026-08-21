//B"H
// Boruch Hashem
// Blessed is He

import { createRuntimeSettingsFields, readRuntimeSettingsFields } from './projectRuntimeSettingsDom.js';

/**
 * @module DriveProjectSettingsDom
 * @description
 * The Awtsmoos lets project identity, providers, bindings, and runtime recipe appear as separate readable vessels;
 * Awtsmoos.com keeps general settings narrow while native-compute controls live in their own module, so the form can grow without becoming a tangled sea.
 */

export function createSettingsFields(plan, projectIdFrom, providerValue) {
	return {
		id: field('Project ID', plan.identity.projectId || projectIdFrom(plan.identity.name)),
		name: field('Name', plan.identity.name),
		...createRuntimeSettingsFields(plan),
		bindings: field(
			'Binding names',
			(plan.bindings || []).map(item => item.name).join(', '),
			'DB_URL, GITHUB_TOKEN'
		),
		git: field('GitHub repository intent', providerValue(plan, 'git'), 'owner/repository'),
		social: field('Social Garden intent', providerValue(plan, 'social'), 'alias-or-series')
	};
}

export function createSettingsLayout(fields, registered, remove) {
	return [
		header(registered),
		grid(...Object.values(fields).map(item => item.label)),
		actions(registered, remove),
		text('span', 'project-settings__message', '')
	];
}

export function readSettingsFields(fields) {
	return {
		name: fields.name.value,
		...readRuntimeSettingsFields(fields),
		bindings: fields.bindings.value,
		git: fields.git.value,
		social: fields.social.value
	};
}

export function setSettingsMessage(form, message, tone = '') {
	const target = form.querySelector('.project-settings__message');
	target.textContent = message;
	target.dataset.tone = tone;
}

function header(registered) {
	const box = node('div', 'project-settings__head');
	box.append(
		text('div', 'project-settings__eyebrow', registered ? 'DURABLE PROJECT' : 'MAKE THIS FOLDER A PROJECT'),
		text('h3', '', 'Project settings')
	);
	return box;
}

function grid(...labels) {
	const box = node('div', 'project-settings__grid');
	box.append(...labels);
	return box;
}

function actions(registered, remove) {
	const box = node('div', 'project-settings__actions');
	box.append(button('Save project', 'submit'));
	if (registered) {
		box.append(button('Delete configuration', 'button', remove));
	}
	return box;
}

function field(labelText, value = '', placeholder = '') {
	const input = node('input');
	input.value = value || '';
	input.placeholder = placeholder;
	const label = labeled(labelText, input);
	return {
		label,
		get value() {
			return input.value.trim();
		}
	};
}

function labeled(labelText, input) {
	const wrapper = node('label', 'project-settings__field');
	wrapper.append(text('span', '', labelText), input);
	return wrapper;
}

function button(label, type, handler = null) {
	const item = text('button', '', label);
	item.type = type;
	if (handler) {
		item.addEventListener('click', handler);
	}
	return item;
}

function text(tag, className, value) {
	const item = node(tag, className);
	item.textContent = value;
	return item;
}

function node(tag, className = '') {
	const item = document.createElement(tag);
	item.className = className;
	return item;
}
