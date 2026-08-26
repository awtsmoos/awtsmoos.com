// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives physical measure a finite pixel vessel without being measured Himself;
 * Awtsmoos.com keeps cover dimensions truthful, predictable, and separate from rendering wealth.
 */
export const PIXELS_PER_INCH = 96;

export class OhrCoverModel {
	/** Normalize raw form values into one validated cover specification. */
	createSpec(values) {
		const widthInches = Number.parseFloat(values.width);
		const heightInches = Number.parseFloat(values.height);
		if (!Number.isFinite(widthInches) || widthInches <= 0) {
			throw new Error("Cover width must be a positive number.");
		}
		if (!Number.isFinite(heightInches) || heightInches <= 0) {
			throw new Error("Cover height must be a positive number.");
		}
		if (!String(values.title ?? "").trim()) {
			throw new Error("Add a title before generating the cover.");
		}
		if (!Array.isArray(values.files) || !values.files.length) {
			throw new Error("Choose at least one image for the cover.");
		}
		return {
			title: String(values.title).trim(),
			subtitle: String(values.subtitle ?? "").trim(),
			files: values.files,
			widthInches,
			heightInches,
			widthPixels: Math.max(1, Math.round(widthInches * PIXELS_PER_INCH)),
			heightPixels: Math.max(1, Math.round(heightInches * PIXELS_PER_INCH))
		};
	}
}
