//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small DOM vessels for Drive Project Settings.
 * @description
 * The Awtsmoos lets labels, inputs, actions, and status remain reusable vessels while project persistence stays in its own controller;
 * Awtsmoos.com keeps presentation construction separate so each source file remains narrow enough to inspect in one human glance.
 */

export function createSettingsFields(plan, projectIdFrom, providerValue) {
	return {
		id: field('Project ID', plan.identity.projectId || projectIdFrom(plan.identity.name)),
		name: field('Name', plan.identity.name),
		runtime: selectField('Runtime preference', plan.intent?.runtimePreference || 'static'),
		bindings: field('Binding names', (plan.bindings || []).map(item => item.name).join(', '), 'DB_URL, GITHUB_TOKEN'),
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
		runtimePreference: fields.runtime.value,
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
	if (registered) box.append(button('Delete configuration', 'button', remove));
	return box;
}

function field(label, value = '', placeholder = '') {
	const input = node('input');
	input.value = value || '';
	input.placeholder = placeholder;
	return { label: labeled(label, input), get value() { return input.value.trim(); } };
}

function selectField(label, value) {
	const input = node('select');
	for (const [key, title] of [['static', 'Static'], ['trusted-node', 'Trusted Node on my machine'], ['tenant-node', 'Isolated tenant Node (blocked until proven)']]) {
		const option = node('option');
		option.value = key;
		option.textContent = title;
		option.selected = key === value;
		input.append(option);
	}
	return { label: labeled(label, input), get value() { return input.value; } };
}

function labeled(label, input) {
	const wrapper = node('label', 'project-settings__field');
	wrapper.append(text('span', '', label), input);
	return wrapper;
}

function button(label, type, handler = null) {
	const item = text('button', '', label);
	item.type = type;
	if (handler) item.addEventListener('click', handler);
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
