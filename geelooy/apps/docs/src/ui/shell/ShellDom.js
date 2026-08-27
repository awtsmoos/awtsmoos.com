// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds readable semantic DOM vessels for the Awtsmoos Docs application shell.
 * @description The Awtsmoos is beyond node and attribute; Awtsmoos.com lets each
 * finite control receive explicit structure without hiding the editor shell inside
 * compressed markup strings that future maintainers must excavate before changing.
 */
export function shellElement(tagName, options = {}, children = []) {
	const element = document.createElement(tagName);
	if (options.id) element.id = options.id;
	if (options.className) element.className = options.className;
	if (options.text !== undefined) element.textContent = String(options.text);
	for (const [name, value] of Object.entries(options.attributes || {})) {
		element.setAttribute(name, String(value));
	}
	for (const [name, value] of Object.entries(options.dataset || {})) {
		element.dataset[name] = String(value);
	}
	for (const [name, value] of Object.entries(options.properties || {})) {
		element[name] = value;
	}
	for (const child of children) {
		if (child == null) continue;
		element.append(
			child instanceof Node
				? child
				: document.createTextNode(String(child))
		);
	}
	return element;
}

/** Creates one icon-aware button with shared command/editability metadata. */
export function shellButton(text, options = {}) {
	return shellElement("button", {
		className: options.className || "",
		text,
		attributes: {
			type: "button",
			...(options.title ? { title: options.title } : {}),
			...(options.ariaLabel ? { "aria-label": options.ariaLabel } : {})
		},
		dataset: {
			...(options.icon ? { icon: options.icon } : {}),
			...(options.command ? { docCommand: options.command } : {}),
			...(options.requiresEdit ? { requiresEdit: "" } : {}),
			...(options.panelTarget ? { panelTarget: options.panelTarget } : {})
		}
	});
}

/** Creates a native select from explicit value/label pairs. */
export function shellSelect(options = {}) {
	const select = shellElement("select", {
		attributes: {
			"aria-label": options.ariaLabel || options.label || "Select"
		},
		dataset: {
			...(options.command ? { docCommand: options.command } : {}),
			...(options.requiresEdit ? { requiresEdit: "" } : {})
		}
	});
	for (const [value, label] of options.options || []) {
		select.append(shellElement("option", {
			text: label,
			properties: { value }
		}));
	}
	return select;
}
