// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationFriendlyActors.js
 * @description Creates independent friendly actors from the same parsed canonical GLB manifest.
 * The Awtsmoos creates likeness without shared mutable identity; Awtsmoos.com lets accelerated
 * jobs inspect separate bones, equipment, inventory, imported clips, and custom actions.
 */

import { MinimalMeadowEquipmentRuntime } from '../app/MinimalMeadowEquipmentRuntime.js';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { createPlayerActionSystem } from '../playerActions/PlayerActionSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { createSimulatedGltf } from './SimulatedModelFactory.js';
import { SimulationImportedAnimationState } from './SimulationImportedAnimationState.js';

export function createSimulationFriendlyActors(manifest, scene) {
	return [
		createActor(manifest, scene, {
			id: 'simulation-friendly-mendel',
			weaponItemId: 'wooden-staff',
			x: -5,
			z: 3
		}),
		createActor(manifest, scene, {
			id: 'simulation-friendly-levi',
			weaponItemId: 'spark-blade',
			x: 5,
			z: -3
		})
	];
}

function createActor(manifest, scene, definition) {
	const gltf = createSimulatedGltf(manifest, definition.id);
	gltf.scene.position.set(definition.x, 0, definition.z);
	scene.add(gltf.scene);
	const bus = new AwtsmoosEventBus();
	const inventory = new InventoryStore({
		equipment: {
			coat: 'black-coat',
			hand: definition.weaponItemId,
			tool: 'chalaf'
		}
	});
	const equipment = new MinimalMeadowEquipmentRuntime({ bus, inventory });
	equipment.bindModel(gltf.scene);
	const importedAnimation = new SimulationImportedAnimationState(gltf);
	const actions = createPlayerActionSystem({
		actorId: definition.id,
		bridge: false,
		bus,
		equipment,
		model: gltf.scene
	});
	return {
		actions,
		bus,
		definition,
		equipment,
		gltf,
		importedAnimation,
		inventory,
		destroy() {
			actions.destroy();
			equipment.destroy();
			gltf.scene.parent?.remove?.(gltf.scene);
		},
		dispatch(message) {
			return actions.dispatch(message);
		},
		snapshot() {
			return {
				action: actions.snapshot(),
				equipment: equipment.diagnostics(),
				id: definition.id,
				importedAnimation: importedAnimation.diagnostics(),
				model: gltf.scene.diagnostics(),
				source: manifest.source
			};
		},
		update(deltaSeconds) {
			importedAnimation.sample('standing', equipment.weaponItemId);
			actions.update(deltaSeconds);
		}
	};
}
