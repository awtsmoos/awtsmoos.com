// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos clothes one validated animal recipe in many bounded forms.
 * This Awtsmoos.com vessel never invents a rival schema: it transforms the
 * existing guides, landmarks, measurements, and rig, then validates anew.
 */

import { createAnimalMeshRecipe } from "../recipes/createAnimalMeshRecipe.js";
import { normalizeAnimalGenome } from "./animalGenome.js";

const APPENDAGE_PATTERN = /(leg|limb|arm|wing|fin|hoof|paw|foot|hand)/i;
const AXIAL_PATTERN = /(torso|body|spine|neck|tail)/i;
const HEAD_PATTERN = /(head|skull|muzzle|jaw|beak)/i;
const TAIL_PATTERN = /tail/i;

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function globalPoint(point, genes, semantic) {
	const stance = APPENDAGE_PATTERN.test(semantic) ? genes.stance_width : 1;
	return [
		point[0] * genes.body_width * stance,
		point[1] * genes.body_length,
		point[2] * genes.body_height
	];
}

function applyAxialBend(point, genes, semantic) {
	if (!AXIAL_PATTERN.test(semantic) || genes.spine_bend === 0) {
		return point;
	}
	return [
		point[0] + Math.sin(point[1] * Math.PI) * genes.spine_bend * genes.body_width,
		point[1],
		point[2]
	];
}

function semanticLengthScale(semantic, genes) {
	if (TAIL_PATTERN.test(semantic)) {
		return genes.tail_length;
	}
	if (APPENDAGE_PATTERN.test(semantic)) {
		return genes.appendage_length;
	}
	if (HEAD_PATTERN.test(semantic)) {
		return genes.head_scale;
	}
	return 1;
}

function transformPointSeries(points, semantic, genes) {
	const scaled = points.map((point) => globalPoint(point, genes, semantic));
	const anchor = scaled[0];
	const lengthScale = semanticLengthScale(semantic, genes);
	return scaled.map((point, index) => {
		const lengthened = index === 0 ? point : [
			anchor[0] + (point[0] - anchor[0]) * lengthScale,
			anchor[1] + (point[1] - anchor[1]) * lengthScale,
			anchor[2] + (point[2] - anchor[2]) * lengthScale
		];
		return applyAxialBend(lengthened, genes, semantic);
	});
}

function sectionScales(semantic, genes) {
	let width = genes.body_width * genes.muscle_bulk;
	let height = genes.body_height * genes.muscle_bulk;
	if (APPENDAGE_PATTERN.test(semantic)) {
		width *= genes.appendage_thickness;
		height *= genes.appendage_thickness;
	}
	if (HEAD_PATTERN.test(semantic)) {
		width *= genes.head_scale;
		height *= genes.head_scale;
	}
	return { width, height };
}

function transformGuides(guides, genes, genomeId) {
	return Object.fromEntries(Object.entries(guides).map(([id, guide]) => {
		const scales = sectionScales(id, genes);
		return [id, {
			...guide,
			centerline: transformPointSeries(guide.centerline, id, genes),
			sections: guide.sections.map((section) => ({
				...section,
				half_width: section.half_width * scales.width,
				half_height: section.half_height * scales.height
			})),
			metadata: { ...(guide.metadata || {}), morphology_genome_id: genomeId }
		}];
	}));
}

function transformMeasurements(measurements, genes) {
	return Object.fromEntries(Object.entries(measurements).map(([name, measurement]) => {
		let scale = 1;
		if (/length/i.test(name)) scale = genes.body_length;
		if (/width|span/i.test(name)) scale = genes.body_width;
		if (/height/i.test(name)) scale = genes.body_height;
		return [name, { ...measurement, value: measurement.value * scale }];
	}));
}

function transformRig(rig, genes) {
	return {
		...rig,
		bones: (rig.bones || []).map((bone) => ({
			...bone,
			head: transformPointSeries([bone.head], bone.id, genes)[0],
			tail: transformPointSeries([bone.head, bone.tail], bone.id, genes)[1]
		}))
	};
}

export function applyAnimalGenome(recipeInput, genomeInput, options = {}) {
	const genome = normalizeAnimalGenome(genomeInput);
	const recipe = clone(recipeInput);
	const genes = genome.genes;
	return createAnimalMeshRecipe({
		...recipe,
		recipe_id: options.recipeId || "",
		measurements: transformMeasurements(recipe.measurements || {}, genes),
		landmarks: Object.fromEntries(Object.entries(recipe.landmarks || {}).map(
			([name, point]) => [name, transformPointSeries([point], name, genes)[0]]
		)),
		anatomical_guides: transformGuides(recipe.anatomical_guides || {}, genes, genome.id),
		rig: transformRig(recipe.rig || { enabled: false, bones: [] }, genes)
	});
}
