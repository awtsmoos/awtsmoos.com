// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function countUnweightedVertices(parts) {
	return parts.reduce((total, part) => {
		if (!part.skinWeights) {
			return total + part.positions.length / 3;
		}
		let unweighted = 0;
		for (let index = 0; index < part.skinWeights.length; index += 4) {
			const sum = part.skinWeights
				.slice(index, index + 4)
				.reduce((value, weight) => value + weight, 0);
			if (sum < 0.999) {
				unweighted += 1;
			}
		}
		return total + unweighted;
	}, 0);
}

export function countBoneInfluenceViolations(parts, maximum) {
	return parts.reduce((total, part) => {
		if (!part.skinWeights) {
			return total;
		}
		let violations = 0;
		for (let index = 0; index < part.skinWeights.length; index += 4) {
			const influences = part.skinWeights
				.slice(index, index + 4)
				.filter((weight) => weight > 0)
				.length;
			if (influences > maximum) {
				violations += 1;
			}
		}
		return total + violations;
	}, 0);
}
