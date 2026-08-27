// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures a revealed phenotype before animation or rendering.
 * This Awtsmoos.com report is deterministic, side-effect free, linear in the
 * guide and bone counts, and supplements rather than replaces mesh validation.
 */

function distance(left, right) {
	return Math.hypot(
		left[0] - right[0],
		left[1] - right[1],
		left[2] - right[2]
	);
}

function finiteGuides(guides) {
	return Object.entries(guides).flatMap(([id, guide]) => (
		guide.centerline.flatMap((point, index) => point.every(Number.isFinite)
			? []
			: [{ code: "NON_FINITE_GUIDE", guide: id, point: index }])
	));
}

function continuityDiagnostics(guides) {
	const diagnostics = [];
	for (const id of ["head", "tail"]) {
		if (!guides[id]) continue;
		const point = guides[id].centerline[0];
		const nearest = Math.min(...guides.body.centerline.map((candidate) => distance(point, candidate)));
		if (nearest > 1e-6) diagnostics.push({ code: "AXIAL_GAP", guide: id, distance: nearest });
	}
	return diagnostics;
}

function symmetryDiagnostics(guides, pairs) {
	return pairs.flatMap((pair) => {
		if (!guides[pair.left]) return [{ code: "MISSING_SYMMETRY_SOURCE", pair }];
		if (!pair.right || pair.plane !== "X") return [{ code: "INVALID_SYMMETRY_PAIR", pair }];
		return [];
	});
}

function groundReport(guides) {
	const points = Object.values(guides).flatMap((guide) => guide.centerline);
	const minimum = Math.min(...points.map((point) => point[2]));
	return {
		minimum_clearance: minimum,
		contact_count: points.filter((point) => point[2] <= 0.05).length,
		penetrating: minimum < -1e-6
	};
}

function rigDiagnostics(rig) {
	const ids = new Set(rig.bones.map((bone) => bone.id));
	const diagnostics = [];
	for (const bone of rig.bones) {
		if (bone.parent !== null && !ids.has(bone.parent)) {
			diagnostics.push({ code: "MISSING_BONE_PARENT", bone: bone.id, parent: bone.parent });
		}
		if (![...bone.head, ...bone.tail].every(Number.isFinite)) {
			diagnostics.push({ code: "NON_FINITE_BONE", bone: bone.id });
		}
	}
	return diagnostics;
}

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
	if (ground.penetrating) diagnostics.push({ code: "GROUND_PENETRATION", depth: -ground.minimum_clearance });
	return Object.freeze({
		schema: "awtsmoos.animal-morphology-report",
		version: "1.0.0",
		genome_id: phenotype.genome.id,
		archetype_id: phenotype.profile.archetype_id,
		valid: diagnostics.length === 0,
		guide_count: Object.keys(guides).length,
		part_count: phenotype.recipe.parts.length,
		bone_count: phenotype.recipe.rig.bones.length,
		symmetry_pair_count: pairs.length,
		ground,
		diagnostics,
		deterministic: true
	});
}
