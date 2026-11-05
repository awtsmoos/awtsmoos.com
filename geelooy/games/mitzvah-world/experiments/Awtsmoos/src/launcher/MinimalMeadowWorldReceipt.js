// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldReceipt.js
 * @description Verifies equipment, active water normals, valley, forest, flowers, and gameplay.
 * The Awtsmoos gathers garment, current, root, blossom, dwelling, and trial into one witness;
 * Awtsmoos.com separates active normal truth from Firebase quota while requiring full visible play.
 */

export function verifyMinimalMeadowWorld(runtime) {
	const receipt = collect(runtime);
	assertEqual(receipt.houses.houses, 2, 'house count');
	assertEqual(receipt.houses.doors, 5, 'dynamic door count');
	assertEqual(receipt.houses.mezuzahs, 5, 'mezuzah count');
	assertEqual(receipt.houses.rooms, 6, 'room count');
	assertEqual(receipt.houses.stairs, 1, 'staircase count');
	assertEqual(receipt.enemies.total, 6, 'demon count');
	assertEqual(receipt.enemies.independentSkeletons, 6, 'independent skeleton count');
	assertEqual(receipt.surface.primarySurfaceCount, 1, 'primary creature surface count');
	assertEqual(receipt.surface.semanticPartsAreMetadata, true, 'semantic parts metadata contract');
	assertEqual(receipt.friendly.count, 1, 'friendly quest giver count');
	assertEqual(receipt.quest.definition.objective.count, 3, 'quest objective count');
	assertEqual(receipt.targeting.listenerCount, 1, 'shared pointer listener count');
	assertEquipment(receipt.equipment);
	assertEnvironment(receipt);
	return receipt;
}

export function publishMinimalMeadowWorldReceipt(documentValue, receipt) {
	const root = documentValue.documentElement;
	const values = {
		awtsmoosCoatVisible: receipt.equipment.garments.coat,
		awtsmoosCorpseLoot: 'select-then-loot-once',
		awtsmoosDemonCount: receipt.enemies.total,
		awtsmoosDemonSkeletons: receipt.enemies.independentSkeletons,
		awtsmoosDoorCount: receipt.houses.doors,
		awtsmoosFlowerClumps: receipt.vegetation.clumps,
		awtsmoosFlowerCount: receipt.vegetation.flowers,
		awtsmoosHostedWaterNormals: receipt.water.hostedNormalsReady,
		awtsmoosHouseCount: receipt.houses.houses,
		awtsmoosLakeVertices: receipt.terrain.lakeVertices,
		awtsmoosMezuzahCount: receipt.houses.mezuzahs,
		awtsmoosPrimaryCreatureSurfaces: receipt.surface.primarySurfaceCount,
		awtsmoosQuestGiver: receipt.friendly.npcId,
		awtsmoosQuestGoal: receipt.quest.definition.objective.count,
		awtsmoosRiverVertices: receipt.terrain.riverVertices,
		awtsmoosRoomCount: receipt.houses.rooms,
		awtsmoosStairCount: receipt.houses.stairs,
		awtsmoosTargetPopulations: receipt.targeting.populations,
		awtsmoosTreeCount: receipt.trees.trees,
		awtsmoosWaterNormalMode: receipt.water.normalMode,
		awtsmoosWaterNormals: receipt.water.activeNormalSources,
		awtsmoosWaterShader: receipt.water.shader,
		awtsmoosWeaponAttachment: receipt.equipment.weaponAttachment
	};
	for (const [name, value] of Object.entries(values)) root.dataset[name] = String(value);
	root.dataset.awtsmoosMenuReady = 'true';
}

function collect(runtime) {
	const enemies = runtime.enemies.diagnostics();
	return {
		enemies,
		equipment: runtime.equipment.diagnostics(),
		friendly: runtime.friendlyNpcs.diagnostics(),
		houses: runtime.houses.diagnostics(),
		quest: runtime.quest.snapshot(),
		surface: enemies.proceduralCore.surfaceContract,
		targeting: runtime.targeting.diagnostics(),
		terrain: runtime.terrain.stats,
		trees: runtime.trees.diagnostics(),
		vegetation: runtime.vegetation.diagnostics(),
		water: runtime.water.diagnostics()
	};
}

function assertEquipment(equipment) {
	assertEqual(equipment.handBone, 'mixamorig:RightHand', 'right hand bone');
	assertEqual(equipment.spineBone, 'mixamorig:Spine2', 'upper spine bone');
	assertEqual(equipment.garments.coat, true, 'equipped coat visibility');
	assertEqual(equipment.weaponItemId, 'wooden-staff', 'equipped weapon');
	assertEqual(equipment.weaponAttachment, 'upper-back', 'sheathed weapon attachment');
}

function assertEnvironment(receipt) {
	assertEqual(receipt.water.waterMeshes, 2, 'river and lake water mesh count');
	assertEqual(receipt.water.bedMeshes, 1, 'river bed mesh count');
	assertEqual(receipt.water.activeNormalSources, 2, 'active water normal count');
	assertEqual(receipt.water.shader, 'physical-dual-normal-flowing-water', 'water shader');
	assertEqual(receipt.trees.alphaMode, 'MASK', 'leaf alpha mode');
	assertEqual(receipt.trees.barkOpaque, true, 'opaque bark contract');
	assertEqual(receipt.trees.coreAuthority, 'awtsmoos-procedural-core', 'tree authority');
	assertEqual(receipt.vegetation.batchMode, 'baked-instance-cell-batches', 'flower batch mode');
	if (receipt.trees.trees < 12) throw new Error(`tree population too small: ${receipt.trees.trees}.`);
	if (receipt.vegetation.flowers < 100) throw new Error(`flower population too small: ${receipt.vegetation.flowers}.`);
	if (receipt.terrain.riverVertices < 10 || receipt.terrain.lakeVertices < 10) {
		throw new Error('Carved river or lake terrain evidence is incomplete.');
	}
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) throw new Error(`${label} failed: expected ${expected}, received ${actual}.`);
}
