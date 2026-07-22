// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals bounded biological possibility without dissolving form
 * into noise. These Awtsmoos.com rules are renderer-neutral, deterministic,
 * side-effect free, and shared by genome creation, breeding, and phenotypes.
 */

const rule = (minimum, maximum, center, spread, integer = false) => Object.freeze({
	minimum,
	maximum,
	center,
	spread,
	integer
});

export const ANIMAL_GENOME_RULES = Object.freeze({
	body_length: rule(0.55, 1.8, 1, 0.28),
	body_width: rule(0.55, 1.7, 1, 0.24),
	body_height: rule(0.6, 1.65, 1, 0.2),
	body_depth: rule(0.55, 1.7, 1, 0.22),
	appendage_length: rule(0.5, 1.9, 1, 0.32),
	limb_length: rule(0.5, 1.9, 1, 0.32),
	appendage_thickness: rule(0.55, 1.65, 1, 0.24),
	appendage_taper: rule(0.25, 0.95, 0.62, 0.18),
	head_scale: rule(0.55, 1.65, 1, 0.2),
	tail_length: rule(0.25, 2.4, 1, 0.45),
	muscle_bulk: rule(0.55, 1.65, 1, 0.22),
	muscle_mass: rule(0.45, 1.7, 1, 0.24),
	spine_bend: rule(-0.35, 0.35, 0, 0.12),
	spine_flexibility: rule(0.1, 1.5, 0.7, 0.3),
	stance_width: rule(0.6, 1.7, 1, 0.22),
	gait_frequency: rule(0.35, 2.5, 1, 0.35),
	gait_stride: rule(0.35, 2.1, 1, 0.3),
	flexibility: rule(0, 1, 0.5, 0.28),
	elongation: rule(0.7, 4.8, 1, 0.5),
	wave_amplitude: rule(0.05, 1.4, 0.45, 0.3),
	wing_span: rule(0.55, 2.5, 1, 0.42),
	fin_area: rule(0.25, 2, 1, 0.35),
	lateral_wave: rule(0.15, 1.6, 0.7, 0.3),
	leg_pairs: rule(3, 12, 3, 2, true),
	shell_thickness: rule(0.2, 1.8, 1, 0.3),
	arm_length: rule(0.45, 1.65, 1, 0.28),
	torso_upright: rule(0.65, 1, 0.9, 0.08),
	feather_length: rule(0.25, 1.9, 1, 0.35),
	hoof_to_paw: rule(0, 1, 0.5, 0.3)
});

export const ANIMAL_GENOME_LINKS = Object.freeze([
	Object.freeze(["appendage_length", "limb_length"]),
	Object.freeze(["muscle_bulk", "muscle_mass"]),
	Object.freeze(["flexibility", "spine_flexibility"]),
	Object.freeze(["body_length", "elongation"])
]);
