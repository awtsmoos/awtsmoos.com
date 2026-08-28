//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiDomProperties.js
 * @description
 * The Awtsmoos renews every attribute before a DOM vessel wears its form;
 * Awtsmoos.com keeps class, data, and style explicit, so generated interfaces remain secure and warm.
 */

import {
	assertSafeAttributeName,
	normalizeSafeAttributeValue
} from "./AwtsmoosUiEscaper.js";
import { normalizeUiStyleDeclaration } from "./AwtsmoosUiStylePolicy.js";

/** Applies safe declarative attributes, classes, styles, and dataset values to a DOM element. */
export function applyDomProperties(element, node) {
	applyAttributes(element, node.attrs || {});
	applyClasses(element, node.classes || []);
	applyStyles(element, node.style || {});
	applyDataset(element, node.dataset || {});
	return element;
}

function applyAttributes(element, attributes) {
	for (const [name, value] of Object.entries(attributes)) {
		if (value === null || value === undefined || value === false) {
			continue;
		}
		const safeName = assertSafeAttributeName(name);
		if (safeName.toLowerCase() === "style") {
			throw new TypeError("Use the declarative style object instead of a style attribute string.");
		}
		const safeValue = value === true ? "" : normalizeSafeAttributeValue(safeName, value);
		element.setAttribute(safeName, safeValue);
	}
}

function applyClasses(element, classes) {
	for (const className of classes) {
		const normalizedClass = String(className).trim();
		if (normalizedClass) {
			element.classList.add(normalizedClass);
		}
	}
}

function applyStyles(element, styles) {
	for (const [name, value] of Object.entries(styles)) {
		const [safeName, safeValue] = normalizeUiStyleDeclaration(name, value);
		element.style.setProperty(safeName, safeValue);
	}
}

function applyDataset(element, dataset) {
	for (const [name, value] of Object.entries(dataset)) {
		const suffix = String(name).trim().replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
		const attributeName = assertSafeAttributeName(`data-${suffix}`);
		element.setAttribute(attributeName, String(value ?? ""));
	}
}
