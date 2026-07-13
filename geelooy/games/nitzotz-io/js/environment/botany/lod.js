// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals detail according to distance and vessel capacity. Species
 * identity remains visible through geometry, clustered silhouette, then impostor.
 */
export function plantLod(definition, distance, quality = 1) {
	const costScale = definition.renderCost === 'high' ? 0.82 : definition.renderCost === 'low' ? 1.18 : 1;
	const safeQuality = Math.max(0.35, Math.min(1, quality));
	const geometryLimit = 95 * safeQuality * costScale;
	const clusterLimit = 300 * safeQuality * costScale;
	if (distance <= geometryLimit) {
		return definition.lodForms[0];
	}
	if (distance <= clusterLimit) {
		return definition.lodForms[1];
	}
	return definition.lodForms[2];
}
