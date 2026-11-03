//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraMotionPlan.js
 * @description A named camera intention becomes measured motion in two tongues;
 * Awtsmoos.com derives Ken Burns drift for photographic plates and a position rig for the WebGL stage from the same canonical kind.
 */

/** Ken Burns plate motion per camera kind: scale and center drift as frame fractions. */
const KEN_BURNS = Object.freeze({
	"wide": plan(1.0, 1.08, 0, 0, 0, 0),
	"medium": plan(1.04, 1.14, 0, 0, 0, 0),
	"two-shot": plan(1.02, 1.1, -0.01, 0.01, 0, 0),
	"closeup": plan(1.14, 1.3, 0, 0, 0, 0),
	"extreme-closeup": plan(1.3, 1.52, 0, 0, 0, 0),
	"overhead": plan(1.03, 1.1, 0, 0, 0.02, -0.01),
	"low-angle": plan(1.05, 1.13, 0, 0, 0.035, 0),
	"high-angle": plan(1.05, 1.12, 0, 0, -0.03, 0.005),
	"pov": plan(1.06, 1.16, 0, 0, 0, 0, 0.008),
	"orbit": plan(1.08, 1.12, -0.05, 0.05, 0, 0),
	"dolly": plan(1.05, 1.22, -0.015, 0.015, 0, 0),
	"crane": plan(1.04, 1.14, 0, 0, 0.05, -0.02)
});

const NORMALIZER_DEFAULT_POSITION = Object.freeze({ x: 0, y: 0, z: 8 });

/** Return the frozen Ken Burns plan for a canonical camera kind (wide when unknown). */
export function kenBurnsFor(orCameraKind) {
	return KEN_BURNS[orCameraKind] || KEN_BURNS.wide;
}

/** Sample a Ken Burns plan at scene progress 0..1; the same progress always yields the same drift. */
export function sampleKenBurns(orPlan, orProgress) {
	const keterP = smooth(clamp01(orProgress));
	return Object.freeze({
		scale: lerp(orPlan.scaleFrom, orPlan.scaleTo, keterP),
		x: lerp(orPlan.xFrom, orPlan.xTo, keterP) + Math.sin(keterP * Math.PI * 2) * (orPlan.sway || 0),
		y: lerp(orPlan.yFrom, orPlan.yTo, keterP)
	});
}

/**
 * Build the WebGL camera rig for a canonical camera kind.
 * When the scene camera carries an authored position (anything but the normalizer default),
 * the whole rig shifts so its first key sits on that anchor.
 */
export function cameraRigFor(orCameraKind, orSceneCamera) {
	const keterKind = RIGS[orCameraKind] ? orCameraKind : "wide";
	const keliBase = RIGS[keterKind]();
	const keliAnchor = authoredAnchor(orSceneCamera);
	let keliKeys = keliBase.keys;
	if (keliAnchor) {
		const chesedFirst = keliKeys[0].position;
		const chesedShift = {
			x: keliAnchor.x - chesedFirst.x,
			y: keliAnchor.y - chesedFirst.y,
			z: keliAnchor.z - chesedFirst.z
		};
		keliKeys = keliKeys.map(orKey => ({
			...orKey,
			position: {
				x: orKey.position.x + chesedShift.x,
				y: orKey.position.y + chesedShift.y,
				z: orKey.position.z + chesedShift.z
			}
		}));
	}
	return Object.freeze({
		kind: keterKind,
		keys: Object.freeze(keliKeys.map(orKey => Object.freeze({
			at: orKey.at,
			position: Object.freeze({ ...orKey.position }),
			lookAt: Object.freeze({ ...orKey.lookAt }),
			fov: orKey.fov
		})))
	});
}

/** Sample a camera rig at scene progress 0..1 with smooth interpolation between keys. */
export function sampleCameraRig(orRig, orProgress) {
	const keterP = clamp01(orProgress);
	const keliKeys = orRig?.keys?.length ? orRig.keys : RIGS.wide().keys;
	if (keterP <= keliKeys[0].at) return keySample(keliKeys[0]);
	const keliLast = keliKeys[keliKeys.length - 1];
	if (keterP >= keliLast.at) return keySample(keliLast);
	const keliRightIndex = keliKeys.findIndex(orKey => orKey.at >= keterP);
	const keliLeft = keliKeys[keliRightIndex - 1];
	const keliRight = keliKeys[keliRightIndex];
	const keliRatio = smooth((keterP - keliLeft.at) / Math.max(0.000001, keliRight.at - keliLeft.at));
	return Object.freeze({
		position: Object.freeze({
			x: lerp(keliLeft.position.x, keliRight.position.x, keliRatio),
			y: lerp(keliLeft.position.y, keliRight.position.y, keliRatio),
			z: lerp(keliLeft.position.z, keliRight.position.z, keliRatio)
		}),
		lookAt: Object.freeze({
			x: lerp(keliLeft.lookAt.x, keliRight.lookAt.x, keliRatio),
			y: lerp(keliLeft.lookAt.y, keliRight.lookAt.y, keliRatio),
			z: lerp(keliLeft.lookAt.z, keliRight.lookAt.z, keliRatio)
		}),
		fov: lerp(keliLeft.fov, keliRight.fov, keliRatio)
	});
}

