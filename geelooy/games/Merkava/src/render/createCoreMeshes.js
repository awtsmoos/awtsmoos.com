//B"H
// Boruch Hashem
// Blessed is He
/**
 * Roads, coins, warning lines, soldiers, and the chariot arise from local primitives.
 * The Awtsmoos grants form its instant while Awtsmoos.com reveals raw WebGL vessels.
 *
 * B"H — Yaakov 2026-10-13: every mesh now carries box UVs so Drive textures
 * have coordinates to land on. No more flat colors.
 */
import {
	cubeMesh,
	cylinderMesh,
	mergeMeshes,
	ringMesh,
	sphereMesh,
	starMesh,
	transformMesh
} from '../../../../libs/awtsmoos-procedural/src/index.js';
import { COLORS } from '../config/gameConfig.js';
import { withBoxUVs } from './boxUVs.js';

export function createCoreMeshes() {
	return {
		road: withBoxUVs(cubeMesh({ size: [11, 0.16, 120], color: COLORS.road }), 0.08),
		lane: withBoxUVs(cubeMesh({ size: [0.08, 0.035, 4.2], color: COLORS.lane }), 0.5),
		chariot: withBoxUVs(createChariot(), 0.45),
		soldier: withBoxUVs(createSoldier(), 0.6),
		shot: withBoxUVs(sphereMesh({ radius: 0.13, rings: 5, segments: 8, color: COLORS.shot }), 0.8),
		enemyShot: withBoxUVs(sphereMesh({ radius: 0.18, rings: 5, segments: 8, color: COLORS.negative }), 0.8),
		gate: withBoxUVs(createGate(), 0.4),
		spark: withBoxUVs(starMesh({ points: 6, outer: 0.45, inner: 0.2, height: 0.12, color: COLORS.spark }), 0.8),
		prutah: withBoxUVs(createCoin(COLORS.prutah), 0.9),
		goldenPrutah: withBoxUVs(createCoin(COLORS.goldenPrutah), 0.9),
		boss: withBoxUVs(createBoss(), 0.25),
		health: withBoxUVs(cubeMesh({ size: [1, 0.08, 0.08], color: COLORS.health }), 0.8),
		pillar: withBoxUVs(cylinderMesh({ radius: 0.24, height: 5.5, segments: 8, color: COLORS.scenery }), 0.35),
		particle: withBoxUVs(sphereMesh({ radius: 0.1, rings: 4, segments: 6, color: COLORS.spark }), 0.8),
		warning: withBoxUVs(cubeMesh({ size: [2.7, 0.04, 80], color: COLORS.warning }), 0.12)
	};
}

function createChariot() {
	const parts = [
		cubeMesh({ size: [2.2, 0.42, 3.2], color: COLORS.chariot }),
		transformMesh(cubeMesh({ size: [1.35, 0.6, 1.35], color: COLORS.chariot }), { translate: [0, 0.52, 0.35] }),
		transformMesh(starMesh({ points: 6, outer: 0.72, inner: 0.33, height: 0.12, color: COLORS.shot }), { rotate: [Math.PI / 2, 0, 0], translate: [0, 1.28, -0.15] })
	];
	for (const x of [-1.25, 1.25]) {
		for (const z of [-1.1, 1.1]) {
			parts.push(transformMesh(cylinderMesh({ radius: 0.48, height: 0.28, segments: 12, color: [0.3, 0.38, 0.52, 1] }), { rotate: [0, 0, Math.PI / 2], translate: [x, -0.18, z] }));
		}
	}
	return mergeMeshes(parts);
}

function createSoldier() {
	return mergeMeshes([
		cylinderMesh({ radius: 0.16, height: 0.72, segments: 8, color: COLORS.soldier }),
		transformMesh(sphereMesh({ radius: 0.23, rings: 5, segments: 8, color: COLORS.soldier }), { translate: [0, 0.53, 0] }),
		transformMesh(cubeMesh({ size: [0.08, 0.12, 0.52], color: COLORS.shot }), { translate: [0.18, 0.18, -0.25] })
	]);
}

function createGate() {
	return mergeMeshes([
		transformMesh(cubeMesh({ size: [0.34, 3.2, 0.34] }), { translate: [-1.25, 1.6, 0] }),
		transformMesh(cubeMesh({ size: [0.34, 3.2, 0.34] }), { translate: [1.25, 1.6, 0] }),
		transformMesh(cubeMesh({ size: [2.84, 0.38, 0.34] }), { translate: [0, 3.02, 0] })
	]);
}

function createCoin(color) {
	return mergeMeshes([
		cylinderMesh({ radius: 0.38, height: 0.1, segments: 16, color }),
		transformMesh(starMesh({ points: 6, outer: 0.22, inner: 0.1, height: 0.12, color: COLORS.shot }), { rotate: [Math.PI / 2, 0, 0], translate: [0, 0.08, 0] })
	]);
}

function createBoss() {
	return mergeMeshes([
		sphereMesh({ radius: 2.2, rings: 10, segments: 16, color: COLORS.boss }),
		transformMesh(ringMesh({ outer: 3.5, inner: 3.15, segments: 28, color: COLORS.shot }), { rotate: [Math.PI / 2, 0, 0] }),
		transformMesh(ringMesh({ outer: 4.1, inner: 3.82, segments: 28, color: COLORS.boss }), { rotate: [Math.PI / 3, 0, 0] })
	]);
}
