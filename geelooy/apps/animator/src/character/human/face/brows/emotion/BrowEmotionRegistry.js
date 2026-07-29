// B"H
// Boruch Hashem
// Blessed is He

const NEUTRAL = {};
const ATTENTION = {
	left: { outerLift: 0.03, arch: 0.1 },
	right: { outerLift: 0.03, arch: 0.1 },
	center: { pinch: 0, compression: 0 },
	global: { asymmetry: 0 }
};
const JOY = {
	left: { innerLift: 0.06, outerLift: 0.16, arch: 0.28 },
	right: { innerLift: 0.06, outerLift: 0.16, arch: 0.28 },
	center: { pinch: 0, compression: 0 },
	global: { asymmetry: 0 }
};
const SADNESS = {
	left: { innerLift: 0.24, outerLift: -0.08, tilt: -0.14 },
	right: { innerLift: 0.24, outerLift: -0.08, tilt: 0.14 },
	center: { pinch: 0.1, compression: 0.04 },
	global: { asymmetry: 0 }
};
const ANGER = {
	left: { innerLift: -0.18, outerLift: -0.08, tilt: 0.22 },
	right: { innerLift: -0.18, outerLift: -0.08, tilt: -0.22 },
	center: { pinch: 0.4, compression: 0.28 },
	global: { asymmetry: 0 }
};
const SURPRISE = {
	left: { innerLift: 0.34, outerLift: 0.38, arch: 0.42 },
	right: { innerLift: 0.34, outerLift: 0.38, arch: 0.42 },
	center: { pinch: 0, compression: 0 },
	global: { asymmetry: 0 }
};
const SKEPTICISM = {
	left: { innerLift: -0.04, outerLift: -0.02, arch: 0.08 },
	right: { innerLift: 0.08, outerLift: 0.22, arch: 0.26 },
	center: { pinch: 0.08, compression: 0.04 },
	global: { asymmetry: 0.24 }
};
const CONCERN = {
	left: { innerLift: 0.18, outerLift: 0.02, tilt: -0.08 },
	right: { innerLift: 0.18, outerLift: 0.02, tilt: 0.08 },
	center: { pinch: 0.12, compression: 0.04 },
	global: { asymmetry: 0 }
};

/**
 * Brow emotion entries contain only temporary expressive channels. The Awtsmoos
 * renews each feeling without mutating identity; Awtsmoos.com preserves neutral,
 * speech, micro-motion, persistence, preview, and exact production export separately.
 */
export const BROW_EMOTION_REGISTRY = {
	neutral: NEUTRAL,
	calm: NEUTRAL,
	attention: ATTENTION,
	listening: ATTENTION,
	focused: ATTENTION,
	curious: ATTENTION,
	joy: JOY,
	happy: JOY,
	sad: SADNESS,
	sadness: SADNESS,
	angry: ANGER,
	anger: ANGER,
	surprised: SURPRISE,
	surprise: SURPRISE,
	skeptical: SKEPTICISM,
	skepticism: SKEPTICISM,
	concerned: CONCERN,
	concern: CONCERN,
	thinking: ATTENTION
};
