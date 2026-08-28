//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiHtmlAttributes.js
 * @description
 * The Awtsmoos renews every serialized boundary before markup travels between worlds;
 * Awtsmoos.com escapes generated attributes and styles, so portability never loosens safety's hold.
 */

import {
	assertSafeAttributeName,
	escapeUiAttribute,
	normalizeSafeAttributeValue
} from "./AwtsmoosUiEscaper.js";
import { serializeUiStyleObject } from "./AwtsmoosUiStylePolicy.js";

/** Serializes safe element metadata while intentionally omitting event descriptors. */
export function serializeUiHtmlAttributes(node) {
	const attributes = [];
	appendOrdinaryAttributes(attributes, node.attrs || {});
	appendClasses(attributes, node.classes || []);
	appendStyle(attributes, node.style || {});
	appendDataset(attributes, node.dataset || {});
	return attributes.length ? ` ${attributes.join(" ")}` : "";
}

function appendOrdinaryAttributes(output, attributes) {
	for (const [name, value] of Object.entries(attributes)) {
		if (value === null || value === undefined || value === false) {
			continue;
		}
		const safeName = assertSafeAttributeName(name);
		if (safeName.toLowerCase() === "style") {
			throw new TypeError("Use the declarative style object instead of a style attribute string.");
		}
		const safeValue = value === true ? "" : normalizeSafeAttributeValue(safeName, value);
		output.push(`${safeName}="${escapeUiAttribute(safeValue)}"`);
	}
}

function appendClasses(output, classes) {
	const classText = classes.map(String).map(value => value.trim()).filter(Boolean).join(" ");
	if (classText) {
		output.push(`class="${escapeUiAttribute(classText)}"`);
	}
}

function appendStyle(output, styles) {
	const styleText = serializeUiStyleObject(styles);
	if (styleText) {
		output.push(`style="${escapeUiAttribute(styleText)}"`);
	}
}

function appendDataset(output, dataset) {
	for (const [name, value] of Object.entries(dataset)) {
		const suffix = String(name).trim().replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
		const safeName = assertSafeAttributeName(`data-${suffix}`);
		output.push(`${safeName}="${escapeUiAttribute(value)}"`);
	}
}
