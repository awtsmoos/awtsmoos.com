//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Minimal CSS color parsing + WCAG contrast for Layer 15 completeness.
 * @description Self-contained (no dependencies): parses hex, rgb()/rgba()
 * (comma and space syntax), hsl()/hsla(), and a basic named-color table.
 * Used to prove text is actually readable — never trust a theme, verify it.
 */

/** Basic named colors; extended set for common UI usage. */
const NAMED_COLORS = Object.freeze({
	black: [0, 0, 0], white: [255, 255, 255],
	red: [255, 0, 0], green: [0, 128, 0], blue: [0, 0, 255],
	yellow: [255, 255, 0], cyan: [0, 255, 255], magenta: [255, 0, 255],
	gray: [128, 128, 128], grey: [128, 128, 128],
	darkgray: [169, 169, 169], darkgrey: [169, 169, 169],
	lightgray: [211, 211, 211], lightgrey: [211, 211, 211],
	dimgray: [105, 105, 105], dimgrey: [105, 105, 105],
	silver: [192, 192, 192], maroon: [128, 0, 0],
	olive: [128, 128, 0], lime: [0, 255, 0],
	aqua: [0, 255, 255], teal: [0, 128, 128],
	navy: [0, 0, 128], fuchsia: [255, 0, 255],
	purple: [128, 0, 128], orange: [255, 165, 0],
	pink: [255, 192, 203], brown: [165, 42, 42],
	coral: [255, 127, 80], crimson: [220, 20, 60],
	gold: [255, 215, 0], goldenrod: [218, 165, 32],
	indigo: [75, 0, 130], ivory: [255, 255, 240],
	khaki: [240, 230, 140], lavender: [230, 230, 250],
	beige: [245, 245, 220], wheat: [245, 222, 179],
	tan: [210, 180, 140], salmon: [250, 128, 114],
	transparent: [0, 0, 0, 0]
});

/**
 * Parses a CSS color value into {r, g, b, a}.
 * Handles var() with fallback (uses the fallback), hex (#rgb, #rrggbb,
 * #rgba, #rrggbbaa), rgb()/rgba() comma + space syntax, hsl()/hsla(),
 * and named colors. Returns null when the value cannot be resolved to a
 * concrete color (var() without fallback, currentColor, inherit, etc.).
 * @param {string} value Raw CSS value.
 * @returns {{r:number,g:number,b:number,a:number}|null}
 */
export function parseColor(value) {
	if (typeof value !== "string") return null;
	let text = value.trim().toLowerCase();
	if (!text) return null;
	// Strip !important.
	text = text.replace(/\s*!important\s*$/, "").trim();

	// var(--x, fallback) → resolve via fallback.
	if (text.startsWith("var(")) {
		const inner = text.slice(4, text.lastIndexOf(")"));
		const comma = findTopComma(inner);
		if (comma === -1) return null; // var() without fallback: unresolvable.
		return parseColor(inner.slice(comma + 1));
	}
	if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
	if (/^(currentcolor|inherit|initial|unset|revert)$/.test(text)) return null;
	if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, text)) {
		const c = NAMED_COLORS[text];
		return { r: c[0], g: c[1], b: c[2], a: c.length > 3 ? c[3] : 1 };
	}
	if (text[0] === "#") return parseHex(text);
	if (/^rgba?\(/.test(text)) return parseRgbFn(text);
	if (/^hsla?\(/.test(text)) return parseHslFn(text);
	return null;
}

/** Finds the first top-level comma (paren-aware). Returns -1 if none. */
function findTopComma(text) {
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === "(") depth++;
		else if (ch === ")") depth = Math.max(0, depth - 1);
		else if (ch === "," && depth === 0) return i;
	}
	return -1;
}

function parseHex(text) {
	const hex = text.slice(1);
	if (!/^[0-9a-f]+$/.test(hex)) return null;
	let r, g, b, a = 1;
	if (hex.length === 3 || hex.length === 4) {
		r = parseInt(hex[0] + hex[0], 16);
		g = parseInt(hex[1] + hex[1], 16);
		b = parseInt(hex[2] + hex[2], 16);
		if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
	} else if (hex.length === 6 || hex.length === 8) {
		r = parseInt(hex.slice(0, 2), 16);
		g = parseInt(hex.slice(2, 4), 16);
		b = parseInt(hex.slice(4, 6), 16);
		if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
	} else {
		return null;
	}
	return { r, g, b, a };
}

function parseComponent(token, max) {
	token = token.trim();
	if (token.endsWith("%")) {
		const n = parseFloat(token);
		return Number.isFinite(n) ? (n / 100) * max : NaN;
	}
	const n = parseFloat(token);
	return Number.isFinite(n) ? n : NaN;
}

function parseAlpha(token) {
	token = token.trim();
	if (token.endsWith("%")) {
		const n = parseFloat(token);
		return Number.isFinite(n) ? n / 100 : NaN;
	}
	const n = parseFloat(token);
	return Number.isFinite(n) ? n : NaN;
}

