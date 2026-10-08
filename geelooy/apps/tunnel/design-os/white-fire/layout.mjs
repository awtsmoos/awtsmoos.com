//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layout model for White Fire analysis.
 * @description A layout is plain JSON — no browser needed. White Fire measures
 * the VOID: the whitespace between and around elements.
 *
 *   {
 *     viewport: { width: 1280, height: 800 },
 *     baseUnit: 8,                       // rhythm base unit in px (default 8)
 *     elements: [
 *       {
 *         id: "title",                   // required, unique
 *         role: "title",                 // title|body|section|footnote|hero|block
 *         box: { x: 100, y: 40, w: 800, h: 80 },   // border box
 *         margin: { top: 0, right: 0, bottom: 40, left: 0 }, // declared; default 0
 *         padding: { top: 0, right: 0, bottom: 0, left: 0 }, // declared; default 0
 *         gapAfter: 0                   // declared spacing to next sibling (flex gap); default 0
 *       }
 *     ]
 *   }
 *
 * Declared spacing (margin/padding/gapAfter) is what the design ASKED for.
 * The detector compares it against the rendered geometry to find accidental gaps.
 */

/** Non-negative finite number, or throw. */
function num(v, name) {
	if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
		throw new Error(`white-fire layout: '${name}' must be a non-negative finite number, got ${JSON.stringify(v)}`);
	}
	return v;
}

function box(b, name) {
	if (!b || typeof b !== "object") {
		throw new Error(`white-fire layout: '${name}' must be an object {x,y,w,h}`);
	}
	return {
		x: num(b.x, `${name}.x`),
		y: num(b.y, `${name}.y`),
		w: num(b.w, `${name}.w`),
		h: num(b.h, `${name}.h`),
	};
}

const SIDES = ["top", "right", "bottom", "left"];

function sides(s, name) {
	const out = { top: 0, right: 0, bottom: 0, left: 0 };
	if (s === undefined || s === null) return out;
	if (typeof s === "number") {
		const v = num(s, name);
		return { top: v, right: v, bottom: v, left: v };
	}
	if (typeof s !== "object") {
		throw new Error(`white-fire layout: '${name}' must be a number or {top,right,bottom,left}`);
	}
	for (const k of SIDES) {
		if (s[k] !== undefined) out[k] = num(s[k], `${name}.${k}`);
	}
	return out;
}

/**
 * Validates and normalizes a layout object. Throws on invalid input.
 * @param {Object} input Raw layout JSON.
 * @returns {{viewport:{width,height}, baseUnit:number, elements:Array}}
 */
export function normalizeLayout(input) {
	if (!input || typeof input !== "object") {
		throw new Error("white-fire layout: input must be an object");
	}
	if (!input.viewport || typeof input.viewport !== "object") {
		throw new Error("white-fire layout: 'viewport' must be an object {width,height}");
	}
	const viewport = {
		width: num(input.viewport.width, "viewport.width"),
		height: num(input.viewport.height, "viewport.height"),
	};
	if (viewport.width === 0 || viewport.height === 0) {
		throw new Error("white-fire layout: viewport must have positive width and height");
	}
	const baseUnit = input.baseUnit === undefined ? 8 : num(input.baseUnit, "baseUnit");
	if (baseUnit === 0) throw new Error("white-fire layout: baseUnit must be positive");
	if (!Array.isArray(input.elements)) {
		throw new Error("white-fire layout: 'elements' must be an array");
	}
	const seen = new Set();
	const elements = input.elements.map((e, i) => {
		if (!e || typeof e !== "object") {
			throw new Error(`white-fire layout: elements[${i}] must be an object`);
		}
		if (typeof e.id !== "string" || e.id.length === 0) {
			throw new Error(`white-fire layout: elements[${i}].id must be a non-empty string`);
		}
		if (seen.has(e.id)) {
			throw new Error(`white-fire layout: duplicate element id '${e.id}'`);
		}
		seen.add(e.id);
		return {
			id: e.id,
			role: typeof e.role === "string" && e.role.length > 0 ? e.role : "block",
			box: box(e.box, `elements[${i}].box`),
			margin: sides(e.margin, `elements[${i}].margin`),
			padding: sides(e.padding, `elements[${i}].padding`),
			gapAfter: e.gapAfter === undefined || e.gapAfter === null ? 0 : num(e.gapAfter, `elements[${i}].gapAfter`),
		};
	});
	return { viewport, baseUnit, elements };
}

/** Area of one box. */
export function boxArea(b) {
	return b.w * b.h;
}

/**
 * Union area of boxes via plane subdivision on box edges.
 * Exact for axis-aligned rectangles; O(cells × boxes).
 */
export function unionArea(boxes) {
	if (boxes.length === 0) return 0;
	const xs = new Set();
	const ys = new Set();
	for (const b of boxes) {
		xs.add(b.x);
		xs.add(b.x + b.w);
		ys.add(b.y);
		ys.add(b.y + b.h);
	}
	const X = [...xs].sort((a, b) => a - b);
	const Y = [...ys].sort((a, b) => a - b);
	let area = 0;
	for (let i = 0; i < X.length - 1; i++) {
		for (let j = 0; j < Y.length - 1; j++) {
			const cx = (X[i] + X[i + 1]) / 2;
			const cy = (Y[j] + Y[j + 1]) / 2;
			const covered = boxes.some(
				(b) => cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h
			);
			if (covered) area += (X[i + 1] - X[i]) * (Y[j + 1] - Y[j]);
		}
	}
	return area;
}

/** Elements sorted by top edge, then left edge. */
export function sortedByY(elements) {
	return [...elements].sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
}

/** Find element by id; throws if missing. */
export function elementById(layout, id) {
	const el = layout.elements.find((e) => e.id === id);
	if (!el) throw new Error(`white-fire: unknown element id '${id}'`);
	return el;
}
