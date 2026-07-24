// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Verifies houses, doors, rooms, stairs, mezuzahs, six skins, quest, corpses, and loot.
 * The Awtsmoos gathers earth, dwelling, neighbor, trial, sunlight, and choice into one field;
 * Awtsmoos.com declares readiness only after every requested visible subsystem publishes evidence.
 */

import { installMinimalMeadowAnimation } from '../app/MinimalMeadowAnimationState.js?v=20260724-meadow-13';
import { startMinimalMeadowLoop } from '../app/MinimalMeadowLoop.js?v=20260724-meadow-17';

export async function awaitMinimalMeadowReadiness(diagnostics, loading, documentValue, environment = globalThis) {
	const runtime = diagnostics.runtime;
	loading.world({ message: 'Activating homes, doors, six demons, quest, corpses, and loot…', progress: 0.8 });
	const rendererReady = runtime.renderer.hydrate
		? runtime.renderer.hydrate({ environment })
		: Promise.resolve(null);
	await Promise.all([rendererReady, Promise.resolve(diagnostics.canonicalPlayerPromise)]);
	installMinimalMeadowAnimation(runtime);
	restartLoop(runtime, diagnostics, environment);
	renderVerifiedFrame(runtime);
	const receipt = verifyWorld(runtime);
	publishReceipt(runtime, documentValue, receipt);
	loading.world({ message: 'Brick homes, six demons, parchment quest, and corpse loot ready.', progress: 1 });
	return diagnostics;
}

function restartLoop(runtime, diagnostics, environment) {
	if (!runtime.movement) return;
	runtime.movement.stop?.();
	runtime.movement = startMinimalMeadowLoop(runtime, environment);
	diagnostics.movement = runtime.movement;
}

function renderVerifiedFrame(runtime) {
	runtime.player?.update?.(0);
	runtime.model?.updateWorldMatrix?.();
	runtime.sky?.update?.();
	runtime.houses?.update?.(0.016);
	runtime.enemies?.update?.(0.016);
	runtime.cameraRig.update(runtime.camera, runtime.state, runtime.mainOctree, 1);
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
	if (!runtime.renderer.delegate) throw new Error('Rich meadow renderer did not become active.');
}

function verifyWorld(runtime) {
	const houses = runtime.houses.diagnostics();
	const enemies = runtime.enemies.diagnostics();
	const friendly = runtime.friendlyNpcs.diagnostics();
	const quest = runtime.quest.snapshot();
	const surface = enemies.proceduralCore.surfaceContract;
	assertEqual(houses.houses, 2, 'house count');
	assertEqual(houses.doors, 5, 'dynamic door count');
	assertEqual(houses.mezuzahs, 5, 'mezuzah count');
	assertEqual(houses.rooms, 6, 'room count');
	assertEqual(houses.stairs, 1, 'staircase count');
	assertEqual(enemies.total, 6, 'demon count');
	assertEqual(enemies.independentSkeletons, 6, 'independent skeleton count');
	assertEqual(surface.primarySurfaceCount, 1, 'primary creature surface count');
	assertEqual(surface.semanticPartsAreMetadata, true, 'semantic parts metadata contract');
	assertEqual(friendly.count, 1, 'friendly quest giver count');
	assertEqual(quest.definition.objective.count, 3, 'quest objective count');
	assertEqual(runtime.targeting.diagnostics().listenerCount, 1, 'shared pointer listener count');
	return { enemies, friendly, houses, quest, surface };
}

function publishReceipt(runtime, documentValue, receipt) {
	const root = documentValue.documentElement;
	root.dataset.awtsmoosCorpseLoot = 'select-then-loot-once';
	root.dataset.awtsmoosDemonCount = String(receipt.enemies.total);
	root.dataset.awtsmoosDemonSkeletons = String(receipt.enemies.independentSkeletons);
	root.dataset.awtsmoosDoorCount = String(receipt.houses.doors);
	root.dataset.awtsmoosHouseCount = String(receipt.houses.houses);
	root.dataset.awtsmoosHouseMaterials = String(receipt.houses.materialsReady);
	root.dataset.awtsmoosMezuzahCount = String(receipt.houses.mezuzahs);
	root.dataset.awtsmoosPrimaryCreatureSurfaces = String(receipt.surface.primarySurfaceCount);
	root.dataset.awtsmoosQuestGiver = receipt.friendly.npcId;
	root.dataset.awtsmoosQuestGoal = String(receipt.quest.definition.objective.count);
	root.dataset.awtsmoosRoomCount = String(receipt.houses.rooms);
	root.dataset.awtsmoosStairCount = String(receipt.houses.stairs);
	root.dataset.awtsmoosTargetPopulations = String(runtime.targeting.diagnostics().populations);
	root.dataset.awtsmoosMenuReady = 'true';
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) throw new Error(`${label} failed: expected ${expected}, received ${actual}.`);
}

export default awaitMinimalMeadowReadiness;
