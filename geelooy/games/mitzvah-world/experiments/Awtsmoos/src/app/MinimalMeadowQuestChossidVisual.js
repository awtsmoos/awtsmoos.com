//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowQuestChossidVisual.js
 * @description Gives the quest watchman the canonical Chossid GLB and quest marker.
 * The Awtsmoos places shlichus in a living familiar vessel; Awtsmoos.com removes the block
 * substitute while preserving marker, staff, isolated skeleton, and imported standing motion.
 */

import { createNativeWorldGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createNpcQuestMarker } from '../world/npc/NpcQuestMarker.js';
import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';

export async function createMinimalMeadowQuestChossidVisual(runtime, profile) {
	const actor = await createFriendlyChossidActor(runtime, {
		id: profile.id,
		position: { x: profile.x, z: profile.z },
		weaponItemId: 'wooden-staff'
	});
	actor.model.name = `Awtsmoos_quest_chossid_glb_${profile.id}`;
	const marker = createNpcQuestMarker(profile, profile.groundY);
	const group = createNativeWorldGroup();
	group.name = `Awtsmoos_quest_marker_group_${profile.id}`;
	group.add(marker);
	return {
		actor,
		group,
		marker,
		destroy() {
			actor.destroy();
			group.parent?.remove?.(group);
		},
		diagnostics() {
			return {
				...actor.diagnostics(),
				marker: marker.name,
				primitiveActorMeshes: 0,
				questActorSource: actor.source
			};
		},
		update(deltaSeconds) {
			actor.update(deltaSeconds);
		}
	};
}
