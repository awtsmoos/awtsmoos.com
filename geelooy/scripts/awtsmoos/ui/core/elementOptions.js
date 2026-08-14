// B"H
/**
 * @module AwtsmoosUiElementOptions
 * @description Applies finite properties without mixing creation, children,
 * registry, and actions into one oversized file.
 */
const RESERVED = new Set([
	'tag', 'style', 'classList', 'shaym', 'ready', 'children', 'events', 'parent',
	'on', 'attributes', 'child', 'toldos', 'awtsmoosOnChange', 'tolda',
	'outerHTML', 'dataset'
]);

/** Creates an element from a tag or an explicitly supplied outerHTML fragment. */
export function createElementNode(options = {}) {
	if (typeof options.outerHTML === 'string') {
		const template = document.createElement('template');
		template.innerHTML = options.outerHTML.trim();
		return template.content.firstElementChild || document.createElement(options.tag || 'div');
	}
	return document.createElement(options.tag || 'div');
}

/** Applies ordinary properties, styles, classes, attributes, data, and events. */
export function applyElementOptions(element, options, ui) {
	applyClasses(element, options.classList);
	applyProperties(element, options, ui);
	applyStyles(element, options.style);
	applyAttributes(element, options.attributes);
	applyDataset(element, options.dataset);
	applyEvents(element, options.events || options.on, ui);
	return element;
}

function applyClasses(element, classList) {
	if (Array.isArray(classList)) element.classList.add(...classList.filter(Boolean));
	else if (typeof classList === 'string') element.classList.add(...classList.split(/\s+/).filter(Boolean));
}

function applyProperties(element, options, ui) {
	for (const [property, value] of Object.entries(options || {})) {
		if (RESERVED.has(property)) continue;
		try {
			if (property.startsWith('on') && typeof value === 'function') {
				element[property] = event => value(event, ui.getHtml.bind(ui), ui, element);
			} else {
				element[property] = value;
			}
		} catch {
			if (value !== undefined && value !== null) element.setAttribute(property, String(value));
		}
	}
}

function applyStyles(element, style) {
	if (typeof style === 'string') element.style.cssText = style;
	else if (style && typeof style === 'object') Object.assign(element.style, style);
}

function applyAttributes(element, attributes) {
	for (const [name, value] of Object.entries(attributes || {})) {
		if (value === false || value === null || value === undefined) element.removeAttribute(name);
		else element.setAttribute(name, value === true ? '' : String(value));
	}
}

function applyDataset(element, dataset) {
	for (const [name, value] of Object.entries(dataset || {})) element.dataset[name] = String(value);
}

function applyEvents(element, events, ui) {
	for (const [eventName, callback] of Object.entries(events || {})) {
		if (typeof callback !== 'function') continue;
		element.addEventListener(eventName, event => callback(event, ui.getHtml.bind(ui), ui, element));
	}
}
