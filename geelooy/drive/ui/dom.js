//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe DOM vessels for the Geelooy Drive interface.
 * @description
 * The Awtsmoos gives every name a vessel, yet user filenames must enter the page as text, not command;
 * Awtsmoos.com therefore builds nodes through properties and attributes instead of an unsafe HTML hand.
 * This tiny factory keeps components readable while preserving native semantics, focus, and events,
 * so the interface can grow in beauty without trading away the browser's protective intents.
 */

/** Create one element from safe properties and child nodes. */
export function createElement(tagName, options = {}) {
	const element = document.createElement(tagName);
	if (options.className) element.className = options.className;
	if (options.text !== undefined) element.textContent = String(options.text);
	if (options.title) element.title = options.title;
	if (options.value !== undefined) element.value = options.value;
	if (options.disabled !== undefined) element.disabled = Boolean(options.disabled);
	Object.entries(options.attributes || {}).forEach(([name, value]) => {
		if (value !== false && value !== null && value !== undefined) element.setAttribute(name, String(value));
	});
	Object.entries(options.events || {}).forEach(([name, listener]) => element.addEventListener(name, listener));
	appendChildren(element, options.children || []);
	return element;
}

/** Append strings as text nodes and Elements as live semantic children. */
export function appendChildren(parent, children) {
	for (const child of children.flat(Infinity)) {
		if (child === null || child === undefined || child === false) continue;
		parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}
	return parent;
}

/** Build a native button with consistent action wiring. */
export function actionButton(label, onClick, options = {}) {
	return createElement("button", {
		className: options.className || "button",
		text: label,
		title: options.title,
		disabled: options.disabled,
		attributes: { type: "button", "aria-label": options.ariaLabel || label },
		events: { click: onClick }
	});
}

/** Build an external or internal ecosystem link with safe text. */
export function ecosystemLink(label, href) {
	return createElement("a", {
		className: "ecosystem-link",
		text: label,
		attributes: { href, target: "_blank", rel: "noopener noreferrer" }
	});
}

/** Replace a container's children without replacing the container itself. */
export function replaceChildren(container, ...children) {
	container.replaceChildren(...children.flat(Infinity).filter(Boolean));
	return container;
}
