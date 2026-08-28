//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VegetationGuildCatalog.js
 * @description Publishes canonical mixed-vegetation communities as immutable planner-ready recipes.
 * The Awtsmoos binds meadow, wetland, woodland, border, and stone-edge life without erasing any species boundary;
 * Awtsmoos.com lets one small guild name reveal habitat, association, spacing, and patch intent through a calm reusable API.
 */
import {
	meadowHabitat,
	rockGardenHabitat,
	shrubBorderHabitat,
	wetMeadowHabitat,
	woodlandEdgeHabitat
} from './VegetationGuildHabitats.js';
import {
	meadowGuildMembers,
	rockGardenGuildMembers,
	shrubBorderGuildMembers,
	wetMeadowGuildMembers,
	woodlandGuildMembers
} from './VegetationGuildMembers.js';
import { createVegetationGuild } from './VegetationGuildRecord.js';

const GUILDS = Object.freeze({
	meadow: guild('meadow', 'Native Meadow', meadowGuildMembers(meadowHabitat()), {
		count: 96, minimumSpacing: 0.42, patchCount: 9, patchiness: 0.74
	}, ['meadow', 'pollinator', 'sun']),
	'wet-meadow': guild('wet-meadow', 'Wet Meadow Edge', wetMeadowGuildMembers(wetMeadowHabitat()), {
		count: 72, minimumSpacing: 0.46, patchCount: 7, patchiness: 0.68
	}, ['wetland', 'riparian', 'pollinator']),
	'woodland-edge': guild('woodland-edge', 'Woodland Edge', woodlandGuildMembers(woodlandEdgeHabitat()), {
		count: 58, minimumSpacing: 0.5, patchCount: 6, patchiness: 0.62
	}, ['woodland', 'shade', 'edge']),
	'shrub-border': guild('shrub-border', 'Aromatic Shrub Border', shrubBorderGuildMembers(shrubBorderHabitat()), {
		count: 64, minimumSpacing: 0.52, patchCount: 6, patchiness: 0.66
	}, ['border', 'aromatic', 'pollinator']),
	'rock-garden': guild('rock-garden', 'Rock Garden Pioneers', rockGardenGuildMembers(rockGardenHabitat()), {
		count: 42, minimumSpacing: 0.58, patchCount: 5, patchiness: 0.54
	}, ['rock', 'dry', 'pioneer'])
});

export const VEGETATION_GUILD_IDS = Object.freeze(Object.keys(GUILDS));

/**
 * Resolves one canonical guild by stable identifier.
 * @param {string} [idOhr='meadow'] Guild identifier.
 * @returns {Readonly<object>} Frozen guild recipe.
 * @throws {RangeError} When the requested guild is not installed.
 */
export function vegetationGuild(idOhr = 'meadow') {
	const yesodId = String(idOhr || 'meadow').trim().toLowerCase();
	const malchusGuild = GUILDS[yesodId];
	if (!malchusGuild) {
		throw new RangeError(`B"H | Unknown vegetation guild "${idOhr}". Expected: ${VEGETATION_GUILD_IDS.join(', ')}.`);
	}
	return malchusGuild;
}

/** Returns every canonical guild as immutable discovery data. */
export function listVegetationGuilds() {
	return Object.freeze(VEGETATION_GUILD_IDS.map((yesodId) => GUILDS[yesodId]));
}

/** Creates one guild record with shared planner defaults and discoverable ecological tags. */
function guild(idOhr, labelOhr, speciesKelim, plannerKli, tagsOhr) {
	return createVegetationGuild(idOhr, labelOhr, speciesKelim, plannerKli, {
		tags: Object.freeze([...tagsOhr])
	});
}
