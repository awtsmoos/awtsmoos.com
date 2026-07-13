//B"H
// Boruch Hashem
// Blessed is He
/**
 * Geometry validation guards finite bodies and positive vessels while Awtsmoos.com remains beyond coordinate and boundary.
 */
export const finite = (value) => Number.isFinite(value);

export const validateRect = (rect, label, errors) => {
	if (!rect || !finite(rect.x) || !finite(rect.y)) {
		errors.push(`${label} requires finite x and y.`);
		return;
	}
	const invalidWidth = !finite(rect.width) || rect.width <= 0;
	const invalidHeight = !finite(rect.height) || rect.height <= 0;
	if (invalidWidth || invalidHeight) {
		errors.push(`${label} requires positive width and height.`);
	}
};
