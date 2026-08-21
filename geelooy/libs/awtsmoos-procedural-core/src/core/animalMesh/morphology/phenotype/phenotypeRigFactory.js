// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file phenotypeRigFactory.js
 * @description Orchestrates a stable mixed-guide rig while focused chain helpers own line validation, bone creation, mirroring, and parent choice.
 * RESPONSIBILITY: create root/body/axial/component chains and emit the recipe-compatible rig envelope.
 * NON-RESPONSIBILITY: this file does not invent membrane bones, compile geometry, skin vertices, or simulate motion.
 * The Awtsmoos gives motion to every truthful line without confusing surface for skeleton; Awtsmoos.com gathers those chains into one rig while each helper carries only its rightful light.
 */

import {
	axialRigParents,
	componentRigParent,
	createRigChain,
	hasRigCenterline,
	mirrorRigChain
} from './PhenotypeRigChains.js';

/**
 * Creates one mixed-guide-safe rig for a phenotype recipe.
 * @param {object} profile Canonical morphology profile.
 * @param {object} guides Mixed loft and membrane anatomical guides.
 * @param {Array<object>} [symmetryPairs=[]] Explicit bilateral relationships.
 * @returns {object} Recipe-compatible skeletal rig contract.
 */
export function createPhenotypeRig(profile, guides, symmetryPairs = []) {
	const roots = axialRigParents(guides);
	const rootTail = guides.body.centerline[0];
	const bones = [rootBone(rootTail)];
	const bodyBones = createRigChain(
		'body',
		guides.body,
		roots.body
	);
	bones.push(...bodyBones);
	appendAxialBones(bones, guides, roots);
	appendComponentBones(
		bones,
		guides,
		symmetryPairs,
		bodyBones
	);
	return {
		bones,
		enabled: true,
		type: profile.archetype_id,
		weighting: {
			genome_id: profile.genome.id,
			maximum_influences_per_vertex: 4,
			method: 'automatic_then_constrained_cleanup',
			preserve_symmetry: true
		}
	};
}

function rootBone(rootTail) {
	return {
		id: 'root',
		parent: null,
		head: [0, 0, 0],
		tail: [
			rootTail[0],
			rootTail[1],
			Math.max(0.1, rootTail[2] * 0.35)
		]
	};
}

function appendAxialBones(bones, guides, roots) {
	for (const partId of ['head', 'tail']) {
		if (!guides[partId]) {
			continue;
		}
		bones.push(...createRigChain(
			partId,
			guides[partId],
			roots[partId]
		));
	}
}

function appendComponentBones(
	bones,
	guides,
	symmetryPairs,
	bodyBones
) {
	for (const [partId, guide] of Object.entries(guides)) {
		if (isAxial(partId) || !hasRigCenterline(guide)) {
			continue;
		}
		const chain = createRigChain(
			partId,
			guide,
			componentRigParent(partId, bodyBones)
		);
		bones.push(...chain);
		const pair = symmetryPairs.find(entry => {
			return entry.left === partId;
		});
		if (pair) {
			bones.push(...mirrorRigChain(chain, pair));
		}
	}
}

function isAxial(partId) {
	return ['body', 'head', 'tail'].includes(partId);
}