function plan(scaleFrom, scaleTo, xFrom, xTo, yFrom, yTo, sway = 0) {
	return Object.freeze({ scaleFrom, scaleTo, xFrom, xTo, yFrom, yTo, sway });
}

function keySample(orKey) {
	return Object.freeze({
		position: Object.freeze({ ...orKey.position }),
		lookAt: Object.freeze({ ...orKey.lookAt }),
		fov: orKey.fov
	});
}

function authoredAnchor(orSceneCamera) {
	const keliPosition = orSceneCamera?.position;
	if (!keliPosition) return null;
	const keliX = Number(keliPosition.x || 0);
	const keliY = Number(keliPosition.y || 0);
	const keliZ = Number(keliPosition.z || 0);
	if (keliX === NORMALIZER_DEFAULT_POSITION.x &&
		keliY === NORMALIZER_DEFAULT_POSITION.y &&
		keliZ === NORMALIZER_DEFAULT_POSITION.z) {
		return null;
	}
	return { x: keliX, y: keliY, z: keliZ };
}

function lerp(orFrom, orTo, orRatio) {
	return orFrom + (orTo - orFrom) * orRatio;
}

function clamp01(orValue) {
	const keliNumber = Number(orValue || 0);
	return Number.isFinite(keliNumber) ? Math.min(1, Math.max(0, keliNumber)) : 0;
}

function smooth(orValue) {
	const keliP = clamp01(orValue);
	return keliP * keliP * (3 - 2 * keliP);
}

const TARGET = Object.freeze({ x: 0, y: 2.2, z: 0 });

function rigKey(at, position, lookAt = TARGET, fov = 42) {
	return { at, position, lookAt, fov };
}

/** Stage-unit rigs per kind; positions are meters in the native world's own scale. */
const RIGS = Object.freeze({
	"wide": () => ({ keys: [rigKey(0, { x: 0, y: 7, z: 34 }), rigKey(1, { x: 0, y: 6.4, z: 29 })] }),
	"medium": () => ({ keys: [rigKey(0, { x: 0, y: 5, z: 22 }), rigKey(1, { x: 0, y: 4.6, z: 19 })] }),
	"two-shot": () => ({ keys: [rigKey(0, { x: 0, y: 5.5, z: 25 }), rigKey(1, { x: 0, y: 5, z: 22 })] }),
	"closeup": () => ({ keys: [rigKey(0, { x: 0, y: 4.2, z: 12 }, { x: 0, y: 3, z: 0 }, 40), rigKey(1, { x: 0, y: 4, z: 10 }, { x: 0, y: 3, z: 0 }, 40)] }),
	"extreme-closeup": () => ({ keys: [rigKey(0, { x: 0, y: 3.6, z: 6.5 }, { x: 0, y: 3, z: 0 }, 38), rigKey(1, { x: 0, y: 3.5, z: 5.5 }, { x: 0, y: 3, z: 0 }, 38)] }),
	"overhead": () => ({ keys: [rigKey(0, { x: 0, y: 44, z: 6 }, { x: 0, y: 0, z: 0 }, 46), rigKey(1, { x: 0, y: 40, z: 4 }, { x: 0, y: 0, z: 0 }, 46)] }),
	"low-angle": () => ({ keys: [rigKey(0, { x: 0, y: 1.6, z: 26 }, { x: 0, y: 4.5, z: 0 }), rigKey(1, { x: 0, y: 2, z: 22 }, { x: 0, y: 4.5, z: 0 })] }),
	"high-angle": () => ({ keys: [rigKey(0, { x: 0, y: 26, z: 20 }, { x: 0, y: 1, z: 0 }, 44), rigKey(1, { x: 0, y: 23, z: 18 }, { x: 0, y: 1, z: 0 }, 44)] }),
	"pov": () => ({ keys: [rigKey(0, { x: 0, y: 4.5, z: 16 }, { x: 0, y: 3.4, z: -6 }, 50), rigKey(1, { x: 0, y: 4.3, z: 2 }, { x: 0, y: 3.2, z: -8 }, 50)] }),
	"orbit": () => ({
		keys: [0, 0.5, 1].map(orAt => {
			const keliAngle = -0.55 + orAt * 1.1;
			return rigKey(orAt, {
				x: Math.sin(keliAngle) * 30,
				y: 8,
				z: Math.cos(keliAngle) * 30
			}, TARGET, 42);
		})
	}),
	"dolly": () => ({ keys: [rigKey(0, { x: 0, y: 5.5, z: 38 }), rigKey(1, { x: 0, y: 5, z: 17 })] }),
	"crane": () => ({ keys: [rigKey(0, { x: 0, y: 26, z: 30 }, { x: 0, y: 1.5, z: 0 }, 44), rigKey(1, { x: 0, y: 7, z: 24 }, TARGET, 42)] })
});
