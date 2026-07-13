//B"H
// Boruch Hashem
// Blessed is He
/**
 * Distinct silhouettes give every shell readable identity before it attacks.
 * The Awtsmoos is beyond silhouette while Awtsmoos.com reveals these local meshes.
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

export function createEnemyMeshes() {
	return {
		klipah: body(COLORS.klipah, 'sphere'),
		golem: body(COLORS.golem, 'block'),
		raven: raven(),
		archer: archer(),
		drainer: body([0.16, 0.72, 0.62, 1], 'ring'),
		splitter: body([0.92, 0.38, 0.68, 1], 'double'),
		summoner: body([0.35, 0.18, 0.75, 1], 'crown'),
		corrupter: body([0.85, 0.1, 0.18, 1], 'ring'),
		thief: body([0.92, 0.56, 0.08, 1], 'bag'),
		elite: body([0.9, 0.18, 0.92, 1], 'crown'),
		obstacle: cubeMesh({ size: [1.9, 2.2, 1.6], color: [0.32, 0.29, 0.36, 1] })
	};
}

function body(color, ornament) {
	const parts = [
		cubeMesh({ size: [1.2, 1.55, 1.05], color }),
		transformMesh(sphereMesh({ radius: 0.42, rings: 5, segments: 8, color }), { translate: [0, 1.02, -0.08] })
	];
	if (ornament === 'block') {
		parts.push(transformMesh(cubeMesh({ size: [1.8, 0.5, 1.35], color }), { translate: [0, 0.7, 0] }));
	} else if (ornament === 'ring') {
		parts.push(transformMesh(ringMesh({ outer: 0.75, inner: 0.56, segments: 16, color: COLORS.negative }), { rotate: [Math.PI / 2, 0, 0], translate: [0, 1.2, 0] }));
	} else if (ornament === 'double') {
		parts.push(transformMesh(sphereMesh({ radius: 0.34, rings: 5, segments: 8, color: COLORS.shot }), { translate: [-0.42, 0.7, 0] }));
		parts.push(transformMesh(sphereMesh({ radius: 0.34, rings: 5, segments: 8, color: COLORS.shot }), { translate: [0.42, 0.7, 0] }));
	} else if (ornament === 'crown') {
		parts.push(transformMesh(starMesh({ points: 7, outer: 0.65, inner: 0.3, height: 0.2, color: COLORS.shot }), { translate: [0, 1.7, 0] }));
	} else if (ornament === 'bag') {
		parts.push(transformMesh(sphereMesh({ radius: 0.5, rings: 6, segments: 8, color: COLORS.prutah }), { translate: [0.55, 0.55, 0.2] }));
	}
	return mergeMeshes(parts);
}

function raven() {
	return mergeMeshes([
		sphereMesh({ radius: 0.48, rings: 5, segments: 8, color: COLORS.raven }),
		transformMesh(cubeMesh({ size: [2.1, 0.12, 0.62], color: COLORS.raven }), { rotate: [0, 0, 0.25] })
	]);
}

function archer() {
	return mergeMeshes([
		body([0.34, 0.66, 0.22, 1], 'sphere'),
		transformMesh(cylinderMesh({ radius: 0.08, height: 1.6, segments: 6, color: COLORS.shot }), { rotate: [0, 0, Math.PI / 2], translate: [0, 0.75, -0.55] })
	]);
}
