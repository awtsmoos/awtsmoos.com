//B"H
//Boruch Hashem
//Blessed be He

{
/**
 * CssTransform — parses the CSS `transform` property into 2D matrices and
 * applies them to points and rectangles.
 *
 * Supported functions: translate, translateX, translateY, translate3d (z ignored),
 * rotate, scale, scaleX, scaleY, scale3d (z ignored), skew, skewX, skewY,
 * matrix. Angles accept deg/rad/grad/turn. Lengths accept px/%/em/rem
 * (percentages resolve against the reference box).
 *
 * Matrix layout is the CSS 2D form [a, b, c, d, e, f]:
 *   x' = a*x + c*y + e
 *   y' = b*x + d*y + f
 *
 * Integration: VirtualWebGLBoxRenderer can replace its regex translate
 * extraction with computeTransformMatrix(style, box) for full fidelity.
 * transform-origin is honored; default is 50% 50%.
 */

function parseTransform(value) {
	const text = String(value || "").trim();
	if (!text || text.toLowerCase() === "none") return [];
	const out = [];
	const re = /([a-zA-Z][a-zA-Z0-9]*)\s*\(/g;
	let match;
	while ((match = re.exec(text))) {
		const name = match[1].toLowerCase();
		const openAt = match.index + match[0].length - 1;
		const closeAt = balancedParenEnd(text, openAt);
		if (closeAt < 0) break;
		const args = splitTopLevelArgs(text.slice(openAt + 1, closeAt));
		out.push(Object.freeze({ args, name }));
		re.lastIndex = closeAt + 1;
	}
	return out;
}

function balancedParenEnd(text, openAt) {
	let depth = 0;
	for (let at = openAt; at < text.length; at += 1) {
		if (text[at] === "(") depth += 1;
		else if (text[at] === ")") {
			depth -= 1;
			if (depth === 0) return at;
		}
	}
	return -1;
}

function splitTopLevelArgs(text) {
	const parts = [];
	let start = 0;
	let depth = 0;
	for (let at = 0; at <= text.length; at += 1) {
		const ch = text[at];
		if (ch === "(") depth += 1;
		if (ch === ")") depth = Math.max(0, depth - 1);
		if ((at === text.length || ch === ",") && depth === 0) {
			const part = text.slice(start, at).trim();
			if (part) parts.push(part);
			start = at + 1;
		}
	}
	return parts;
}

/** Resolves a CSS length to px. Percentages use `percentBase`. */
function lengthToPx(text, percentBase = 0, fontSize = 16) {
	const t = String(text || "").trim().toLowerCase();
	if (!t) return 0;
	if (t.endsWith("%")) return (parseFloat(t) || 0) / 100 * percentBase;
	if (t.endsWith("px")) return parseFloat(t) || 0;
	if (t.endsWith("em") || t.endsWith("rem")) return (parseFloat(t) || 0) * fontSize;
	if (t.endsWith("pt")) return (parseFloat(t) || 0) * 96 / 72;
	const n = parseFloat(t);
	return Number.isFinite(n) ? n : 0;
}

/** Converts a CSS angle to radians. */
function angleToRad(text) {
	const t = String(text || "").trim().toLowerCase();
	if (t.endsWith("deg")) return (parseFloat(t) || 0) * Math.PI / 180;
	if (t.endsWith("grad")) return (parseFloat(t) || 0) * Math.PI / 200;
	if (t.endsWith("turn")) return (parseFloat(t) || 0) * Math.PI * 2;
	if (t.endsWith("rad")) return parseFloat(t) || 0;
	const n = parseFloat(t);
	return Number.isFinite(n) ? n : 0;
}

function identityMatrix() {
	return [1, 0, 0, 1, 0, 0];
}

/** Multiplies m1 * m2 (apply m2 first, then m1). */
function multiplyMatrix(m1, m2) {
	const [a1, b1, c1, d1, e1, f1] = m1;
	const [a2, b2, c2, d2, e2, f2] = m2;
	return [
		a1 * a2 + c1 * b2,
		b1 * a2 + d1 * b2,
		a1 * c2 + c1 * d2,
		b1 * c2 + d1 * d2,
		a1 * e2 + c1 * f2 + e1,
		b1 * e2 + d1 * f2 + f1
	];
}

function translateMatrix(tx, ty) { return [1, 0, 0, 1, tx, ty]; }
function scaleMatrix(sx, sy) { return [sx, 0, 0, sy, 0, 0]; }
function rotateMatrix(rad) {
	const c = Math.cos(rad);
	const s = Math.sin(rad);
	return [c, s, -s, c, 0, 0];
}
function skewMatrix(axRad, ayRad) {
	return [1, Math.tan(ayRad), Math.tan(axRad), 1, 0, 0];
}

/** Builds the matrix for one parsed transform function. */
function functionToMatrix(fn, refBox = {}) {
	const width = Number(refBox.width) || 0;
	const height = Number(refBox.height) || 0;
	const fontSize = Number(refBox.fontSize) || 16;
	const len = (t, base) => lengthToPx(t, base, fontSize);
	switch (fn.name) {
		case "translate":
			return translateMatrix(len(fn.args[0], width), len(fn.args[1], height));
		case "translatex":
			return translateMatrix(len(fn.args[0], width), 0);
		case "translatey":
			return translateMatrix(0, len(fn.args[0], height));
		case "translate3d":
			return translateMatrix(len(fn.args[0], width), len(fn.args[1], height));
		case "rotate":
			return rotateMatrix(angleToRad(fn.args[0]));
		case "scale": {
			const sx = parseFloat(fn.args[0]);
			const sy = fn.args.length > 1 ? parseFloat(fn.args[1]) : sx;
			return scaleMatrix(Number.isFinite(sx) ? sx : 1, Number.isFinite(sy) ? sy : 1);
		}
		case "scalex":
			return scaleMatrix(parseFloat(fn.args[0]) || 1, 1);
		case "scaley":
			return scaleMatrix(1, parseFloat(fn.args[0]) || 1);
		case "scale3d":
			return scaleMatrix(parseFloat(fn.args[0]) || 1, parseFloat(fn.args[1]) || 1);
		case "skew":
			return skewMatrix(angleToRad(fn.args[0]), angleToRad(fn.args[1] || "0"));
		case "skewx":
			return skewMatrix(angleToRad(fn.args[0]), 0);
		case "skewy":
			return skewMatrix(0, angleToRad(fn.args[0]));
		case "matrix": {
			const v = fn.args.map(a => parseFloat(a));
			if (v.length < 6 || v.some(n => !Number.isFinite(n))) return identityMatrix();
			return [v[0], v[1], v[2], v[3], v[4], v[5]];
		}
		default:
			return identityMatrix();
	}
}

/**
 * Parses `transform-origin` into a px point inside refBox.
 * Accepts keywords (left/center/right/top/bottom), lengths, and percentages.
 */
function parseTransformOrigin(value, refBox = {}) {
	const width = Number(refBox.width) || 0;
	const height = Number(refBox.height) || 0;
	const fontSize = Number(refBox.fontSize) || 16;
	const parts = String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
	const keywordX = { left: 0, center: width / 2, right: width };
	const keywordY = { top: 0, center: height / 2, bottom: height };
	const resolveX = t => (t in keywordX ? keywordX[t] : lengthToPx(t, width, fontSize));
	const resolveY = t => (t in keywordY ? keywordY[t] : lengthToPx(t, height, fontSize));
	if (!parts.length) return { x: width / 2, y: height / 2 };
	if (parts.length === 1) {
		const t = parts[0];
		if (t === "left" || t === "right") return { x: resolveX(t), y: height / 2 };
		if (t === "top" || t === "bottom") return { x: width / 2, y: resolveY(t) };
		return { x: resolveX(t), y: height / 2 };
	}
	return { x: resolveX(parts[0]), y: resolveY(parts[1]) };
}

/**
 * Computes the final 2D matrix for a computed style object and reference box.
 * Honors transform-origin. Returns identity when no transform applies.
 */
function computeTransformMatrix(style = {}, refBox = {}) {
	const list = parseTransform(style.transform);
	if (!list.length) return identityMatrix();
	let m = identityMatrix();
	for (const fn of list) m = multiplyMatrix(functionToMatrix(fn, refBox), m);
	const origin = parseTransformOrigin(style["transform-origin"], refBox);
	const ox = origin.x;
	const oy = origin.y;
	return multiplyMatrix(
		translateMatrix(ox, oy),
		multiplyMatrix(m, translateMatrix(-ox, -oy))
	);
}

function applyMatrixToPoint(m, x, y) {
	return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** Returns the axis-aligned bounding box of a transformed rectangle. */
function transformRect(m, x, y, width, height) {
	const corners = [
		applyMatrixToPoint(m, x, y),
		applyMatrixToPoint(m, x + width, y),
		applyMatrixToPoint(m, x, y + height),
		applyMatrixToPoint(m, x + width, y + height)
	];
	const xs = corners.map(p => p[0]);
	const ys = corners.map(p => p[1]);
	const minX = Math.min(...xs);
	const minY = Math.min(...ys);
	return {
		height: Math.max(...ys) - minY,
		width: Math.max(...xs) - minX,
		x: minX,
		y: minY
	};
}

function matrixToCss(m) {
	const r = n => Math.round(n * 100000) / 100000;
	return `matrix(${r(m[0])}, ${r(m[1])}, ${r(m[2])}, ${r(m[3])}, ${r(m[4])}, ${r(m[5])})`;
}

const AwtsExports = {
	angleToRad,
	applyMatrixToPoint,
	computeTransformMatrix,
	functionToMatrix,
	identityMatrix,
	lengthToPx,
	matrixToCss,
	multiplyMatrix,
	parseTransform,
	parseTransformOrigin,
	transformRect
};
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
