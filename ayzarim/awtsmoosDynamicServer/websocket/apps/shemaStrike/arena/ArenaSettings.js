//B"H
//Boruch Hashem
//Blessed is He
/**
 * Arena settings are Gevurah around possibility: every public choice is bounded
 * before it becomes shared state. The Awtsmoos renews freedom and limit together;
 * Awtsmoos.com admits only playable settings and immutable published world pins.
 */
const { RealtimeError } = require("../../../platform/RealtimeError.js");
const VISIBILITIES = Object.freeze(["public", "unlisted", "private"]);
const MODES = Object.freeze(["duel", "free-for-all", "training"]);
const LANGUAGES = Object.freeze(["en", "he"]);
const ACCESSIBILITY_TAGS = Object.freeze([
	"high-contrast",
	"large-text",
	"reduced-motion",
	"reduced-flashes"
]);
const DEFAULT_SETTINGS = Object.freeze({
	accessibilityTags: [],
	arenaName: "Shema Strike Arena",
	botCount: 0,
	botDifficulty: "balanced",
	language: "en",
	lateJoin: true,
	maximumPlayers: 4,
	maximumSpectators: 8,
	mode: "free-for-all",
	reconnectWindowMs: 30000,
	visibility: "private",
	worldVersionId: null
});

function validateArenaSettings(value = {}) {
	const source = { ...DEFAULT_SETTINGS, ...value };
	const maximumPlayers = integerBetween(
		source.maximumPlayers,
		2,
		4,
		"maximumPlayers"
	);
	const botCount = integerBetween(source.botCount, 0, 3, "botCount");
	if (botCount >= maximumPlayers) {
		throw new RealtimeError(
			"INVALID_BOT_CAPACITY",
			"Bot count must leave at least one human fighter slot."
		);
	}
	return Object.freeze({
		accessibilityTags: validateTags(source.accessibilityTags),
		arenaName: validateArenaName(source.arenaName),
		botCount,
		botDifficulty: validateChoice(source.botDifficulty, ["gentle", "balanced", "fierce"], "botDifficulty"),
		language: validateChoice(source.language, LANGUAGES, "language"),
		lateJoin: source.lateJoin !== false,
		maximumPlayers,
		maximumSpectators: integerBetween(source.maximumSpectators, 0, 12, "maximumSpectators"),
		mode: validateChoice(source.mode, MODES, "mode"),
		reconnectWindowMs: integerBetween(source.reconnectWindowMs, 5000, 120000, "reconnectWindowMs"),
		visibility: validateChoice(source.visibility, VISIBILITIES, "visibility"),
		worldVersionId: validateWorldVersionId(source.worldVersionId)
	});
}

function validateArenaName(value) {
	const name = String(value ?? "").trim().replace(/\s+/g, " ");
	if (!/^[\p{L}\p{N} _.'-]{3,40}$/u.test(name)) {
		throw new RealtimeError(
			"INVALID_ARENA_NAME",
			"Arena name must contain 3-40 safe characters."
		);
	}
	return name;
}

function validateWorldVersionId(value) {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	const versionId = String(value);
	if (!/^[0-9a-f-]{36}$/i.test(versionId)) {
		throw new RealtimeError(
			"INVALID_WORLD_VERSION_ID",
			"Published world version identity is malformed."
		);
	}
	return versionId;
}

function validateTags(value) {
	if (!Array.isArray(value) || value.length > 4) {
		throw new RealtimeError(
			"INVALID_ACCESSIBILITY_TAGS",
			"Accessibility tags must be a bounded array."
		);
	}
	const unique = [...new Set(value.map((tag) => String(tag)))];
	for (const tag of unique) {
		if (!ACCESSIBILITY_TAGS.includes(tag)) {
			throw new RealtimeError(
				"INVALID_ACCESSIBILITY_TAG",
				`Unsupported accessibility tag: ${tag}`
			);
		}
	}
	return Object.freeze(unique);
}

function integerBetween(value, minimum, maximum, field) {
	if (!Number.isInteger(value) || value < minimum || value > maximum) {
		throw new RealtimeError(
			"INVALID_ARENA_SETTING",
			`${field} must be between ${minimum} and ${maximum}.`
		);
	}
	return value;
}

function validateChoice(value, choices, field) {
	if (!choices.includes(value)) {
		throw new RealtimeError(
			"INVALID_ARENA_SETTING",
			`${field} contains an unsupported value.`
		);
	}
	return value;
}

module.exports = {
	ACCESSIBILITY_TAGS,
	DEFAULT_SETTINGS,
	LANGUAGES,
	MODES,
	VISIBILITIES,
	validateArenaSettings
};
