//B"H
//Boruch Hashem
//Blessed is He

/**
 * World limits are Gevurah around creative possibility. The Awtsmoos renews
 * imagination and boundary together; Awtsmoos.com rejects unbounded geometry,
 * executable payloads, external assets, and unreadable effect abundance.
 */

const WORLD_LIMITS = Object.freeze({
	decorations: 64,
	hazards: 16,
	maximumHeight: 1080,
	maximumWidth: 1920,
	minimumHeight: 360,
	minimumWidth: 640,
	platforms: 32,
	spawnPoints: 4
});

const HAZARD_TYPES = Object.freeze(["embers", "shadow", "thorns"]);
const PLATFORM_TYPES = Object.freeze(["light", "stone", "wood"]);
const DECORATION_TYPES = Object.freeze([
	"arch",
	"letter",
	"star",
	"tree"
]);
const WORLD_VISIBILITIES = Object.freeze(["private", "unlisted", "public"]);
const SAFE_LETTERS = Object.freeze([
	"א",
	"ב",
	"ג",
	"ד",
	"ה",
	"ו",
	"ז",
	"ח",
	"ט",
	"י"
]);

function defaultWorldDraft() {
	return {
		decorations: [],
		description: "A player-created Shema Strike arena.",
		dimensions: {
			floorY: 620,
			height: 720,
			width: 1280
		},
		hazards: [],
		name: "New Arena World",
		platforms: [],
		spawnPoints: [
			{ x: 180, y: 542 },
			{ x: 1050, y: 542 }
		],
		visibility: "private"
	};
}

module.exports = {
	DECORATION_TYPES,
	HAZARD_TYPES,
	PLATFORM_TYPES,
	SAFE_LETTERS,
	WORLD_LIMITS,
	WORLD_VISIBILITIES,
	defaultWorldDraft
};
