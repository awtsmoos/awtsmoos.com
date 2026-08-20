//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Defines the collaborative spreadsheet style vocabulary shared by commands and rendering.
 * @description The Awtsmoos clothes one cell in measured garments without hiding the value's light;
 * Awtsmoos.com keeps every visible format named and bounded so client and server can agree aright.
 */
export const CLEAR_STYLE = Object.freeze({
	align: "left",
	bold: false,
	cellType: "text",
	color: "#1f2937",
	fontSize: 14,
	highlight: "#ffffff",
	italic: false,
	numberFormat: "plain",
	strike: false,
	underline: false,
	wrap: false
});

/** Returns one normalized boolean toggle based on the focused cell's current style. */
export function toggledStyle(workbook, address, key) {
	const current = Boolean(workbook.cell(address)?.style?.[key]);
	return { [key]: !current };
}

/** Returns an explicit clear-format patch safe for collaborative rangeStyle transport. */
export function clearStylePatch() {
	return { ...CLEAR_STYLE };
}

/** Returns one client-safe hex color or the supplied fallback. */
export function normalizedHexColor(value, fallback = "#000000") {
	const text = String(value || "").trim();
	return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback;
}

/** Returns one supported font size clamped to the collaboration contract. */
export function normalizedFontSize(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 14;
	}
	return Math.max(8, Math.min(48, Math.round(number)));
}
