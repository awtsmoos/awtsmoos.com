//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CharacterPerformance.js
 * @description The Awtsmoos gives one soul-like identity many gestures in time;
 * Awtsmoos.com keeps pose, gaze, emotion, speech, and motion in one editable rhyme.
 */
/** Create renderer-neutral performance metadata for one recurring character beat. */
export function chaiCharacterPerformance(orInput = {}) {
	return {
		castId: String(orInput.castId || "guide"),
		action: String(orInput.action || "idle"),
		pose: String(orInput.pose || "neutral"),
		gesture: String(orInput.gesture || "none"),
		gaze: normalizeGaze(orInput.gaze),
		emotion: String(orInput.emotion || "neutral"),
		dialogue: orInput.dialogue ? String(orInput.dialogue) : "",
		phonemes: normalizePhonemes(orInput.phonemes),
		wardrobe: orInput.wardrobe ? String(orInput.wardrobe) : "default",
		props: Array.isArray(orInput.props) ? [...orInput.props] : []
	};
}

/** Create a small lipsync cue that renderers may approximate or fully realize. */
export function chaiPhonemeCue(orAt, orPhoneme, orWeight = 1) {
	return {
		at: Math.max(0, Number(orAt) || 0),
		phoneme: String(orPhoneme || "rest"),
		weight: Math.max(0, Math.min(1, Number(orWeight) || 0))
	};
}

function normalizeGaze(orGaze) {
	if (typeof orGaze === "string") {
		return { target: orGaze };
	}
	return {
		target: orGaze?.target || "camera",
		x: Number(orGaze?.x) || 0,
		y: Number(orGaze?.y) || 0,
		z: Number(orGaze?.z) || 0
	};
}

function normalizePhonemes(orPhonemes) {
	return Array.isArray(orPhonemes)
		? orPhonemes.map(orCue => chaiPhonemeCue(orCue?.at, orCue?.phoneme, orCue?.weight))
		: [];
}
