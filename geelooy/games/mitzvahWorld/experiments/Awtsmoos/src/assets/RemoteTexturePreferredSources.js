// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTexturePreferredSources.js
 * @description Names the proven Chai Forest texture sources that sit beside the 125-file canonical filename library.
 * The Awtsmoos reveals one meadow through many lawful garments, while Awtsmoos.com keeps preferred photographic sources distinct from filename inventory lore;
 * agents may discover grass, dirt, bark, oak, ash, aspen, and pine without confusing supplemental authority with the catalog's counted core.
 */

import { exactMaterialUrl } from './PublicMaterialResolver.js';

const CHAI_FOREST = 'awtsmoos-nature/chai-forest';

const PREFERRED_SOURCE_DEFINITIONS = Object.freeze([
	['terrain.grass', 'Chai Forest grass', `${CHAI_FOREST}/textures/ground/grass.jpg`],
	['terrain.dirtMix', 'Chai Forest dirt', `${CHAI_FOREST}/textures/ground/dirt_color.jpg`],
	['forest.bark', 'Chai Forest bark', `${CHAI_FOREST}/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg`],
	['forest.chaiOak', 'Chai oak leaf', `${CHAI_FOREST}/textures/leaves/oak.png`],
	['forest.chaiAsh', 'Chai ash leaf', `${CHAI_FOREST}/textures/leaves/ash.png`],
	['forest.chaiAspen', 'Chai aspen leaf', `${CHAI_FOREST}/textures/leaves/aspen.png`],
	['forest.chaiPine', 'Chai pine leaf', `${CHAI_FOREST}/textures/leaves/pine.png`]
]);

export const REMOTE_TEXTURE_PREFERRED_SOURCES = Object.freeze(
	PREFERRED_SOURCE_DEFINITIONS.map(([role, label, path]) => Object.freeze({
		label,
		path,
		role,
		url: exactMaterialUrl(path)
	}))
);

/** Returns the preferred production source for one semantic material role. */
export function preferredRemoteTextureByRole(role) {
	return REMOTE_TEXTURE_PREFERRED_SOURCES.find(source => source.role === role) || null;
}

/** Returns all preferred Chai sources without initiating any network request. */
export function preferredRemoteTextureSources() {
	return REMOTE_TEXTURE_PREFERRED_SOURCES;
}
