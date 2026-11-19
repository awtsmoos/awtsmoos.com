// B"H
// Boruch Hashem
// Blessed is He

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { bakeChossidSurfaceDetail } from '../assets/ChossidSurfaceDetail.js';
import {
	applyChossidOutfit,
	chossidMaterialResolver,
	playerChossidOutfit
} from '../assets/ChossidOutfitPalette.js';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { createPlayerActionSystem } from '../playerActions/PlayerActionSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { shrinkCanonicalHeadAnimation, stabilizeCanonicalChossidModel } from './CanonicalChossidProportions.js';
import { minimalMeadowClipForState } from './MinimalMeadowAnimationClipPolicy.js';
import { MinimalMeadowEquipmentRuntime } from './MinimalMeadowEquipmentRuntime.js';
import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';

export const FRIENDLY_CHOSSID_MODEL_URL = PLAYER_MODEL_URL;

/** Creates a friendly NPC only from the canonical GLB and preserves its exported colors. */
export async function createFriendlyChossidActor(worldRuntime, definition) {
	const bus = new AwtsmoosEventBus();
	const inventory = new InventoryStore({
		equipment: {
			coat: 'black-coat',
			hand: definition.weaponItemId || 'wooden-staff',
			tool: 'chalaf'
		}
	});
	const equipment = new MinimalMeadowEquipmentRuntime({ bus, inventory });
	// B"H: the player load applies the chossid outfit palette (material resolver
	// + outfit + surface detail) so the player renders as a real character; the
	// friendly load used to skip all three, leaving authored flat colors that
	// read as blond hair and orange skin under the meadow light. Mirror it here.
	const outfit = definition.outfit || playerChossidOutfit();
	const gltf = await loadIsolatedGltf(
		FRIENDLY_CHOSSID_MODEL_URL,
		`minimal-meadow-friendly-${definition.id}`,
		{ materialResolver: chossidMaterialResolver(outfit) }
	);
	const model = prepareFriendlyModel(worldRuntime, gltf.scene, definition);
	applyChossidOutfit(model, outfit);
	bakeChossidSurfaceDetail(model);
	shrinkCanonicalHeadAnimation(gltf.animations);
	hydrateReadablePlayerMaterials(model);
	equipment.bindModel(model);
	const player = new TinyAnimationPlayer(model, gltf.animations || []);
	const standing = minimalMeadowClipForState(player.names, 'standing');
	if (standing) player.play(standing);
	player.update(0);
	const actions = createPlayerActionSystem({
		actorId: definition.id,
		bridge: false,
		bus,
		equipment,
		model
	});
	return actorRecord(worldRuntime, definition, gltf, {
		actions, bus, equipment, inventory, model, player
	});
}

function prepareFriendlyModel(runtime, model, definition) {
	const ground = runtime.terrain?.heightAt?.(
		definition.position.x,
		definition.position.z
	) || 0;
	model.name = `Awtsmoos_friendly_chossid_${definition.id}`;
	model.visible = true;
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(definition.position.x, ground, definition.position.z);
	model.setBaseTransform?.();
	stabilizeCanonicalChossidModel(model);
	runtime.scene.add(model);
	return model;
}

function actorRecord(worldRuntime, definition, gltf, parts) {
	return {
		...parts,
		id: definition.id,
		source: FRIENDLY_CHOSSID_MODEL_URL,
		destroy() {
			parts.actions.destroy();
			parts.equipment.destroy();
			parts.model.parent?.remove?.(parts.model);
		},
		diagnostics() {
			return {
				actions: parts.actions.snapshot(),
				animations: gltf.animations?.map(clip => clip.name || '') || [],
				equipment: parts.equipment.diagnostics(),
				id: definition.id,
				model: parts.model.name,
				source: FRIENDLY_CHOSSID_MODEL_URL
			};
		},
		dispatch(message) { return parts.actions.dispatch(message); },
		update(deltaSeconds) {
			parts.player.update(deltaSeconds);
			parts.actions.update(deltaSeconds);
			parts.model.updateWorldMatrix?.();
		},
		worldRuntime
	};
}
