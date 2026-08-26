// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontMaterialRecipes.js
 * @description Builds physically scaled native materials whose semantic photographs may hydrate progressively after first world creation.
 * The Awtsmoos blends grass, soil, stone, metal, and ruined wall beneath one renewing light;
 * Awtsmoos.com keeps role and scale explicit so realism may deepen after boot without rebuilding a single fight.
 */
import {
	MeshStandardMaterial,
	repeatForSurface
} from "../core/AwtsmoosNativeApi.js";

function repeat(width, height, coverage) {
	const policy = repeatForSurface({ width, height, coverage });
	return [policy.x, policy.y];
}

function layer(role, image, layerRepeat, strength, angle, slope, height, wetness, zones = [1, 1, 1, 1]) {
	return { angle, height, image, repeat: layerRepeat, role, slope, strength, wetness, zones };
}

function bindRoles(material, library, bindings) {
	material.remoteTextureBindings = Object.freeze({ ...bindings });
	return library.track(material);
}

export function createHarHaOhrTerrainMaterial(library) {
	const material = new MeshStandardMaterial({ name: "HarHaOhrLayeredTerrain", color: [0.72, 0.74, 0.66, 1] });
	material.mapImage = library.image("meadowLushGrass");
	material.mapRepeat = [58, 58];
	material.mixImage = library.image("dirt");
	material.mixRepeat = [38, 38];
	material.mixStrength = 0.42;
	material.mixPatchScale = 6.2;
	material.mixPatchSharpness = 1.8;
	material.textureLayers = [
		layer("meadowLushGrass", library.image("meadowLushGrass"), [62, 62], 1.0, 0.00, [0.00, 0.48], [-16, 15], 0.44),
		layer("meadowDryGrass", library.image("meadowDryGrass"), [56, 56], 0.75, 0.21, [0.00, 0.58], [4, 28], 0.12),
		layer("darkSoil", library.image("darkSoil"), [44, 44], 0.62, -0.17, [0.08, 0.72], [-24, 10], 0.32),
		layer("weatheredRock", library.image("weatheredRock"), [30, 30], 1.0, 0.13, [0.42, 1.00], [-8, 45], 0.06),
		layer("marshGrass", library.image("marshGrass"), [50, 50], 0.58, -0.08, [0.00, 0.34], [-30, -3], 0.92),
		layer("roadStone", library.image("roadStone"), [36, 36], 0.36, 0.05, [0.00, 0.46], [-14, 16], 0.18, [1, 0, 0, 0])
	];
	return bindRoles(material, library, {
		mapImage: "meadowLushGrass",
		mixImage: "dirt"
	});
}

export function createCoverMaterial(library) {
	const material = new MeshStandardMaterial({ name: "OhrfrontWeatheredMasonry", color: [0.68, 0.67, 0.62, 1] });
	material.mapRepeat = repeat(8, 4, library.record("masonry")?.coverage || "stone");
	material.mixRepeat = repeat(8, 4, "stone");
	material.mixStrength = 0.34;
	material.mixPatchScale = 4.1;
	material.mixPatchSharpness = 2.0;
	return bindRoles(material, library, { mapImage: "masonry", mixImage: "weatheredRock" });
}

export function createRockMaterial(library) {
	const material = new MeshStandardMaterial({ name: "HarHaOhrFieldstone", color: [0.49, 0.47, 0.42, 1] });
	material.mapRepeat = repeat(5, 4, "stone");
	material.mixRepeat = repeat(5, 4, "soil");
	material.mixStrength = 0.12;
	return bindRoles(material, library, { mapImage: "weatheredRock", mixImage: "darkSoil" });
}

export function createEarthMaterial(library) {
	const material = new MeshStandardMaterial({ name: "HarHaOhrScarredEarth", color: [0.39, 0.34, 0.27, 1] });
	material.mapRepeat = repeat(10, 4, "soil");
	material.mixRepeat = repeat(10, 4, "soil");
	material.mixStrength = 0.26;
	return bindRoles(material, library, { mapImage: "dirt", mixImage: "darkSoil" });
}

export function createDarkMetalMaterial(library) {
	const material = new MeshStandardMaterial({ name: "OhrfrontAgedMetal", color: [0.42, 0.47, 0.48, 1] });
	material.mapRepeat = repeat(3, 2.5, "generic");
	material.mixRepeat = repeat(3, 2.5, "timber");
	material.mixStrength = 0.08;
	return bindRoles(material, library, { mapImage: "metal", mixImage: "timber" });
}

export function createEnergyMaterial(color) {
	const material = new MeshStandardMaterial({
		alphaMode: "BLEND",
		color,
		doubleSided: true,
		name: "OhrfrontDivineEnergy",
		opacity: color[3] ?? 0.92,
		transparent: true
	});
	material.emissiveStrength = 1.8;
	return material;
}
