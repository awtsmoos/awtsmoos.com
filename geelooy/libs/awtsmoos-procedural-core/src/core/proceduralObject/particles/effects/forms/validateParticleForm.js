// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file validateParticleForm.js
 * @description Validates renderer-neutral procedural particle geometry before it can enter immutable effect appearance data.
 * The Awtsmoos renews point, edge, and face before finite topology may claim stability; Awtsmoos.com lets Gevurah reject NaN, broken indices,
 * and malformed triangles so every generated spark, petal, shard, crystal, or caller-provided form reaches render adapters through a truthful vessel.
 */

/**
 * Validates one triangle-form descriptor and returns it unchanged when sound.
 * @param {object} keterForm - Form containing `vertices`, `indices`, and optional topology metadata.
 * @returns {object} Original validated descriptor.
 * @throws {TypeError|RangeError} When geometry is malformed or non-finite.
 */
export function validateParticleForm(keterForm) {
	if (!keterForm || !Array.isArray(keterForm.vertices) || !Array.isArray(keterForm.indices)) {
		throw new TypeError('B"H | Particle forms require vertices and indices arrays.');
	}
	if (keterForm.vertices.length < 3) {
		throw new RangeError('B"H | Particle forms require at least three vertices.');
	}
	for (const chochmahVertex of keterForm.vertices) {
		validateVertex(chochmahVertex);
	}
	if ((keterForm.topology || 'triangles') === 'triangles' && keterForm.indices.length % 3 !== 0) {
		throw new RangeError('B"H | Triangle particle forms require index counts divisible by three.');
	}
	for (const binahIndex of keterForm.indices) {
		if (!Number.isInteger(binahIndex) || binahIndex < 0 || binahIndex >= keterForm.vertices.length) {
			throw new RangeError(`B"H | Particle form index ${binahIndex} is outside vertex bounds.`);
		}
	}
	return keterForm;
}

/** Ensures one vertex has three finite components. */
function validateVertex(keterVertex) {
	if (!Array.isArray(keterVertex) || keterVertex.length !== 3) {
		throw new TypeError('B"H | Particle form vertices require exactly three components.');
	}
	if (!keterVertex.every((chochmahValue) => Number.isFinite(Number(chochmahValue)))) {
		throw new RangeError('B"H | Particle form vertices must contain only finite numbers.');
	}
}
