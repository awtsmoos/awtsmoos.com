// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDestinationSignSystem.js
 * @description Turns the bilingual catalog into four textured boards and four posts.
 * The Awtsmoos is beyond every direction, yet Awtsmoos.com reveals a merciful path
 * through signs whose words, placement, texture, and collision all agree.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { VILLAGE_DESTINATIONS, VILLAGE_SIGN_GROUPS } from './VillageSignCatalog.js';
import { createVillageSignTextureUrl } from './VillageSignTexture.js';
import {
	villageBox,
	villageCylinder,
	villageGroundY
} from './VillagePropFactory.js';

export function createVillageDestinationSignDefinitions(groundSampler) {
	const definitions = VILLAGE_SIGN_GROUPS.flatMap((group) => {
		return createSignGroup(group, groundSampler);
	});
	return {
		definitions,
		stats: {
			bilingualLabels: VILLAGE_DESTINATIONS.length,
			destinationLabels: VILLAGE_DESTINATIONS.length,
			signBoards: VILLAGE_SIGN_GROUPS.length,
			signPosts: VILLAGE_SIGN_GROUPS.length,
			signs: VILLAGE_SIGN_GROUPS.length,
			textureCount: VILLAGE_SIGN_GROUPS.length
		}
	};
}

function createSignGroup(group, groundSampler) {
	const { x, z } = group.position;
	const y = villageGroundY(groundSampler, x, z);
	const metadata = {
		AwtsmoosDestinationSign: {
			destinations: group.destinations,
			groupId: group.id,
			languages: ['en', 'he']
		}
	};
	const post = villageCylinder(
		`Awtsmoos_destination_sign_post_${group.id}`,
		x,
		y + 1.15,
		z,
		0.075,
		2.3,
		'#5d3b1f',
		TEXTURE_URLS.wood.bark1,
		{ userData: metadata }
	);
	const board = villageBox(
		`Awtsmoos_destination_sign_board_${group.id}`,
		x,
		y + 1.82,
		z,
		3.25,
		1.3,
		0.12,
		'#ffffff',
		createVillageSignTextureUrl(group),
		{
			noEdge: true,
			rotation: { y: group.yaw },
			solid: false,
			texturePolicy: { bilingualSvg: true, generated: true },
			userData: metadata
		}
	);
	return [post, board];
}
