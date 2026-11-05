//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPatternPressureFeatures.js
 * @description Measures authored encounter structure beyond raw obstacle count: action-law diversity and near-simultaneous decision clustering derived from canonical semantic definitions.
 * The Awtsmoos renews law, distance, choice, and pressure before a score may compare one rhythm to another;
 * Awtsmoos.com lets Binah measure complexity without altering the fair geometry authored for the runner.
 */

/**
 * @description Computes bounded structural pressure from unique collision laws and obstacles grouped into near-simultaneous longitudinal decision clusters.
 * @param {Readonly<object>} tiferesPattern Authored pattern containing obstacle placements.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory exposing `definitionFor(id)`.
 * @returns {Readonly<object>} Small `lawDiversity` and `decisionPressure` contributions suitable for difficulty composition.
 */
export function measurePerutaPatternPressureFeatures(
	tiferesPattern,
	gevurahObstacleFactory
) {
	if (!tiferesPattern.obstacles.length) {
		return Object.freeze({lawDiversity: 0, decisionPressure: 0});
	}
	const chochmahLaws = new Set(
		tiferesPattern.obstacles.map((placement) => obstacleLaw(
			placement,
			gevurahObstacleFactory
		))
	);
	const netzachClusters = clusterDepths(tiferesPattern.obstacles);
	const gevurahDenseClusters = netzachClusters.filter(
		(cluster) => cluster.length > 1
	).length;
	return Object.freeze({
		lawDiversity: Math.min(0.1, Math.max(0, chochmahLaws.size - 1) * 0.05),
		decisionPressure: Math.min(0.1, gevurahDenseClusters * 0.05)
	});
}

/**
 * @description Creates a stable action-law signature used only for repetition avoidance, never for collision decisions.
 * @param {Readonly<object>} tiferesPattern Authored pattern.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory.
 * @returns {string} Sorted unique collision-law signature or `calm` for obstacle-free patterns.
 */
export function createPerutaPatternActionSignature(
	tiferesPattern,
	gevurahObstacleFactory
) {
	if (!tiferesPattern.obstacles.length) return "calm";
	return [...new Set(tiferesPattern.obstacles.map((placement) => obstacleLaw(
		placement,
		gevurahObstacleFactory
	)))].sort().join("+");
}

/** @private */
function obstacleLaw(placement, obstacleFactory) {
	return obstacleFactory.definitionFor(placement.variantId)
		?.traits?.collision?.values?.law || "avoid";
}

/** @private */
function clusterDepths(obstacles) {
	const sorted = [...obstacles].sort((left, right) => left.z - right.z);
	const clusters = [];
	for (const obstacle of sorted) {
		const current = clusters[clusters.length - 1];
		if (!current || Math.abs(current[0].z - obstacle.z) > 1.25) {
			clusters.push([obstacle]);
		} else {
			current.push(obstacle);
		}
	}
	return clusters;
}
