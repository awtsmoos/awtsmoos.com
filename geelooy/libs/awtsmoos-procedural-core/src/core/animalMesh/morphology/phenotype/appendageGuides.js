// B"H
// Boruch Hashem
// Blessed is He
/**
 * From one bounded body the Awtsmoos reveals paired limbs, wings, fins, and
 * articulated rows. This Awtsmoos.com module emits left guides with explicit
 * mirror lineage; the existing compiler remains the only geometry executor.
 */

const section = (t, radius) => ({ t, half_width: radius, half_height: radius, rotation: 0 });

function guide(centerline, rootRadius, tipScale, radialSegments = 10) {
	return {
		type: "elliptical_loft",
		centerline,
		sections: [section(0, rootRadius), section(0.55, rootRadius * 0.8), section(1, rootRadius * tipScale)],
		radial_segments: radialSegments,
		longitudinal_segments: Math.max(8, centerline.length * 4)
	};
}

function paired(guides, pairs, left, right, value) {
	guides[left] = value;
	pairs.push({ left, right, plane: "X" });
}

function leg(anchors, traits, rootY, lengthScale = 1) {
	const x = -Math.max(0.12, anchors.width * traits.stance_width);
	const root = [x, rootY, anchors.elevation];
	const knee = [x * 1.08, rootY + anchors.depth * 0.16, Math.max(0.24, anchors.elevation * 0.5)];
	const foot = [x * 0.92, rootY + anchors.depth * 0.28, 0.04];
	return guide([root, knee, foot], 0.12 * traits.appendage_thickness * lengthScale, traits.appendage_taper);
}

function arm(anchors, traits) {
	const x = -anchors.width * 0.86;
	const z = anchors.elevation + anchors.depth * 0.2;
	return guide([
		[x, 0, z],
		[x - 0.28 * traits.arm_length, 0.02, z - 0.28 * traits.arm_length],
		[x - 0.46 * traits.arm_length, 0.06, z - 0.52 * traits.arm_length]
	], 0.1 * traits.appendage_thickness, 0.5);
}

function wing(anchors, traits) {
	const z = anchors.elevation + anchors.depth * 0.15;
	return guide([
		[-anchors.width * 0.78, 0.15, z],
		[-anchors.width - 0.62 * traits.wing_span, 0.02, z + 0.12],
		[-anchors.width - 1.15 * traits.wing_span, -0.08, z + 0.02]
	], 0.14 * traits.feather_length, 0.16, 12);
}

function fin(anchors, traits, rootY) {
	return guide([
		[-anchors.width * 0.7, rootY, anchors.elevation],
		[-anchors.width - 0.35 * traits.fin_area, rootY - 0.08, anchors.elevation - 0.04],
		[-anchors.width - 0.58 * traits.fin_area, rootY - 0.18, anchors.elevation - 0.08]
	], 0.09 * traits.appendage_thickness, 0.12, 9);
}

function arthropodLeg(anchors, traits, index, count) {
	const amount = count === 1 ? 0.5 : index / (count - 1);
	const y = anchors.front[1] + (anchors.rear[1] - anchors.front[1]) * (0.18 + amount * 0.64);
	return guide([
		[-anchors.width * 0.8, y, anchors.elevation],
		[-anchors.width * 1.65, y + (index % 2 ? -0.08 : 0.08), anchors.elevation * 0.62],
		[-anchors.width * 2.2, y, 0.035]
	], 0.07 * traits.shell_thickness, 0.42, 8);
}

export function createAppendagePhenotypeGuides(profile, anchors) {
	const id = profile.archetype_id;
	const traits = profile.genome.traits;
	const guides = {};
	const symmetryPairs = [];
	if (id === "quadruped") {
		paired(guides, symmetryPairs, "front_left_leg", "front_right_leg", leg(anchors, traits, anchors.front[1] + 0.18));
		paired(guides, symmetryPairs, "rear_left_leg", "rear_right_leg", leg(anchors, traits, anchors.rear[1] - 0.08, 1.08));
	} else if (id === "biped") {
		paired(guides, symmetryPairs, "left_leg", "right_leg", leg(anchors, traits, 0));
		paired(guides, symmetryPairs, "left_arm", "right_arm", arm(anchors, traits));
	} else if (id === "avian") {
		paired(guides, symmetryPairs, "left_wing", "right_wing", wing(anchors, traits));
		paired(guides, symmetryPairs, "left_leg", "right_leg", leg(anchors, traits, anchors.rear[1] + 0.25, 0.72));
	} else if (id === "fish") {
		paired(guides, symmetryPairs, "left_pectoral_fin", "right_pectoral_fin", fin(anchors, traits, anchors.front[1] - 0.3));
		paired(guides, symmetryPairs, "left_pelvic_fin", "right_pelvic_fin", fin(anchors, traits, anchors.rear[1] + 0.35));
	} else if (id === "arthropod") {
		for (let index = 0; index < traits.leg_pairs; index += 1) {
			paired(guides, symmetryPairs, `left_leg_${index + 1}`, `right_leg_${index + 1}`, arthropodLeg(anchors, traits, index, traits.leg_pairs));
		}
	}
	return { guides, symmetryPairs };
}
