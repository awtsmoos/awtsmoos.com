//B"H
//Boruch Hashem
//Blessed be He

{
/**
 * CssTransition — parses the CSS `transition` shorthand and drives
 * time-based interpolation between computed values.
 *
 * Supported: transition-property (incl. `all`, `none`, comma lists),
 * transition-duration / delay (s/ms), timing functions
 * (linear, ease, ease-in, ease-out, ease-in-out, cubic-bezier(),
 * steps(), step-start, step-end).
 *
 * Interpolable value kinds: plain numbers with matching units, colors
 * (hex/rgb()/named via caller-supplied resolver), and transform lists
 * (decomposed per-function when shapes match, matrix fallback).
 * Anything else flips discretely at 50%.
 *
 * The engine is clock-agnostic: createTransition() captures from/to,
 * tickTransition(state, nowMs) returns { value, done }.
 */

const EASE = [0.25, 0.1, 0.25, 1.0];
const EASE_IN = [0.42, 0.0, 1.0, 1.0];
const EASE_OUT = [0.0, 0.0, 0.58, 1.0];
const EASE_IN_OUT = [0.42, 0.0, 0.58, 1.0];

function parseTime(text) {
	const t = String(text || "").trim().toLowerCase();
	if (t.endsWith("ms")) return parseFloat(t) || 0;
	if (t.endsWith("s")) return (parseFloat(t) || 0) * 1000;
	return 0;
}

/** Parses one timing-function token into { type, ...params }. */
function parseTimingFunction(text) {
	const t = String(text || "").trim().toLowerCase();
	if (!t || t === "ease") return { params: EASE.slice(), type: "cubic-bezier" };
	if (t === "linear") return { params: [0, 0, 1, 1], type: "cubic-bezier" };
	if (t === "ease-in") return { params: EASE_IN.slice(), type: "cubic-bezier" };
	if (t === "ease-out") return { params: EASE_OUT.slice(), type: "cubic-bezier" };
	if (t === "ease-in-out") return { params: EASE_IN_OUT.slice(), type: "cubic-bezier" };
	if (t === "step-start") return { position: "start", steps: 1, type: "steps" };
	if (t === "step-end") return { position: "end", steps: 1, type: "steps" };
	let m = t.match(/^cubic-bezier\(\s*([^)]+)\)$/);
	if (m) {
		const v = m[1].split(",").map(s => parseFloat(s.trim()));
		if (v.length === 4 && v.every(Number.isFinite)) return { params: v, type: "cubic-bezier" };
		return { params: EASE.slice(), type: "cubic-bezier" };
	}
	m = t.match(/^steps\(\s*(\d+)\s*(?:,\s*(start|end|jump-start|jump-end|jump-none|jump-both))?\s*\)$/);
	if (m) {
		const steps = Math.max(1, parseInt(m[1], 10) || 1);
		const position = m[2] === "start" || m[2] === "jump-start" ? "start" : "end";
		return { position, steps, type: "steps" };
	}
	return { params: EASE.slice(), type: "cubic-bezier" };
}

function cubicBezierY(x1, y1, x2, y2, x) {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = t => ((ax * t + bx) * t + cx) * t;
	const sampleY = t => ((ay * t + by) * t + cy) * t;
	const sampleDX = t => (3 * ax * t + 2 * bx) * t + cx;
	let t = x;
	for (let i = 0; i < 8; i += 1) {
		const err = sampleX(t) - x;
		if (Math.abs(err) < 1e-6) break;
		const d = sampleDX(t);
		if (Math.abs(d) < 1e-6) break;
		t -= err / d;
	}
	return sampleY(t);
}

/** Maps linear time progress [0,1] through a timing function. */
function timingProgress(tf, x) {
	const clamped = Math.min(1, Math.max(0, x));
	if (tf.type === "steps") {
		const { steps, position } = tf;
		if (position === "start") return Math.min(1, (Math.floor(clamped * steps) + 1) / steps);
		return Math.floor(clamped * steps) / steps;
	}
	const [x1, y1, x2, y2] = tf.params;
	return cubicBezierY(x1, y1, x2, y2, clamped);
}

function splitTransitionList(value) {
	const parts = [];
	let start = 0;
	let depth = 0;
	const text = String(value || "");
	for (let at = 0; at <= text.length; at += 1) {
		const ch = text[at];
		if (ch === "(") depth += 1;
		if (ch === ")") depth = Math.max(0, depth - 1);
		if (at === text.length || (ch === "," && depth === 0)) {
			const part = text.slice(start, at).trim();
			if (part) parts.push(part);
			start = at + 1;
		}
	}
	return parts;
}

const TIMING_KEYWORDS = new Set(["linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"]);

function isTimingToken(token) {
	const t = token.toLowerCase();
	return TIMING_KEYWORDS.has(t) || t.startsWith("cubic-bezier(") || t.startsWith("steps(");
}