function splitFnArgs(text) {
	const open = text.indexOf("(");
	const close = text.lastIndexOf(")");
	if (open === -1 || close === -1) return null;
	const inner = text.slice(open + 1, close).trim();
	// Space syntax may use "/" before alpha: rgb(1 5 13 / 52%).
	const [main, alphaPart] = inner.split(/\s*\/\s*/);
	const parts = main.includes(",")
		? main.split(",").map((p) => p.trim()).filter(Boolean)
		: main.split(/\s+/).filter(Boolean);
	return { parts, alphaPart: alphaPart !== undefined ? alphaPart.trim() : null };
}

function parseRgbFn(text) {
	const parsed = splitFnArgs(text);
	if (!parsed || parsed.parts.length < 3) return null;
	const r = parseComponent(parsed.parts[0], 255);
	const g = parseComponent(parsed.parts[1], 255);
	const b = parseComponent(parsed.parts[2], 255);
	if (![r, g, b].every(Number.isFinite)) return null;
	let a = 1;
	const alphaToken = parsed.alphaPart !== null
		? parsed.alphaPart
		: parsed.parts[3] !== undefined ? parsed.parts[3] : null;
	if (alphaToken !== null) {
		a = parseAlpha(alphaToken);
		if (!Number.isFinite(a)) return null;
	}
	return { r: clamp255(r), g: clamp255(g), b: clamp255(b), a: Math.min(1, Math.max(0, a)) };
}

function parseHslFn(text) {
	const parsed = splitFnArgs(text);
	if (!parsed || parsed.parts.length < 3) return null;
	const h = parseFloat(parsed.parts[0]);
	const s = parseComponent(parsed.parts[1], 1);
	const l = parseComponent(parsed.parts[2], 1);
	if (![h, s, l].every(Number.isFinite)) return null;
	let a = 1;
	const alphaToken = parsed.alphaPart !== null
		? parsed.alphaPart
		: parsed.parts[3] !== undefined ? parsed.parts[3] : null;
	if (alphaToken !== null) {
		a = parseAlpha(alphaToken);
		if (!Number.isFinite(a)) return null;
	}
	const [r, g, b] = hslToRgb(((h % 360) + 360) % 360, s, l);
	return { r, g, b, a: Math.min(1, Math.max(0, a)) };
}

function hslToRgb(h, s, l) {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let rp, gp, bp;
	if (h < 60) [rp, gp, bp] = [c, x, 0];
	else if (h < 120) [rp, gp, bp] = [x, c, 0];
	else if (h < 180) [rp, gp, bp] = [0, c, x];
	else if (h < 240) [rp, gp, bp] = [0, x, c];
	else if (h < 300) [rp, gp, bp] = [x, 0, c];
	else [rp, gp, bp] = [c, 0, x];
	return [clamp255((rp + m) * 255), clamp255((gp + m) * 255), clamp255((bp + m) * 255)];
}

function clamp255(n) {
	return Math.min(255, Math.max(0, Math.round(n)));
}

/** WCAG relative luminance of an {r,g,b} color (0..1). */
export function luminance(color) {
	const f = (v) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * f(color.r) + 0.7152 * f(color.g) + 0.0722 * f(color.b);
}

/**
 * WCAG contrast ratio between two colors (1..21). Returns null when either
 * color is missing or either is semi-transparent (alpha < 1) — blending
 * against an unknown backdrop cannot be proven statically.
 * @param {{r,g,b,a}} a
 * @param {{r,g,b,a}} b
 * @returns {number|null}
 */
export function contrastRatio(a, b) {
	if (!a || !b) return null;
	if (a.a < 1 || b.a < 1) return null;
	const l1 = luminance(a);
	const l2 = luminance(b);
	const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * True when the color is opaque (alpha >= 1) and parseable.
 * @param {{r,g,b,a}|null} color
 */
export function isOpaque(color) {
	return !!color && color.a >= 1;
}

/**
 * Extracts a solid color from a `background` shorthand value.
 * Returns {kind:"color", color} for a solid color, {kind:"complex"} when the
 * background uses gradients/images (color cannot be proven statically),
 * {kind:"none"} for transparent/none, or {kind:"unknown"} when unparseable.
 * @param {string} value Raw background shorthand value.
 */
export function backgroundKind(value) {
	if (typeof value !== "string") return { kind: "unknown" };
	const text = value.replace(/\s*!important\s*$/, "").trim().toLowerCase();
	if (!text || text === "none" || text === "transparent") return { kind: "none" };
	if (/url\(|gradient\(|image-set\(/.test(text)) return { kind: "complex" };
	// Scan whitespace/comma-separated tokens for the first parseable color.
	const tokens = text.split(/[\s,]+/).filter(Boolean);
	for (const token of tokens) {
		if (/^(repeat|no-repeat|scroll|fixed|cover|contain|center|left|right|top|bottom|\d)/.test(token)) continue;
		const color = parseColor(token);
		if (color) return { kind: "color", color };
	}
	// Fallback: the whole value might be a single color function with spaces.
	const whole = parseColor(text);
	if (whole) return { kind: "color", color: whole };
	return { kind: "unknown" };
}
