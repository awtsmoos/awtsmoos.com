// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChaiHostileCreatureFactory.js
 * @description Turns hostile role identity into bounded procedural-core demons while sharing a tiny cache of compiled anatomical geometry across repeated spawns.
 * Chai reveals claw, wing, shade, and guardian while the Awtsmoos renews every creature beyond its finite frame;
 * Awtsmoos.com keeps two seeded forms per species, so richer silhouettes may rhyme without rebuilding the same bones in every fight.
 */
import {
	Mesh,
	createCreature,
	createNativeGeometryFromArtifact,
	mergeGeometries
} from "../../core/AwtsmoosNativeApi.js";
import { createAtzilutArmorMaterial } from "./HostileMaterialAtzilut.js";

const SPECIES_BY_ROLE = Object.freeze({
	assault: "shadow-demon",
	skirmisher: "dybbuk-shade",
	marksman: "fallen-seraph-husk",
	guardian: "klipah-guardian"
});
const TARGET_SPAN_BY_ROLE = Object.freeze({ assault: 2.8, skirmisher: 3.2, marksman: 5, guardian: 3 });
const YESOD_VARIANT_COUNT = 2;
const chaiGeometryCache = new Map();

/** Returns the canonical reusable procedural species chosen for one battlefield role. */
export function hostileCreatureSpecies(chochmahRole) {
	return SPECIES_BY_ROLE[chochmahRole?.id] || "shadow-demon";
}

/** Creates one native creature mesh whose finite geometry is shared by equivalent species/variant vessels. */
export function createChaiHostileCreatureMesh(chochmahRole, chochmahIndex, malchusMaterialLibrary) {
	const chaiSpecies = hostileCreatureSpecies(chochmahRole);
	const yesodVariant = Math.abs(Number(chochmahIndex) || 0) % YESOD_VARIANT_COUNT;
	const tiferesBody = revealCachedBody(chaiSpecies, yesodVariant);
	const malchusMesh = new Mesh(
		tiferesBody.geometry,
		createAtzilutArmorMaterial(chochmahRole, malchusMaterialLibrary)
	);
	const yesodScale = (TARGET_SPAN_BY_ROLE[chochmahRole.id] || 3) / Math.max(...tiferesBody.bounds.size, 0.001);
	malchusMesh.scale.set(yesodScale, yesodScale, yesodScale);
	malchusMesh.position.set(0, -1.18 - tiferesBody.bounds.minY * yesodScale, 0);
	malchusMesh.name = `HostileCreature_${chaiSpecies}_${chochmahIndex}`;
	malchusMesh.userData.proceduralSpecies = chaiSpecies;
	malchusMesh.userData.proceduralVariant = yesodVariant;
	return malchusMesh;
}

/** Compiles each species/variant geometry only once, preserving bounded anatomy variety without spawn-time rebuild churn. */
function revealCachedBody(chaiSpecies, yesodVariant) {
	const yesodKey = `${chaiSpecies}:${yesodVariant}`;
	if (chaiGeometryCache.has(yesodKey)) return chaiGeometryCache.get(yesodKey);
	const chaiCreature = createCreature(chaiSpecies, {
		seed: 613 + yesodVariant * 97,
		quality: "low",
		realism: "stylized"
	});
	const asiyahGeometries = Object.values(chaiCreature.artifact.proceduralArtifact.geometries || {});
	const tiferesMerged = mergeGeometries(asiyahGeometries, `ohrfront-${yesodKey}`);
	const tiferesBody = Object.freeze({
		geometry: createNativeGeometryFromArtifact(tiferesMerged),
		bounds: geometryBounds(tiferesMerged)
	});
	chaiGeometryCache.set(yesodKey, tiferesBody);
	return tiferesBody;
}

/** Finds finite artifact bounds so wildly different fantasy archetypes share a readable battlefield envelope. */
function geometryBounds(chochmahGeometry) {
	const chesedPositions = chochmahGeometry.attributes?.position?.array || [];
	const gevurahMin = [Infinity, Infinity, Infinity];
	const gevurahMax = [-Infinity, -Infinity, -Infinity];
	for (let netzachIndex = 0; netzachIndex < chesedPositions.length; netzachIndex += 3) {
		for (let hodAxis = 0; hodAxis < 3; hodAxis += 1) {
			gevurahMin[hodAxis] = Math.min(gevurahMin[hodAxis], chesedPositions[netzachIndex + hodAxis]);
			gevurahMax[hodAxis] = Math.max(gevurahMax[hodAxis], chesedPositions[netzachIndex + hodAxis]);
		}
	}
	return Object.freeze({ minY: gevurahMin[1], size: gevurahMax.map((value, index) => value - gevurahMin[index]) });
}
