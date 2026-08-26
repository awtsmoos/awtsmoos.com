// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnvironmentScatter.js
 * @description Adds deterministic quality-scaled non-colliding geology that enriches Har HaOhr without destabilizing movement.
 * The Awtsmoos renews stone after stone while no decorative abundance can change the mission's law;
 * Awtsmoos.com lets hardware reduce finite rubble before collision, AI, or combat ever suffer a flaw.
 */
import { setEulerQuaternion } from "../core/OhrVectorMath.js";
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import { createRockMaterial } from "../render/OhrfrontMaterialRecipes.js";
import { sampleHarHaOhrHeight } from "./TerrainHeightField.js";

function seeded(index, salt) {
	const value = Math.sin(index * 91.17 + salt * 37.71) * 43758.5453;
	return value - Math.floor(value);
}

function scatterPoint(index) {
	const angle = seeded(index, 1) * Math.PI * 2;
	const radius = 46 + seeded(index, 2) * 146;
	return {
		x: Math.cos(angle) * radius,
		z: Math.sin(angle) * radius
	};
}

function createRock(scene, material, index, part, center) {
	const width = 1.2 + seeded(index * 3 + part, 4) * 4.4;
	const height = 0.7 + seeded(index * 5 + part, 5) * 2.8;
	const depth = 1.1 + seeded(index * 7 + part, 6) * 4.1;
	const x = center.x + (seeded(index + part, 7) - 0.5) * 3.5;
	const z = center.z + (seeded(index + part, 8) - 0.5) * 3.5;
	const y = sampleHarHaOhrHeight(x, z) + height * 0.34;
	const rock = createProceduralBox(material, [width, height, depth], [x, y, z], `Fieldstone_${index}_${part}`);
	setEulerQuaternion(
		rock.quaternion,
		(seeded(index + part, 9) - 0.5) * 0.35,
		seeded(index + part, 10) * Math.PI,
		(seeded(index + part, 11) - 0.5) * 0.28
	);
	scene.add(rock);
	return rock;
}

export function createEnvironmentScatter(scene, materialLibrary, quality) {
	const material = createRockMaterial(materialLibrary);
	const objects = [];
	const sites = quality?.geologySites || 18;
	for (let index = 0; index < sites; index += 1) {
		const center = scatterPoint(index);
		const parts = index % 3 === 0 ? 3 : 2;
		for (let part = 0; part < parts; part += 1) {
			objects.push(createRock(scene, material, index, part, center));
		}
	}
	return { decorativeOnly: true, objects };
}
