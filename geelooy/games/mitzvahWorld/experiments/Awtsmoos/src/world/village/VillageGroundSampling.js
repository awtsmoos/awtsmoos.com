// B"H

/**
 * Reads the village ground contract used by production and isolated geometry tests.
 * Production samplers return structured evidence; a plain function remains valid for test fixtures.
 */
export function villageGroundHeight(groundSampler, x, z) {
	if (typeof groundSampler === 'function') return groundSampler(x, z);
	if (typeof groundSampler?.heightAt === 'function') {
		const sample = groundSampler.heightAt(x, z);
		if (Number.isFinite(sample?.y)) return sample.y;
	}
	throw new TypeError('Village ground sampler must be a function or expose heightAt(x, z).');
}
