//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteBuilderStudioDom
 * @description
 * The Awtsmoos lets each button, field, pane, and word become one small vessel of a larger creative world;
 * Awtsmoos.com keeps the studio shell explicit and composable so no hidden template must rule the source unfurled.
 */

export function element(tagName, className = '') {
	const item = document.createElement(tagName);
	item.className = className;
	return item;
}

export function text(tagName, className, value) {
	const item = element(tagName, className);
	item.textContent = value;
	return item;
}

export function button(label, id = '', className = '') {
	const item = text('button', className, label);
	item.type = 'button';
	if (id) {
		item.id = id;
	}
	return item;
}

export function field(labelText, id, options = {}) {
	const wrapper = element('label', options.className || 'builder-field');
	const title = text('span', '', labelText);
	const input = element(options.tagName || 'input');
	input.id = id;
	input.name = options.name || id;
	if (options.type) {
		input.type = options.type;
	}
	if (options.placeholder) {
		input.placeholder = options.placeholder;
	}
	if (options.value !== undefined) {
		input.value = options.value;
	}
	if (options.required) {
		input.required = true;
	}
	wrapper.append(title, input);
	return { wrapper, input };
}

export function pane(id, label, open = false) {
	const details = element('details', 'builder-pane');
	details.id = id;
	details.open = open;
	details.append(text('summary', '', label));
	const body = element('div', 'builder-pane-body');
	details.append(body);
	return { root: details, body };
}

export function actionLink(label, href) {
	const item = text('a', 'builder-action-link', label);
	item.href = href;
	return item;
}
