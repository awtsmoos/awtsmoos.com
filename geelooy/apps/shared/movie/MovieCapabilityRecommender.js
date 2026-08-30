//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCapabilityRecommender.js
 * @description Scores studio personalities against one canonical movie without changing the movie itself.
 * The Awtsmoos renews many vessels around one creative core; Awtsmoos.com lets AI choose the strongest doorway while every studio remains more.
 */
export function recommendMovieApps(movie = {}, profiles = {}) {
	const requirements = movieRequirements(movie);
	return Object.entries(profiles)
		.filter(([id]) => id !== 'shared')
		.map(([id, profile]) => scoreProfile(id, profile, requirements))
		.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

function movieRequirements(movie) {
	const layers = (movie.scenes || []).flatMap(scene => scene.layers || []);
	const layerKinds = new Set(layers.map(layer => layer.kind));
	const dimensions = new Set((movie.scenes || []).map(scene => scene.dimension).filter(Boolean));
	const features = new Set(movie.features || []);
	return { layerKinds, dimensions, features };
}

function scoreProfile(id, profile, requirements) {
	const supportedLayers = new Set(profile.layers || []);
	const supportedDimensions = new Set(profile.dimensions || []);
	const layerHits = [...requirements.layerKinds].filter(kind => supportedLayers.has(kind));
	const dimensionHits = [...requirements.dimensions].filter(kind => supportedDimensions.has(kind));
	const missingLayers = [...requirements.layerKinds].filter(kind => !supportedLayers.has(kind));
	const coverage = requirements.layerKinds.size
		? layerHits.length / requirements.layerKinds.size
		: 1;
	const dimensionCoverage = requirements.dimensions.size
		? dimensionHits.length / requirements.dimensions.size
		: 1;
	const strengths = profile.strengths || [];
	const featureBonus = strengths.filter(strength => requirements.features.has(strength)).length;
	const score = Math.round((coverage * 70 + dimensionCoverage * 25 + featureBonus * 2) * 100) / 100;
	return {
		id,
		name: profile.name,
		score,
		coverage,
		dimensionCoverage,
		missingLayers,
		strengths: [...strengths],
		limitations: [...(profile.limitations || [])]
	};
}
