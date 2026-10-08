//B"H
/**
 * @file Reverse Design — emotion as input.
 * @description Start with a feeling; work backward to the design that creates it.
 *
 *   designForEmotion(content, "awe")
 *   designForEmotion(content, ["warmth", "clarity"])        // "warm clarity"
 *   designForEmotion(content, [{name:"awe", intensity:0.9}])
 *
 * Emotions are constraint bundles parameterized by intensity t in [0,1]
 * (the slider: mild ↔ overwhelming). Combining emotions merges their
 * bundles with first-wins `=` priority and naturally composing inequalities.
 *
 * Priority order (highest first): per-emotion DSL → extra → content →
 * DEFAULT_BASE (missing-token insurance) → emotion library bundles (pure fallbacks).
 */

export { EMOTIONS, getEmotion, listEmotions, clampIntensity } from "./emotions.mjs";
export { combineSources } from "./combine.mjs";

import { EMOTIONS, getEmotion, clampIntensity } from "./emotions.mjs";
import { combineSources } from "./combine.mjs";
import { design, getBundle } from "../constraints/index.mjs";

const DEFAULT_CONTENT = `
body.fontSize = 16px
section.fontSize = 1.5 * body.fontSize
footnote.fontSize = 0.85 * body.fontSize
body.direction = rtl
`.trim();

/**
 * Last-resort base tokens, merged BELOW content and emotion sources.
 * They only fill in when nothing else defined them (first-`=`-wins merge),
 * so fallback library bundles and `N * body.fontSize` expressions in emotion
 * DSL can never fail on an unresolved reference.
 */
const DEFAULT_BASE = `
body.fontSize = 16px
section.fontSize = 1.5 * body.fontSize
footnote.fontSize = 0.85 * body.fontSize
`.trim();

/** Normalize the emotions argument to [{name, intensity}]. */
function normalizeEmotions(emotions, defaultIntensity) {
	const list = Array.isArray(emotions) ? emotions : [emotions];
	return list.map((e) => {
		if (typeof e === "string") return { name: e, intensity: clampIntensity(defaultIntensity) };
		if (e && typeof e.name === "string") {
			return { name: e.name, intensity: clampIntensity(e.intensity ?? defaultIntensity) };
		}
		throw new Error(`Invalid emotion entry: ${JSON.stringify(e)}`);
	});
}

/**
 * DSL source for one emotion at an intensity, including its library bundles.
 * @returns {Array<{label:string, source:string}>} in priority order.
 */
export function emotionSources(name, intensity = 0.6) {
	const t = clampIntensity(intensity);
	const emotion = getEmotion(name);
	const parts = [{ label: `emotion:${name}`, source: emotion.dsl(t) }];
	const seenBundles = new Set();
	for (const b of emotion.bundles) {
		if (seenBundles.has(b)) continue;
		seenBundles.add(b);
		try {
			parts.push({ label: `bundle:${b}`, source: getBundle(b) });
		} catch {
			// Unknown bundle names are recorded, not fatal.
			parts.push({ label: `bundle:${b}`, source: `\n/* unknown bundle '${b}' — skipped */\n` });
		}
	}
	return parts;
}

/** One-line descriptions of all 20 emotions. */
export function describeEmotions() {
	return EMOTIONS.map((e) => ({ name: e.name, description: e.description }));
}

/**
 * Generate a design from content + emotion(s).
 * @param {string} content Base design DSL (the content's identity). Defaults to a minimal sefer base.
 * @param {string|Array} emotions Emotion name, list of names, or list of {name, intensity}.
 * @param {Object} opts {intensity=0.6 default slider, extra="" designer overrides (highest priority)}
 * @returns {{ok:boolean, values:Object, errors:Array<string>, notes:Array<string>, applied:Array, source:string}}
 */
export function designForEmotion(content = DEFAULT_CONTENT, emotions = "calm", opts = {}) {
	const defaultIntensity = opts.intensity ?? 0.6;
	let applied;
	try {
		applied = normalizeEmotions(emotions, defaultIntensity);
	} catch (e) {
		return { ok: false, values: {}, errors: [e.message], notes: [], applied: [], source: "" };
	}
	const named = [];
	if (opts.extra && opts.extra.trim()) {
		named.push({ label: "extra", source: opts.extra.trim() });
	}
	for (const { name, intensity } of applied) {
		try {
			named.push(...emotionSources(name, intensity));
		} catch (e) {
			return { ok: false, values: {}, errors: [e.message], notes: [], applied: [], source: "" };
		}
	}
	named.push({ label: "content", source: String(content).trim() || DEFAULT_CONTENT });
	named.push({ label: "default-base", source: DEFAULT_BASE });

	const { source, notes } = combineSources(named);
	const result = design(source);
	return {
		ok: result.ok,
		values: result.values,
		errors: result.errors,
		notes,
		applied,
		source,
	};
}
