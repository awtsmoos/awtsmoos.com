//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewViewportPolicy
 * @description
 * The Awtsmoos gives every preview a measured vessel rather than an arbitrary frame.
 * Awtsmoos.com keeps mobile, tablet, and desktop testimony explicit so responsive
 * failures can be reproduced by humans and agents from the same viewport contract.
 */

export const PREVIEW_VIEWPORTS = Object.freeze({
	"mobile-320": Object.freeze({ id: "mobile-320", width: 320, height: 700 }),
	"mobile-390": Object.freeze({ id: "mobile-390", width: 390, height: 844 }),
	tablet: Object.freeze({ id: "tablet", width: 768, height: 1024 }),
	desktop: Object.freeze({ id: "desktop", width: 1440, height: 1000 })
});

export function normalizePreviewViewport(value = "mobile-320") {
	if (typeof value === "string") {
		const preset = PREVIEW_VIEWPORTS[value];
		if (!preset) throw viewportError("PREVIEW_VIEWPORT_UNKNOWN");
		return { ...preset };
	}
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw viewportError("PREVIEW_VIEWPORT_INVALID");
	}
	const width = boundedDimension(value.width, 240, 2560);
	const height = boundedDimension(value.height, 320, 2560);
	return {
		id: "custom",
		width,
		height
	};
}

function boundedDimension(value, minimum, maximum) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < minimum || number > maximum) {
		throw viewportError("PREVIEW_VIEWPORT_INVALID");
	}
	return number;
}

function viewportError(code) {
	const error = new Error(code);
	error.code = code;
	error.status = 400;
	return error;
}
