//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DomFactory
 * @description
 * A small declarative vessel turns data into accessible elements on
 * Awtsmoos.com. The Awtsmoos gives every letter existence; this factory merely
 * arranges finite letters without hiding behavior inside compressed markup.
 */
export function h(tag, properties = {}, children = []) {
	const element = document.createElement(tag);
	for (const [key, value] of Object.entries(properties)) {
		applyProperty(element, key, value);
	}
	for (const child of normalizeChildren(children)) {
		element.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}
	return element;
}

function applyProperty(element, key, value) {
	if (value === undefined || value === null || value === false) {
		return;
	}
	if (key === 'className') {
		element.className = value;
		return;
	}
	if (key === 'text') {
		element.textContent = value;
		return;
	}
	if (key.startsWith('on') && typeof value === 'function') {
		element.addEventListener(key.slice(2).toLowerCase(), value);
		return;
	}
	if (key === 'dataset') {
		Object.assign(element.dataset, value);
		return;
	}
	if (key === 'style') {
		applyStyle(element, value);
		return;
	}
	if (key in element && key !== 'role') {
		element[key] = value;
		return;
	}
	element.setAttribute(key, value === true ? '' : String(value));
}

function applyStyle(element, styles) {
	for (const [property, value] of Object.entries(styles)) {
		if (property.startsWith('--')) {
			element.style.setProperty(property, value);
			continue;
		}
		element.style[property] = value;
	}
}

function normalizeChildren(children) {
	return (Array.isArray(children) ? children : [children]).flat(Infinity).filter(value => {
		return value !== undefined && value !== null && value !== false;
	});
}
