// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounds inline CSS that may survive rich-text import and editing in Awtsmoos Docs.
 * @description The Awtsmoos is beyond every garment; Awtsmoos.com allows useful
 * typography through a narrow gate so color, font, and emphasis may shine without executable style tricks.
 */
const FONT_FAMILIES = new Set([
	"arial",
	"aptos",
	"calibri",
	"georgia",
	"times new roman",
	"verdana",
	"system-ui",
	"serif",
	"sans-serif",
	"monospace"
]);

const FONT_SIZE_KEYWORDS = new Set([
	"xx-small",
	"x-small",
	"small",
	"medium",
	"large",
	"x-large",
	"xx-large",
	"xxx-large"
]);

export function sanitizeInlineStyle(property, value) {
	const name = String(property || "").toLowerCase();
	const clean = String(value || "").trim();
	if (!clean || unsafeStyleText(clean)) return "";
	if (["background-color", "color"].includes(name)) return safeColor(clean);
	if (name === "text-align") return safeAlignment(clean);
	if (name === "font-family") return safeFontFamily(clean);
	if (name === "font-size") return safeFontSize(clean);
	if (name === "letter-spacing") return safeSpacing(clean, -0.1, 1);
	return "";
}

function safeColor(value) {
	return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|[a-z]{3,24})$/i.test(value)
		? value
		: "";
}

function safeAlignment(value) {
	return ["left", "center", "right", "justify", "start", "end"].includes(value)
		? value
		: "";
}

function safeFontFamily(value) {
	const family = value.replace(/["']/g, "").split(",")[0].trim().toLowerCase();
	return FONT_FAMILIES.has(family) ? value : "";
}

function safeFontSize(value) {
	if (FONT_SIZE_KEYWORDS.has(value.toLowerCase())) return value;
	const match = value.match(/^(\d+(?:\.\d+)?)(px|pt|em|rem|%)$/i);
	if (!match) return "";
	const numeric = Number(match[1]);
	return numeric > 0 && numeric <= 200 ? value : "";
}

function safeSpacing(value, minimum, maximum) {
	const match = value.match(/^(-?\d+(?:\.\d+)?)(em|rem|px|pt)$/i);
	if (!match) return "";
	const numeric = Number(match[1]);
	return numeric >= minimum && numeric <= maximum ? value : "";
}

function unsafeStyleText(value) {
	return /(url\s*\(|expression\s*\(|javascript:|var\s*\(|calc\s*\()/i.test(value);
}
