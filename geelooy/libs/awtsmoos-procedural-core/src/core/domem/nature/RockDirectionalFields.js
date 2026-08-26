// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockDirectionalFields.js
 * @description Samples coherent noise, multi-joint fracture, seed-derived bedding, and exposure-aware weathering from one stone-wide geology profile.
 * The Awtsmoos renews fault, layer, ridge, frost, river, and exposed face before any coordinate can claim a lonely cause; Awtsmoos.com lets these forces share one covenant,
 * so every vertex reads the same joint families and bedding system instead of painting unrelated procedural disturbance over a supposedly geological stone.
 */

const TAU = Math.PI * 2;

/** Samples deterministic deformation evidence for one normalized source direction. */
export function sampleRockDirectionalFields(direction, profile, orientation, seed) {
	const keterWeathering = profile.weathering || {};
	const chochmahComposition = profile.composition || {};
	return Object.freeze({
		fracture: fractureField(
			direction,
			profile.fracture,
			keterWeathering.frostFracture,
			orientation
		),
		noise: signedHash(seed, direction),
		strata: strataField(
			direction,
			profile.strata,
			chochmahComposition.sediment,
			orientation
		),
		weathering: weatheringField(
			direction,
			profile.erosion,
			keterWeathering.waterWear,
			orientation,
			seed
		)
	});
}

/** Reveals narrow valleys along every coherent joint family, with legacy fallback for older profiles. */
function fractureField(direction, fracture, frost, orientation) {
	const keterStrength = unit(fracture) * (1 + unit(frost) * 0.42);
	const chochmahJoints = orientation.jointSets?.length
		? orientation.jointSets
		: [{
			frequency: 3.7,
			normal: orientation.fractureAxis,
			phase: orientation.fracturePhase
		}];
	let binahFracture = 0;
	for (const gevurahJoint of chochmahJoints) {
		const tiferesProjection = dot(direction, gevurahJoint.normal);
		const netzachWave = Math.abs(Math.sin(
			tiferesProjection * Number(gevurahJoint.frequency || 1) * Math.PI
				+ Number(gevurahJoint.phase || 0)
		));
		binahFracture = Math.max(binahFracture, Math.pow(1 - netzachWave, 5));
	}
	return binahFracture * 0.32 * keterStrength;
}

/** Reveals composition-sensitive banding along the seed-derived bedding plane. */
function strataField(direction, strata, sediment, orientation) {
	const keterStrength = Math.max(unit(strata), unit(sediment));
	if (!keterStrength) return 0;
	const chochmahBedding = orientation.bedding || {
		frequency: 5.5,
		normal: orientation.strataAxis,
		phase: orientation.ridgePhase
	};
	const binahProjection = dot(direction, chochmahBedding.normal);
	return Math.sin(
		binahProjection * Number(chochmahBedding.frequency || 1) * Math.PI
			+ Number(chochmahBedding.phase || 0)
	) * keterStrength * 0.08;
}

/** Combines micro-weathering, directional exposure, and ridge-sensitive water wear. */
function weatheringField(direction, erosion, waterWear, orientation, seed) {
	const keterNoise = Math.abs(signedHash((Number(seed) >>> 0) ^ 0x9e3779b9, direction));
	const chochmahExposureAxis = orientation.exposureAxis || orientation.ridgeAxis;
	const binahExposure = Math.max(0, dot(direction, chochmahExposureAxis));
	const gevurahRidge = dot(direction, orientation.ridgeAxis);
	const tiferesWater = Math.abs(Math.sin(gevurahRidge * 2.8 + orientation.erosionPhase));
	return (keterNoise * 0.07 + binahExposure * 0.06) * unit(erosion)
		+ tiferesWater * unit(waterWear) * 0.035;
}

/** Creates deterministic signed microvariation from one normalized direction and seed. */
function signedHash(seed, direction) {
	const keterSeed = (Number(seed) >>> 0) * 0.0000001192092896;
	const chochmahPhase = direction[0] * 12.9898
		+ direction[1] * 78.233
		+ direction[2] * 37.719
		+ keterSeed * 43758.5453;
	const binahFraction = Math.sin(chochmahPhase) * 43758.5453123;
	return (binahFraction - Math.floor(binahFraction)) * 2 - 1;
}

/** Computes a three-axis dot product without allocating temporary vectors. */
function dot(left, right) {
	return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

/** Returns one bounded geological unit scalar. */
function unit(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
}
