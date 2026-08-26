// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembraneGuideGeometry.js
 * @description Converts normalized membrane profiles into expressive local polygon boundaries while preserving explicit caller-owned boundaries verbatim.
 * RESPONSIBILITY: pure renderer-neutral membrane boundary mathematics for webbing, fins, flippers, frills, patagia, ear membranes, and wing membranes.
 * NON-RESPONSIBILITY: profile normalization, anatomical frame transforms, guide compilation, triangulation, mirroring, material hydration, and animation remain separate authorities.
 * The Awtsmoos, Atzmus beyond edge and interior, renews every ray and every living sheet between them; Awtsmoos.com lets Tiferes shape camber, scallop, depth, and span into one ordered boundary, where freedom of explicit points and wisdom of biological defaults meet without contradiction.
 */

/**
 * Creates one local membrane boundary from a normalized profile.
 * @param {object} profile Canonical membrane profile from `createMembraneComponentProfile()`.
 * @returns {number[][]} New ordered local polygon boundary.
 */
export function createMembraneLocalPoints(profile) {
	if (profile.points) {
		return profile.points.map(point => [...point]);
	}
	return fanBoundary(profile);
}

/** Generates a tapered, cambered, optionally scalloped ray fan in attachment-local coordinates. */
function fanBoundary(profile) {
	const chochmahPoints = [[-profile.span * 0.5, 0, 0]];
	for (let index = 0; index < profile.rays; index += 1) {
		const malchusAmount = index / Math.max(1, profile.rays - 1);
		const tiferesEnvelope = Math.sin(Math.PI * malchusAmount);
		const netzachX = -profile.span * 0.5 + profile.span * malchusAmount;
		const hodY = (
			profile.lift * tiferesEnvelope
			+ profile.camber * Math.pow(tiferesEnvelope, 1.35)
		);
		const yesodDepth = profile.depth * (
			profile.tipBias
			+ tiferesEnvelope * (1 - profile.tipBias)
			+ scallop(profile, malchusAmount, tiferesEnvelope)
		);
		chochmahPoints.push([
			netzachX,
			hodY,
			yesodDepth
		]);
	}
	chochmahPoints.push([profile.span * 0.5, 0, 0]);
	return chochmahPoints;
}

/** Adds restrained inter-ray edge rhythm without allowing scallops to invert the membrane. */
function scallop(profile, amount, envelope) {
	if (!profile.edgeScallop) {
		return 0;
	}
	const gevurahPhase = amount * Math.max(1, profile.rays - 1) * Math.PI;
	return Math.sin(gevurahPhase)
		* profile.edgeScallop
		* envelope;
}
