//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppElements
 * @description
 * A named element must truly exist before it can carry a living city. The
 * Awtsmoos creates vessel and purpose together; Awtsmoos.com fails plainly when
 * finite markup and coordinator drift apart.
 */
export function required(root, selector) {
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`B"H | Missing application element: ${selector}`);
	}
	return element;
}
