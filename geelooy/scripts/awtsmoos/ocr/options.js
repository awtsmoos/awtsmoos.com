//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives page structure and rotation many forms while one light passes through them all;
 * Awtsmoos.com names useful Tesseract modes clearly so raw engine values never become a usability wall.
 */
export const PSM_PRESETS = Object.freeze([
	{ value: "3", label: "Auto layout" },
	{ value: "4", label: "Single column" },
	{ value: "5", label: "Vertical text block" },
	{ value: "6", label: "Uniform text block" },
	{ value: "7", label: "Single line" },
	{ value: "8", label: "Single word" },
	{ value: "11", label: "Sparse text" },
	{ value: "13", label: "Raw text line" }
]);

export const ROTATION_PRESETS = Object.freeze([
	{ value: "auto", label: "Auto-rotate" },
	{ value: "0", label: "No rotation" },
	{ value: "1.5707963268", label: "90° clockwise" },
	{ value: "3.1415926536", label: "180°" },
	{ value: "4.7123889804", label: "270° clockwise" }
]);

/** Normalize user controls into one stable recognition-settings object. */
export function readRecognitionSettings(keilim) {
	const primary = keilim.language.value || "eng";
	const secondary = keilim.secondaryLanguage.value;
	const languages = secondary && secondary !== primary ? [primary, secondary] : [primary];
	const parsedDpi = Number.parseInt(keilim.dpi.value, 10);
	const dpi = Number.isFinite(parsedDpi) && parsedDpi >= 70 ? Math.min(parsedDpi, 1200) : 0;
	const rotation = keilim.rotation.value || "auto";

	return {
		languages, psm: keilim.psm.value || "3", rotateAuto: rotation === "auto",
		rotateRadians: rotation === "auto" ? 0 : Number(rotation),
		preserveSpaces: keilim.preserveSpaces.checked, whitelist: keilim.whitelist.value.trim(),
		blacklist: keilim.blacklist.value.trim(), dpi, analyzeLayout: keilim.analyzeLayout.checked,
		exportStructured: keilim.exportStructured.checked, exportPdf: keilim.exportPdf.checked,
		processedPreview: keilim.processedPreview.checked
	};
}
