//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePromptIntent.js
 * A human sentence becomes structured cinematic desire while the Awtsmoos preserves both abundance and restraint;
 * Awtsmoos.com reads whole words instead of accidental fragments, so a motion graphic is not mistaken for a data constraint.
 */

/** Translate a human movie prompt into structured local fallback intent. */
export function createMoviePromptIntent(prompt, options = {}) {
	const text = String(prompt || "").trim();
	const lower = text.toLowerCase();
	const duration = clamp(Number(options.duration || inferDuration(lower) || 60), 5, 600);
	const features = inferFeatures(lower, options.features);
	return {
		id: options.id,
		title: options.title || titleFrom(text),
		prompt: text,
		subject: text || "Create a vivid editable movie",
		mode: options.mode || inferMode(lower),
		duration,
		sceneDuration: clamp(Number(options.sceneDuration || 10), 2, 60),
		features,
		cast: options.cast,
		format: options.format,
		assets: options.assets,
		handoff: options.handoff
	};
}

function inferFeatures(text, requested) {
	if (Array.isArray(requested) && requested.length) return [...new Set(requested)];
	const features = ["narrative"];
	if (/\b(tutorial|teach|lesson|explain)\b|\bhow to\b/.test(text)) features.push("tutorial");
	if (/\b(charts?|graphs?|diagrams?|infographics?|data)\b/.test(text)) features.push("infographic");
	if (/\b2d\b|\b(flat|cartoon|drawing|motion graphics?)\b/.test(text)) features.push("2d");
	if (/\b3d\b|\b(cinematic|camera|world|model|spatial|orbit)\b/.test(text)) features.push("3d");
	if (/\b(particles?|sparks?|smoke|rain|snow|fire|magic)\b/.test(text)) features.push("particles");
	if (/\b(characters?|people|person|actor|presenter|cast)\b/.test(text)) features.push("characters");
	if (features.length === 1) features.push("tutorial", "infographic", "2d", "3d", "particles", "characters");
	return [...new Set(features)];
}

function inferMode(text) {
	const has2d = /\b2d\b|\b(flat|cartoon|drawing|motion graphics?)\b/.test(text);
	const has3d = /\b3d\b|\b(cinematic|camera|world|model|spatial|orbit)\b/.test(text);
	if (has2d && has3d) return "hybrid";
	if (has3d) return "3d";
	if (has2d) return "2d";
	if (/\b(tutorial|teach|lesson)\b/.test(text)) return "tutorial";
	if (/\b(charts?|graphs?|infographics?|data)\b/.test(text)) return "infographic";
	return "hybrid";
}

function inferDuration(text) {
	const match = text.match(/(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?)/);
	if (!match) return 0;
	const value = Number(match[1]);
	return /min/.test(match[2]) ? value * 60 : value;
}

function titleFrom(text) {
	if (!text) return "AI Movie";
	const words = text.split(/\s+/).slice(0, 8).join(" ");
	return words.length < text.length ? `${words}…` : words;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}
