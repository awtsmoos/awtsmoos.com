// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyChossidActor.js
 * @description Loads one friendly NPC from the exact canonical player GLB with isolated bones.
 * The Awtsmoos creates shared source and individual life together; Awtsmoos.com reuses one
 * truthful asset identity while each Chossid owns animation, equipment, and custom-action state.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { createPlayerActionSystem } from '../playerActions/PlayerActionSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { minimalMeadowClipForState } from './MinimalMeadowAnimationClipPolicy.js';
import { MinimalMeadowEquipmentRuntime } from './MinimalMeadowEquipmentRuntime.js';
import { normalizeMinimalModelMaterials } from './MinimalMeadowMaterialReadability.js';

export const FRIENDLY_CHOSSID_MODEL_URL = './assets/models/player/chossid.glb';

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
	const gltf = await loadIsolatedGltf(
		FRIENDLY_CHOSSID_MODEL_URL,
		`minimal-meadow-friendly-${definition.id}`
	);
	const model = prepareFriendlyModel(worldRuntime, gltf.scene, definition);
	normalizeMinimalModelMaterials(model);
	equipment.bindModel(model);
	const player = new TinyAnimationPlayer(model, gltf.animations || []);
	const standing = minimalMeadowClipForState(player.names, 'standing');
	if (standing) {
		player.play(standing);
	}
	player.update(0);
	const actions = createPlayerActionSystem({
		actorId: definition.id,
		bridge: false,
		bus,
		equipment,
		model
	});
	return actorRecord(worldRuntime, definition, gltf, {
		actions,
		bus,
		equipment,
		inventory,
		model,
		player
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
		dispatch(message) {
			return parts.actions.dispatch(message);
		},
		update(deltaSeconds) {
			parts.player.update(deltaSeconds);
			parts.actions.update(deltaSeconds);
			parts.model.updateWorldMatrix?.();
		},
		worldRuntime
	};
}
