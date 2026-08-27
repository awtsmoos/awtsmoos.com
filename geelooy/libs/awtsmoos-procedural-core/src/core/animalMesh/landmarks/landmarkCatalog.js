// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

const LANDMARK_NAMES = [
	"nose_tip",
	"muzzle_center",
	"chin",
	"jaw_hinge",
	"forehead_center",
	"poll",
	"eye_left",
	"eye_right",
	"ear_base_left",
	"ear_base_right",
	"ear_tip_left",
	"ear_tip_right",
	"horn_base_left",
	"horn_base_right",
	"horn_tip_left",
	"horn_tip_right",
	"neck_base",
	"withers",
	"sternum",
	"spine_mid",
	"pelvis_center",
	"tail_base",
	"tail_tip",
	"shoulder_left",
	"shoulder_right",
	"elbow_left",
	"elbow_right",
	"front_knee_left",
	"front_knee_right",
	"front_ankle_left",
	"front_ankle_right",
	"front_left_hoof",
	"front_right_hoof",
	"hip_left",
	"hip_right",
	"stifle_left",
	"stifle_right",
	"hock_left",
	"hock_right",
	"rear_ankle_left",
	"rear_ankle_right",
	"rear_left_hoof",
	"rear_right_hoof",
	"wing_root_left",
	"wing_root_right",
	"wing_tip_left",
	"wing_tip_right",
	"fin_root_left",
	"fin_root_right",
	"fin_tip_left",
	"fin_tip_right"
];

export const ANIMAL_LANDMARK_NAMES = Object.freeze(LANDMARK_NAMES);

export const ANIMAL_LANDMARK_SET = new Set(ANIMAL_LANDMARK_NAMES);

/**
 * Returns whether a landmark spelling is part of the stable public vocabulary.
 *
 * @param {string} name Candidate landmark name.
 * @returns {boolean} True when the name is standardized.
 */
export function isKnownAnimalLandmark(name) {
	return ANIMAL_LANDMARK_SET.has(name);
}
