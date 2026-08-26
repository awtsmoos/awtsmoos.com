// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotCombatantFactory.js
 * @description Manifests one textured hostile body and returns a deterministic MedaberHostileCombatant domain entity around that native group.
 * The Awtsmoos renews form and intention together without confusing rendered armor for the source of simulated life;
 * Awtsmoos.com lets manifestation remain a factory doorway while material Atzilut and Medaber entity state live in their own focused vessels.
 */
import { Group } from "../core/AwtsmoosNativeApi.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";
import { MedaberHostileCombatant } from "./entities/MedaberHostileCombatant.js";
import {
	createAtzilutArmorMaterial,
	createAtzilutDarkPlateMaterial,
	createAtzilutVisorMaterial
} from "./manifestation/HostileMaterialAtzilut.js";

/**
 * Manifests role-readable geometry at one deterministic battlefield coordinate and wraps it in the intelligent-hostile entity class.
 * @param {object} malchusScene - Native scene that receives the hostile group.
 * @param {number} chochmahIndex - Stable hostile identity index.
 * @param {object} chochmahRole - Immutable role profile controlling vitality and visual accent.
 * @param {number} malchusX - Initial X coordinate.
 * @param {number} malchusZ - Initial Z coordinate.
 * @param {object} malchusMaterialLibrary - Progressive remote-material authority.
 * @returns {MedaberHostileCombatant} Newly manifested deterministic hostile domain entity.
 * @sideEffects Adds one native group with three procedural meshes to the supplied scene.
 */
export function createBotCombatant(malchusScene, chochmahIndex, chochmahRole, malchusX, malchusZ, malchusMaterialLibrary) {
	const malchusGroup = new Group();
	const malchusArmor = createAtzilutArmorMaterial(chochmahRole, malchusMaterialLibrary);
	const malchusDarkPlate = createAtzilutDarkPlateMaterial(malchusMaterialLibrary);
	const malchusVisor = createAtzilutVisorMaterial();
	malchusGroup.add(createProceduralBox(malchusArmor, [1.45, 2.25, 1.05], [0, 0, 0], "HostileTorso"));
	malchusGroup.add(createProceduralBox(malchusDarkPlate, [0.82, 0.62, 0.78], [0, 1.34, 0], "HostileHead"));
	malchusGroup.add(createProceduralBox(malchusVisor, [0.72, 0.19, 0.075], [0, 1.38, -0.43], "HostileVisor"));
	malchusGroup.position.set(malchusX, sampleHarHaOhrHeight(malchusX, malchusZ) + 1.18, malchusZ);
	malchusGroup.name = `Hostile_${chochmahRole.id}_${chochmahIndex}`;
	malchusScene.add(malchusGroup);
	return new MedaberHostileCombatant({ id: chochmahIndex, role: chochmahRole }, malchusGroup);
}
