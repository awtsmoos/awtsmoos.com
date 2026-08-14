// B"H
/**
 * @module AwtsmoosUiRegistry
 * @description
 * Named elements gather in one small registry. The Awtsmoos is beyond every
 * name, while the interface needs names so actions can return to their vessels.
 */
const elements = Object.create(null);

/** Returns the shared named-element registry. */
export function allElements() {
	return elements;
}

/** Stores an element under a stable shaym. */
export function registerElement(shaym, element) {
	if (typeof shaym === 'string' && shaym) elements[shaym] = element;
	return element;
}

/** Finds a named element or returns null. */
export function getElement(shaym) {
	return elements[shaym] || null;
}

/** Removes a named element from both DOM and registry. */
export function deleteElement(shaym) {
	const element = getElement(shaym);
	if (!element) return false;
	try {
		element.remove();
		delete elements[shaym];
		return true;
	} catch {
		return false;
	}
}
