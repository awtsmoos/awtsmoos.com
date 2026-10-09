//B"H
//Boruch Hashem
//Blessed be He

{
/** Expands core paint shorthands into properties consumed by the retained renderer. */
function expandCssDeclarations(style) {
	const out = { ...(style || {}) };
	if (out.background) expandBackground(out, out.background);
	if (out.border) expandBorder(out, "", out.border);
	for (const side of ["left", "right", "top", "bottom"]) {
		const key = `border-${side}`;
		if (out[key]) expandBorder(out, `-${side}`, out[key]);
	}
	if (out.margin) expandBoxShorthand(out, "margin", out.margin);
	if (out.padding) expandBoxShorthand(out, "padding", out.padding);
	if (out.flex) expandFlex(out, out.flex);
	return out;
}

/** Expands margin/padding 1-4 value shorthands into per-side properties. */
function expandBoxShorthand(out, base, value) {
	const parts = splitWhitespaceOutsideFunctions(value);
	if (!parts.length) return;
	const [top, right = top, bottom = top, left = right] = parts;
	if (!out[`${base}-top`]) out[`${base}-top`] = top;
	if (!out[`${base}-right`]) out[`${base}-right`] = right;
	if (!out[`${base}-bottom`]) out[`${base}-bottom`] = bottom;
	if (!out[`${base}-left`]) out[`${base}-left`] = left;
}

/** Expands the `flex` shorthand into flex-grow/shrink/basis. */
function expandFlex(out, value) {
	const text = String(value || "").trim().toLowerCase();
	if (!text) return;
	if (text === "none") {
		if (!out["flex-grow"]) out["flex-grow"] = "0";
		if (!out["flex-shrink"]) out["flex-shrink"] = "0";
		if (!out["flex-basis"]) out["flex-basis"] = "auto";
		return;
	}
	if (text === "auto") {
		if (!out["flex-grow"]) out["flex-grow"] = "1";
		if (!out["flex-shrink"]) out["flex-shrink"] = "1";
		if (!out["flex-basis"]) out["flex-basis"] = "auto";
		return;
	}
	const parts = splitWhitespaceOutsideFunctions(value);
	const isNumber = t => /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(t);
	if (parts.length === 1 && isNumber(parts[0])) {
		if (!out["flex-grow"]) out["flex-grow"] = parts[0];
		if (!out["flex-shrink"]) out["flex-shrink"] = "1";
		if (!out["flex-basis"]) out["flex-basis"] = "0%";
		return;
	}
	if (parts.length >= 1 && isNumber(parts[0])) {
		if (!out["flex-grow"]) out["flex-grow"] = parts[0];
		if (parts.length >= 2 && isNumber(parts[1]) && !out["flex-shrink"]) out["flex-shrink"] = parts[1];
		if (parts.length >= 3 && !out["flex-basis"]) out["flex-basis"] = parts.slice(2).join(" ");
		return;
	}
	if (!out["flex-basis"]) out["flex-basis"] = value;
	if (!out["flex-grow"]) out["flex-grow"] = "1";
	if (!out["flex-shrink"]) out["flex-shrink"] = "1";
}

function expandBackground(out, value) {
	if (!out["background-image"]) {
		const image = firstImage(value);
		if (image) out["background-image"] = image;
	}
	if (!out["background-color"]) {
		const color = lastColorCandidate(value);
		if (color) out["background-color"] = color;
	}
}

function expandBorder(out, suffix, value) {
	const widthKey = `border${suffix}-width`;
	const colorKey = `border${suffix}-color`;
	const parts = splitWhitespaceOutsideFunctions(value);
	if (!out[widthKey]) out[widthKey] = parts.find(isBorderWidth) || value;
	if (!out[colorKey]) out[colorKey] = parts.find(isColorCandidate) || value;
}

function firstImage(value) {
	const text = String(value || "");
	for (const name of ["linear-gradient", "radial-gradient", "conic-gradient", "url"]) {
		const at = text.toLowerCase().indexOf(`${name}(`);
		if (at < 0) continue;
		const end = balancedFunctionEnd(text, at + name.length);
		if (end > at) return text.slice(at, end);
	}
	return "";
}

function lastColorCandidate(value) {
	const parts = splitWhitespaceOutsideFunctions(value);
	for (let index = parts.length - 1; index >= 0; index -= 1) {
		if (isColorCandidate(parts[index])) return parts[index];
	}
	return "";
}

function splitWhitespaceOutsideFunctions(value) {
	const text = String(value || "");
	const parts = [];
	let start = 0;
	let depth = 0;
	for (let at = 0; at <= text.length; at += 1) {
		if (text[at] === "(") depth += 1;
		if (text[at] === ")") depth = Math.max(0, depth - 1);
		if ((at === text.length || isSpace(text[at])) && depth === 0) {
			const part = text.slice(start, at).trim();
			if (part) parts.push(part);
			while (isSpace(text[at + 1])) at += 1;
			start = at + 1;
		}
	}
	return parts;
}

function balancedFunctionEnd(text, openAt) {
	let depth = 0;
	for (let at = openAt; at < text.length; at += 1) {
		if (text[at] === "(") depth += 1;
		if (text[at] === ")") depth -= 1;
		if (depth === 0) return at + 1;
	}
	return text.length;
}

function isBorderWidth(value) {
	return value === "thin" || value === "medium" || value === "thick" || /^(?:\d|\.)/.test(value);
}

function isColorCandidate(value) {
	const lower = String(value || "").toLowerCase();
	return lower.startsWith("#") || lower.startsWith("rgb(") || lower.startsWith("rgba(") || lower.startsWith("hsl(") || lower.startsWith("hsla(") || /^[a-z-]+$/.test(lower);
}

function isSpace(character) {
	return character === " " || character === "\n" || character === "\r" || character === "\t";
}

const AwtsExports = { expandCssDeclarations };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
