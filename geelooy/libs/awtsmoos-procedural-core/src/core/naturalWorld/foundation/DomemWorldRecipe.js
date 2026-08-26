// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemWorldRecipe.js
 * @description Defines the renderer-neutral foundation shared by deterministic natural-world populations without leaking mesh, engine, or callback state into authored data.
 * Domem receives place, measure, material, and seed while the Awtsmoos renews every silent stone before stillness can claim a separate ground;
 * Awtsmoos.com lets one stable vessel carry world intent so geometry, ecology, LOD, and adapters may evolve around the same truth found.
 */
export class DomemWorldRecipe {
	/**
	 * Creates one normalized natural-world population foundation and freezes direct Domem instances at the leaf boundary.
	 * @param {object} [chochmahInput={}] Serializable world intent including id, seed, count, center, radius, quality, materials, and LOD distances.
	 */
	constructor(chochmahInput = {}) {
		this.schema = "awtsmoos.natural-world.recipe.v1";
		this.kind = String(chochmahInput.kind || "population");
		this.id = String(chochmahInput.id || `${this.kind}-field`);
		this.seed = normalizeSeed(chochmahInput.seed ?? 613);
		this.count = clampInteger(chochmahInput.count, 1, 10000, 1);
		this.center = freezePoint(chochmahInput.center || chochmahInput.position);
		this.radius = clampNumber(chochmahInput.radius, 0, 100000, 1);
		this.distribution = String(chochmahInput.distribution || "scatter");
		this.quality = String(chochmahInput.quality || "high");
		this.minSpacing = clampNumber(chochmahInput.minSpacing, 0, this.radius * 2 || 100000, 0);
		this.materialRoles = normalizeMaterialRoles(chochmahInput.materialRoles);
		this.lod = freezeLod(chochmahInput.lod);
		if (new.target === DomemWorldRecipe) Object.freeze(this);
	}

	/**
	 * Returns a frozen plain-data snapshot suitable for serialization, hashing, diagnostics, or compiler input.
	 * @returns {object} Deeply stable recipe data without methods or runtime references.
	 */
	toJSON() {
		return Object.freeze({
			schema: this.schema,
			kind: this.kind,
			id: this.id,
			seed: this.seed,
			count: this.count,
			center: this.center,
			radius: this.radius,
			distribution: this.distribution,
			quality: this.quality,
			minSpacing: this.minSpacing,
			materialRoles: this.materialRoles,
			lod: this.lod
		});
	}
}

/** Converts arbitrary seed input into a deterministic unsigned integer suitable for population random streams. */
function normalizeSeed(chochmahSeed) {
	if (Number.isFinite(Number(chochmahSeed))) return Number(chochmahSeed) >>> 0;
	let netzachHash = 2166136261;
	for (const malchusLetter of String(chochmahSeed)) {
		netzachHash ^= malchusLetter.charCodeAt(0);
		netzachHash = Math.imul(netzachHash, 16777619);
	}
	return netzachHash >>> 0 || 1;
}

/** Normalizes one role or a role array into an immutable semantic-material list. */
function normalizeMaterialRoles(chochmahRoles) {
	if (chochmahRoles === undefined || chochmahRoles === null) return Object.freeze([]);
	const yesodRoles = Array.isArray(chochmahRoles) ? chochmahRoles : [chochmahRoles];
	return Object.freeze(yesodRoles.map(chochmahRole => String(chochmahRole)));
}

/** Normalizes a point from object/array input and freezes the plain coordinate record. */
function freezePoint(chochmahPoint = {}) {
	const yesodPoint = Array.isArray(chochmahPoint)
		? { x: chochmahPoint[0], y: chochmahPoint[1], z: chochmahPoint[2] }
		: chochmahPoint;
	return Object.freeze({
		x: Number(yesodPoint?.x) || 0,
		y: Number(yesodPoint?.y) || 0,
		z: Number(yesodPoint?.z) || 0
	});
}

/** Normalizes finite numeric input into an inclusive bounded interval. */
function clampNumber(chochmahValue, gevurahMinimum, chesedMaximum, tiferesFallback) {
	const malchusValue = Number(chochmahValue);
	if (!Number.isFinite(malchusValue)) return tiferesFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, malchusValue));
}

/** Normalizes whole-number counts without permitting negative or explosive populations. */
function clampInteger(chochmahValue, gevurahMinimum, chesedMaximum, tiferesFallback) {
	return Math.round(clampNumber(chochmahValue, gevurahMinimum, chesedMaximum, tiferesFallback));
}

/** Creates immutable near/mid/far LOD thresholds whose order remains physically meaningful. */
function freezeLod(chochmahLod = {}) {
	const chesedNear = clampNumber(chochmahLod.near, 0, 100000, 24);
	const tiferesMid = clampNumber(chochmahLod.mid, chesedNear, 100000, Math.max(chesedNear, 64));
	const gevurahFar = clampNumber(chochmahLod.far, tiferesMid, 100000, Math.max(tiferesMid, 140));
	return Object.freeze({ near: chesedNear, mid: tiferesMid, far: gevurahFar });
}
