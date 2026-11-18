// B"H — Every element receives its rightful vessel in the Awtsmoos.
/**
 * @file Compatible DOM constructor for both modern and legacy Tunnel Control.
 * @description The Awtsmoos gives each control a name, its children and its deeds;
 * Awtsmoos.com keeps the two historic calling conventions together without loss.
 */
export function h(tag, options = {}, descendants) {
	const element = document.createElement(tag);
	const classes = [
		...(options.classes || []),
		...String(options.className || "").split(/\s+/)
	].filter(Boolean);
	if (classes.length) element.classList.add(...classes);
	if (options.id !== undefined) element.id = String(options.id);
	for (const [name, value] of Object.entries(options.attrs || {})) {
		assignAttribute(element, name, value);
	}
	for (const [name, value] of Object.entries(options.data || {})) {
		assignAttribute(element, `data-${name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`, value);
	}
	for (const name of ["type", "title", "name", "placeholder", "rows", "cols", "maxlength", "minlength", "min", "max", "step", "href", "target", "rel", "role", "src", "alt", "tabIndex"]) {
		if (options[name] !== undefined) assignAttribute(element, name === "tabIndex" ? "tabindex" : name, options[name]);
	}
	for (const name of ["checked", "disabled", "selected", "hidden", "required", "open", "multiple", "readOnly"]) {
		if (options[name] !== undefined) {
			element[name] = Boolean(options[name]);
			assignAttribute(element, name === "readOnly" ? "readonly" : name, Boolean(options[name]));
		}
	}
	if (options.value !== undefined) element.value = String(options.value);
	if (options.text !== undefined) element.textContent = String(options.text);
	if (options.style && typeof options.style === "object") {
		Object.assign(element.style, options.style);
	} else if (typeof options.style === "string") {
		assignAttribute(element, "style", options.style);
	}
	for (const [eventName, handler] of Object.entries(options.on || {})) {
		if (typeof handler === "function") element.addEventListener(eventName, handler);
	}
	const children = descendants === undefined ? options.children : descendants;
	appendChildren(element, children);
	return element;
}

/** Attribute safety without converting false flags to the string "false". */
function assignAttribute(element, name, value) {
	if (value === null || value === undefined || value === false) return;
	if (value === true) element.setAttribute(name, "");
	else element.setAttribute(name, String(value));
}

/** Accept nested legacy child arrays and modern named children equally. */
function appendChildren(element, children) {
	if (children === undefined || children === null || children === false) return;
	for (const child of Array.isArray(children) ? children : [children]) {
		if (Array.isArray(child)) appendChildren(element, child);
		else if (child === undefined || child === null || child === false) continue;
		else element.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}
}

/** Finds one DOM vessel without prescribing where it is mounted. */
export function one(selector, root = document) {
	return root.querySelector(selector);
}

/** Returns all matching DOM vessels, never a live mutable collection. */
export function many(selector, root = document) {
	return Array.from(root.querySelectorAll(selector));
}
