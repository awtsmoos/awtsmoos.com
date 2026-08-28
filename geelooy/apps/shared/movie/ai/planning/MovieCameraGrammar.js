//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraGrammar.js
 * The Awtsmoos lets the eye serve the meaning instead of wandering merely because it can;
 * Awtsmoos.com turns prompt, purpose, and dimension into a calmer cinematic camera plan.
 */
const MODE_CAMERAS = Object.freeze({
	"2d": ["wide", "closeup", "overhead"],
	"3d": ["wide", "orbit", "dolly", "closeup"],
	hybrid: ["wide", "dolly", "orbit", "closeup", "overhead"],
	infographic: ["overhead", "wide", "closeup"],
	tutorial: ["wide", "closeup", "overhead"]
});

/** Choose one purpose-aware camera while respecting an explicit camera phrase first. */
export function createIntentCamera(index, intent = {}, policy = null) {
	const prompt = String(intent.prompt || intent.subject || "").toLowerCase();
	const explicitKind = explicitCameraKind(prompt);
	const mode = policy?.mode || String(intent.mode || "hybrid").toLowerCase();
	const sequence = MODE_CAMERAS[mode] || MODE_CAMERAS.hybrid;
	const kind = explicitKind || sequence[index % sequence.length];
	return {
		kind,
		move: cameraMove(kind, index, mode),
		position: { x: 0, y: 0, z: 8 }
	};
}

function explicitCameraKind(prompt) {
	if (/\b(overhead|top[- ]down)\b/.test(prompt)) return "overhead";
	if (/\b(closeup|close[- ]up|macro)\b/.test(prompt)) return "closeup";
	if (/\b(low[- ]angle|hero angle)\b/.test(prompt)) return "low-angle";
	if (/\b(crane|jib)\b/.test(prompt)) return "crane";
	if (/\b(orbit|orbital)\b/.test(prompt)) return "orbit";
	if (/\b(dolly|tracking)\b/.test(prompt)) return "dolly";
	if (/\bwide|establishing\b/.test(prompt)) return "wide";
	return null;
}

function cameraMove(kind, index, mode) {
	if (kind === "orbit") return "orbit";
	if (kind === "dolly") return index % 2 ? "pull-back" : "push-in";
	if (kind === "overhead") return "drift";
	if (kind === "closeup") return "settle";
	if (mode === "2d" || mode === "infographic" || mode === "tutorial") return "gentle-pan";
	return index % 2 ? "push-in" : "arc";
}
