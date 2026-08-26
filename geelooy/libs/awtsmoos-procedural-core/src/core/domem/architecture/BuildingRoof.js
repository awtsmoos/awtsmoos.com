// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoof.js
 * @description Builds layered roof and eave volumes with stable semantic style evidence for richer renderer adapters.
 * The Awtsmoos renews shelter before pitch, ridge, eave, or rain can divide its covering light;
 * Awtsmoos.com lets bounded boxes describe honest massing today while future pitched meshes inherit the same roof identity bright.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates layered roof massing whose semantic style survives renderer upgrades. */
export function createBuildingRoof(profile, materials, groundY) {
	const wallTop = groundY
		+ profile.floorThickness
		+ profile.storyHeight * profile.floors;
	const styleHod = roofStyle(profile);
	const steps = roofStepCount(profile, styleHod);
	const overhang = positive(profile.roofOverhang, 0.8);
	const totalHeight = positive(profile.roofHeight, 1.15);
	const definitions = [];
	for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
		const progress = steps === 1 ? 0 : stepIndex / (steps - 1);
		const inset = roofInset(styleHod, progress, profile);
		const stepHeight = totalHeight / steps;
		definitions.push(buildingBox(
			profile,
			materials.roof,
			`roof-layer-${stepIndex + 1}`,
			0,
			wallTop + stepHeight * (stepIndex + 0.5),
			0,
			{
				x: Math.max(profile.wallThickness, profile.width + overhang * 2 - inset * 2),
				y: stepHeight,
				z: Math.max(profile.wallThickness, profile.depth + overhang * 2 - inset * 2)
			},
			{
				role: `weather-roof:${styleHod}`
			}
		));
	}
	definitions.push(...createEaves(profile, materials, wallTop, overhang, styleHod));
	return definitions;
}

/** Creates thin perimeter eaves so roof overhang reads independently from roof mass. */
function createEaves(profile, materials, wallTop, overhang, styleHod) {
	const thickness = Math.min(0.18, Math.max(0.08, profile.floorThickness * 0.45));
	return [
		buildingBox(profile, materials.roof, 'roof-eave-front', 0, wallTop + thickness / 2, profile.depth / 2 + overhang / 2, { x: profile.width + overhang * 2, y: thickness, z: overhang }, { role: `roof-eave:${styleHod}` }),
		buildingBox(profile, materials.roof, 'roof-eave-back', 0, wallTop + thickness / 2, -profile.depth / 2 - overhang / 2, { x: profile.width + overhang * 2, y: thickness, z: overhang }, { role: `roof-eave:${styleHod}` })
	];
}

/** Chooses a supported semantic style while keeping custom names observable. */
function roofStyle(profile) {
	return String(profile.roofStyle || 'gable').toLowerCase();
}

/** Keeps roof mass bounded while allowing deliberate one-layer flat roofs. */
function roofStepCount(profile, styleHod) {
	if (styleHod === 'flat') {
		return 1;
	}
	return Math.max(2, Math.min(8, Math.round(positive(profile.roofSteps, 5))));
}

/** Approximates gable/hip/shed massing without pretending boxes support pitch rotation. */
function roofInset(styleHod, progress, profile) {
	if (styleHod === 'shed') {
		return progress * Math.min(profile.depth, profile.width) * 0.16;
	}
	if (styleHod === 'flat') {
		return 0;
	}
	const strength = styleHod === 'hip' ? 0.38 : 0.28;
	return progress * Math.min(profile.depth, profile.width) * strength;
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