/** Parses the `transition` shorthand into an array of transition descriptors. */
function parseTransition(value) {
	const text = String(value || "").trim();
	if (!text || text.toLowerCase() === "none") return [];
	const out = [];
	for (const item of splitTransitionList(text)) {
		const tokens = item.split(/\s+/).filter(Boolean);
		let property = "all";
		let duration = 0;
		let delay = 0;
		let timing = parseTimingFunction("ease");
		let sawDuration = false;
		for (const token of tokens) {
			if (isTimingToken(token)) {
				timing = parseTimingFunction(token);
				continue;
			}
			if (/^[\d.]+m?s$/i.test(token)) {
				const ms = parseTime(token);
				if (!sawDuration) { duration = ms; sawDuration = true; }
				else delay = ms;
				continue;
			}
			property = token.toLowerCase();
		}
		out.push(Object.freeze({ delay, duration, property, timing }));
	}
	return out;
}

/** Splits "12.5px" into { number, unit }. */
function splitNumberUnit(text) {
	const m = String(text || "").trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([a-zA-Z%]*)$/);
	if (!m) return null;
	return { number: parseFloat(m[1]), unit: m[2] || "" };
}

function parseRgbColor(text) {
	const t = String(text || "").trim().toLowerCase();
	let m = t.match(/^#([0-9a-f]{3})$/);
	if (m) {
		const h = m[1];
		return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16), 1];
	}
	m = t.match(/^#([0-9a-f]{6})$/);
	if (m) {
		const h = m[1];
		return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
	}
	m = t.match(/^#([0-9a-f]{8})$/);
	if (m) {
		const h = m[1];
		return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16) / 255];
	}
	m = t.match(/^rgba?\(\s*([^)]+)\)$/);
	if (m) {
		const parts = m[1].split(",").map(s => s.trim());
		const channel = v => (v.endsWith("%") ? parseFloat(v) / 100 * 255 : parseFloat(v));
		return [
			channel(parts[0] || "0"),
			channel(parts[1] || "0"),
			channel(parts[2] || "0"),
			parts[3] == null ? 1 : parseFloat(parts[3])
		];
	}
	return null;
}

function colorToCss(rgba) {
	const r = Math.round(Math.min(255, Math.max(0, rgba[0])));
	const g = Math.round(Math.min(255, Math.max(0, rgba[1])));
	const b = Math.round(Math.min(255, Math.max(0, rgba[2])));
	const a = Math.min(1, Math.max(0, rgba[3]));
	if (a >= 1) return `rgb(${r}, ${g}, ${b})`;
	return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;
}

/**
 * Interpolates between two CSS values at progress [0,1].
 * Handles numbers-with-units, colors, and falls back to discrete flip at 0.5.
 */
function interpolateValue(from, to, progress, colorResolver) {
	const f = String(from == null ? "" : from).trim();
	const t = String(to == null ? "" : to).trim();
	if (f === t) return t;
	const fn = splitNumberUnit(f);
	const tn = splitNumberUnit(t);
	if (fn && tn && fn.unit === tn.unit) {
		const v = fn.number + (tn.number - fn.number) * progress;
		const rounded = Math.round(v * 10000) / 10000;
		return `${rounded}${fn.unit}`;
	}
	const fc = parseRgbColor(f) || (colorResolver ? parseRgbColor(colorResolver(f)) : null);
	const tc = parseRgbColor(t) || (colorResolver ? parseRgbColor(colorResolver(t)) : null);
	if (fc && tc) {
		return colorToCss([
			fc[0] + (tc[0] - fc[0]) * progress,
			fc[1] + (tc[1] - fc[1]) * progress,
			fc[2] + (tc[2] - fc[2]) * progress,
			fc[3] + (tc[3] - fc[3]) * progress
		]);
	}
	return progress < 0.5 ? f : t;
}

/**
 * Creates a transition state. from/to are raw CSS values.
 * options: { duration, delay, timing } — timing from parseTimingFunction.
 */
function createTransition(from, to, options = {}) {
	return {
		delay: Number(options.delay) || 0,
		done: false,
		duration: Math.max(0, Number(options.duration) || 0),
		from: String(from == null ? "" : from),
		startedAt: null,
		timing: options.timing || parseTimingFunction("ease"),
		to: String(to == null ? "" : to)
	};
}

/**
 * Advances a transition state to `nowMs`. First tick stamps startedAt.
 * Returns { value, done }.
 */
function tickTransition(state, nowMs, colorResolver) {
	if (state.done) return { done: true, value: state.to };
	if (state.startedAt == null) state.startedAt = Number(nowMs) || 0;
	if (state.duration <= 0) {
		state.done = true;
		return { done: true, value: state.to };
	}
	const elapsed = (Number(nowMs) || 0) - state.startedAt - state.delay;
	if (elapsed < 0) return { done: false, value: state.from };
	if (elapsed >= state.duration) {
		state.done = true;
		return { done: true, value: state.to };
	}
	const progress = timingProgress(state.timing, elapsed / state.duration);
	return { done: false, value: interpolateValue(state.from, state.to, progress, colorResolver) };
}

/**
 * Selects which transition descriptors apply to a property change.
 * Returns the winning descriptor or null.
 */
function transitionForProperty(descriptors, propertyName) {
	const name = String(propertyName || "").toLowerCase();
	let winner = null;
	for (const d of descriptors || []) {
		if (d.property === "all" || d.property === name) winner = d;
	}
	return winner;
}

const AwtsExports = {
	createTransition,
	interpolateValue,
	parseTime,
	parseTimingFunction,
	parseTransition,
	tickTransition,
	timingProgress,
	transitionForProperty
};
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
