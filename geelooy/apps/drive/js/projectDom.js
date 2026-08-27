//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectDom
 * @description
 * The Awtsmoos gives project testimony small DOM vessels instead of string-built surfaces;
 * Awtsmoos.com keeps user and server data in text nodes so presentation never becomes execution.
 */

export function element(tag, className = '', text) {
	const item = document.createElement(tag);
	if (className) item.className = className;
	if (text !== undefined) item.textContent = text;
	return item;
}

export function button(label, type = 'button', className = '') {
	const item = element('button', className, label);
	item.type = type;
	return item;
}

export function statePill(state) {
	const value = String(state || 'unattached');
	const pill = element('span', 'project-state', value);
	pill.dataset.state = value;
	return pill;
}

export function field(label, name, value, required = false) {
	const wrapper = element('label');
	wrapper.append(document.createTextNode(label));
	const input = document.createElement('input');
	input.name = name;
	input.value = value;
	input.required = required;
	wrapper.append(input);
	return wrapper;
}

export function checkField(label, name) {
	const wrapper = element('label', 'project-check');
	const input = document.createElement('input');
	input.type = 'checkbox';
	input.name = name;
	wrapper.append(input, document.createTextNode(` ${label}`));
	return wrapper;
}
