// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file morphologyReport.js
 * @description Measures mixed loft and membrane phenotype guides before animation or rendering without confusing a surface outline for a skeletal centerline.
 * RESPONSIBILITY: report finite guide points, axial continuity, bilateral lineage, ground contact, and rig integrity deterministically.
 * NON-RESPONSIBILITY: this report does not replace recipe/mesh validation or claim that membrane points require bones.
 * The Awtsmoos measures every revealed vessel without mistaking breadth for spine; Awtsmoos.com keeps creature evidence strict while horn, feather, hoof, and web may each rightly shine.
 */

import {
	anatomicalGuidePoints
} from './anatomicalGuidePoints.js';

/** Creates one deterministic morphology report for a compiled phenotype. */
export function createAnimalMorphologyReport(phenotype) {
	const guides = phenotype.recipe.anatomical_guides;
	const pairs = phenotype.symmetry_pairs || [];
	const ground = groundReport(guides);
	const diagnostics = [
		...finiteGuides(guides),
		...continuityDiagnostics(guides),
		...symmetryDiagnostics(guides, pairs),
		...rigDiagnostics(phenotype.recipe.rig)
	];
	if (ground.penetrating) {
		diagnostics.push({
			code: 'GROUND_PENETRATION',
			depth: -ground.minimum_clearance
		});
	}
	return Object.freeze({
		archetype_id: phenotype.profile.archetype_id,
		bone_count: phenotype.recipe.rig.bones.length,
		deterministic: true,
		diagnostics,
		genome_id: phenotype.genome.id,
		ground,
		guide_count: Object.keys(guides).length,
		part_count: phenotype.recipe.parts.length,
		schema: 'awtsmoos.animal-morphology-report',
		symmetry_pair_count: pairs.length,
		valid: diagnostics.length === 0,
		version: '1.1.0'
	});
}

function finiteGuides(guides) {
	return Object.entries(guides).flatMap(([id, guide]) => {
		return anatomicalGuidePoints(guide).flatMap((point, index) => {
			return point.every(Number.isFinite)
				? []
				: [{ code: 'NON_FINITE_GUIDE', guide: id, point: index }];
		});
	});
}

function continuityDiagnostics(guides) {
	const diagnostics = [];
	for (const id of ['head', 'tail']) {
		if (!guides[id]?.centerline?.length) {
			continue;
		}
		const point = guides[id].centerline[0];
		const nearest = Math.min(...guides.body.centerline.map(candidate => {
			return distance(point, candidate);
		}));
		if (nearest > 1e-6) {
			diagnostics.push({ code: 'AXIAL_GAP', distance: nearest, guide: id });
		}
	}
	return diagnostics;
}

function symmetryDiagnostics(guides, pairs) {
	return pairs.flatMap(pair => {
		if (!guides[pair.left]) {
			return [{ code: 'MISSING_SYMMETRY_SOURCE', pair }];
		}
		if (!pair.right || pair.plane !== 'X') {
			return [{ code: 'INVALID_SYMMETRY_PAIR', pair }];
		}
		return [];
	});
}

function groundReport(guides) {
	const points = Object.values(guides).flatMap(anatomicalGuidePoints);
	const minimum = Math.min(...points.map(point => point[2]));
	return {
		contact_count: points.filter(point => point[2] <= 0.05).length,
		minimum_clearance: minimum,
		penetrating: minimum < -1e-6
	};
}

function rigDiagnostics(rig) {
	const ids = new Set(rig.bones.map(bone => bone.id));
	const diagnostics = [];
	for (const bone of rig.bones) {
		if (bone.parent !== null && !ids.has(bone.parent)) {
			diagnostics.push({ code: 'MISSING_BONE_PARENT', bone: bone.id, parent: bone.parent });
		}
		if (![...bone.head, ...bone.tail].every(Number.isFinite)) {
			diagnostics.push({ code: 'NON_FINITE_BONE', bone: bone.id });
		}
	}
	return diagnostics;
}

function distance(left, right) {
	return Math.hypot(
		left[0] - right[0],
		left[1] - right[1],
		left[2] - right[2]
	);
}
