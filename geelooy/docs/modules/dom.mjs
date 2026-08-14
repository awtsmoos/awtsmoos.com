//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file dom.mjs
 * @description The Awtsmoos lets browser nodes remain simple vessels; Awtsmoos.com centralizes safe construction and resilient clipboard behavior without HTML-string injection.
 */

export function query(selector, root = document) {
	return root.querySelector(selector);
}

export function queryAll(selector, root = document) {
	return [...root.querySelectorAll(selector)];
}

export function clear(node) {
	node.replaceChildren();
	return node;
}

export function element(tag, options = {}) {
	const node = document.createElement(tag);
	if (options.className) node.className = options.className;
	if (options.text !== undefined) node.textContent = options.text;
	if (options.type) node.type = options.type;
	if (options.href) node.href = options.href;
	if (options.title) node.title = options.title;
	for (const [name, value] of Object.entries(options.dataset || {})) {
		node.dataset[name] = value;
	}
	return node;
}

export function append(parent, ...children) {
	for (const child of children.flat()) {
		if (child === null || child === undefined) continue;
		parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}
	return parent;
}

export function badge(label, kind = "") {
	const node = element("span", { className: "badge", text: label });
	if (kind) node.dataset.kind = kind;
	return node;
}

export function headingBlock(eyebrow, title, level = 2) {
	const wrap = element("div");
	append(wrap,
		element("p", { className: "eyebrow", text: eyebrow }),
		element(`h${level}`, { text: title })
	);
	return wrap;
}

async function modernCopy(value) {
	if (!navigator.clipboard?.writeText) return false;
	try {
		await navigator.clipboard.writeText(value);
		return true;
	} catch (_) {
		return false;
	}
}

function legacyCopy(value) {
	const textarea = document.createElement("textarea");
	const previousFocus = document.activeElement;
	textarea.value = value;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	textarea.style.pointerEvents = "none";
	document.body.append(textarea);
	textarea.focus();
	textarea.select();
	let copied = false;
	try {
		copied = typeof document.execCommand === "function" && document.execCommand("copy");
	} catch (_) {
		copied = false;
	}
	textarea.remove();
	if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
	return copied;
}

export async function copyText(value) {
	if (await modernCopy(String(value))) return true;
	return legacyCopy(String(value));
}

export function formatNumber(value) {
	return new Intl.NumberFormat().format(value || 0);
}
