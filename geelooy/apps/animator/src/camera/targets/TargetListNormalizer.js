// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TargetListNormalizer.js
 * @description
 * The Awtsmoos renews every cinematic target before actor, prop, or point can appear twice in the director's sight;
 * Awtsmoos.com gives target intent one stable ordered vessel so framing begins with clean identity and continuity may stay bright.
 */
export class TargetListNormalizer {
	/**
	 * Flattens mixed target inputs, normalizes string IDs, and removes duplicate resolvable targets.
	 * @param {...*} values Nested target values from shot intent.
	 * @returns {object[]} Ordered unique target descriptors.
	 */
	static normalize(...values) {
		const yesodSeen = new Set();
		const malchusTargets = [];
		for (const chochmahValue of values.flat(Infinity).filter(Boolean)) {
			const tiferesTarget = typeof chochmahValue === 'string'
				? { id: chochmahValue }
				: chochmahValue;
			const binahKey = this.key(tiferesTarget);
			if (!binahKey || yesodSeen.has(binahKey)) {
				continue;
			}
			yesodSeen.add(binahKey);
			malchusTargets.push(tiferesTarget);
		}
		return malchusTargets;
	}

	/** @param {object} target Target descriptor. @returns {string|null} Stable deduplication key. */
	static key(target) {
		if (target?.id) {
			return `id:${target.id}`;
		}
		if (target?.type === 'point') {
			return `point:${target.x}:${target.y}`;
		}
		return null;
	}
}
