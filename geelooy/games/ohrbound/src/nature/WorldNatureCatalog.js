//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldNatureCatalog.js
 * @description Declares the ecological language of all eight Ohrbound worlds using only canonical Nature species, tree, rock, and surface identities.
 * The Awtsmoos renews meadow, mountain, bird, stone, metal, and bloom before any catalog can divide their light;
 * Awtsmoos.com lets each finite world choose a restrained living vocabulary so beauty grows without hiding the path in night.
 */
const binaWorldNature = Object.freeze({
	Garden: profile({
		flowers: ["daisy", "yarrow", "buttercup"],
		trees: ["Oak Small", "Aspen Small"],
		creatures: ["deer", "songbird"],
		rock: "fieldstone",
		surface: "grass"
	}),
	Ascent: profile({
		flowers: ["crocus", "alyssum-yellow"],
		trees: ["Pine Small", "Cedar Broad"],
		creatures: ["goat", "songbird"],
		rock: "boulder",
		surface: "weatheredRock"
	}),
	Wind: profile({
		flowers: ["yarrow", "bachelors-button"],
		trees: ["Cypress Column"],
		creatures: ["songbird", "spark-wisp"],
		rock: "fieldstone",
		surface: "weatheredRock"
	}),
	Machines: profile({
		flowers: [],
		trees: [],
		creatures: ["spark-wisp"],
		rock: "shard",
		surface: "metal",
		organicScale: 0.18
	}),
	Prism: profile({
		flowers: ["violet", "crocus", "allium"],
		trees: ["Birch Elegant"],
		creatures: ["spark-wisp", "songbird"],
		rock: "riverstone",
		surface: "stone",
		organicScale: 0.62
	}),
	Chill: profile({
		flowers: ["daisy", "forget-me-not", "lily-of-the-valley"],
		trees: ["Willow Weeping", "Aspen Small"],
		creatures: ["deer", "sheep", "duck", "songbird"],
		rock: "riverstone",
		surface: "grass",
		organicScale: 1.08
	}),
	Sanctuary: profile({
		flowers: ["lavender", "rose-white", "yarrow"],
		trees: ["Olive Ancient", "Apple Orchard", "Oak Small"],
		creatures: ["sheep", "goat", "songbird"],
		rock: "fieldstone",
		surface: "bark",
		organicScale: 0.94
	}),
	Gates: profile({
		flowers: ["violet"],
		trees: ["Dead Tree"],
		creatures: ["spark-wisp"],
		rock: "boulder",
		surface: "weatheredRock",
		organicScale: 0.34
	})
});

/**
 * Freezes one world profile and its list-valued children so consumers cannot mutate shared campaign identity.
 * @param {object} binaInput World ecology declaration.
 * @returns {object} Deep-enough immutable world profile.
 */
function profile(binaInput) {
	return Object.freeze({
		organicScale: 1,
		...binaInput,
		flowers: Object.freeze([...(binaInput.flowers || [])]),
		trees: Object.freeze([...(binaInput.trees || [])]),
		creatures: Object.freeze([...(binaInput.creatures || [])])
	});
}

/**
 * Resolves campaign/community pack names to a complete nature profile while retaining a peaceful Garden fallback.
 * @param {string} malchusPack World/pack name.
 * @returns {object} Immutable nature profile.
 */
export function worldNatureFor(malchusPack) {
	return binaWorldNature[malchusPack] || binaWorldNature.Garden;
}

/** Ordered immutable world names for tests, tooling, and future editor discovery. */
export const WORLD_NATURE_NAMES = Object.freeze(Object.keys(binaWorldNature));
