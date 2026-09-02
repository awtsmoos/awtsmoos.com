// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotCombatantFactory.js
 * @description Manifests one procedural-core hostile creature and wraps the historical chest-centered native group in a Medaber combat entity.
 * The Awtsmoos renews form and intention without confusing rendered anatomy for simulated life;
 * Awtsmoos.com lets a demon gain horn, limb, wing, and shade while cognition and hit truth remain steady in the fight.
 */
import { Group } from "../core/AwtsmoosNativeApi.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";
import { MedaberHostileCombatant } from "./entities/MedaberHostileCombatant.js";
import { createChaiHostileCreatureMesh } from "./manifestation/ChaiHostileCreatureFactory.js";

/**
 * Manifests one role-readable procedural creature at a deterministic battlefield coordinate.
 * @returns {MedaberHostileCombatant} Hostile whose visual body changed without changing AI or collision ownership.
 */
export function createBotCombatant(malchusScene, chochmahIndex, chochmahRole, malchusX, malchusZ, malchusMaterialLibrary) {
	const malchusGroup = new Group();
	const chaiCreature = createChaiHostileCreatureMesh(chochmahRole, chochmahIndex, malchusMaterialLibrary);
	malchusGroup.add(chaiCreature);
	malchusGroup.position.set(
		malchusX,
		sampleHarHaOhrHeight(malchusX, malchusZ) + 1.18,
		malchusZ
	);
	malchusGroup.name = `Hostile_${chochmahRole.id}_${chochmahIndex}`;
	malchusScene.add(malchusGroup);
	return new MedaberHostileCombatant({ id: chochmahIndex, role: chochmahRole }, malchusGroup);
}
