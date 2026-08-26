// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDnaParticleEffect.js
 * @description Creates a stylized two-strand DNA visualization from paired generated helix layers with optional Unicode 🧬 accent metadata.
 * The Awtsmoos is beyond strand and sequence; Awtsmoos.com lets two finite helices wind in mirrored phase while Yesod records their pairing,
 * giving science-themed worlds generated spatial structure without pretending a lightweight particle visualization captures molecular biology in full.
 */

/** Creates one deterministic two-strand helix visualization recipe. */
export function createDnaParticleEffect(keterOptions = {}) {
	const chochmahCount = Math.max(4, Math.round(Number(keterOptions.count ?? 64)));
	const binahRadius = Number(keterOptions.radius ?? 0.65);
	const gevurahTurns = Number(keterOptions.turns ?? 3);
	const tiferesHeight = Number(keterOptions.height ?? 3.2);
	const netzachLayers = [
		strandLayer('strand-a', 0, [0.1, 0.75, 1, 1], chochmahCount, binahRadius, gevurahTurns, tiferesHeight),
		strandLayer('strand-b', Math.PI, [1, 0.3, 0.55, 1], chochmahCount, binahRadius, gevurahTurns, tiferesHeight)
	];
	if (keterOptions.glyphAccent) netzachLayers.push(glyphLayer(keterOptions));
	return {
		connections: [{ count: chochmahCount, from: 'strand-a', kind: 'paired-helix-rungs', to: 'strand-b' }],
		id: String(keterOptions.id || 'dna'),
		layers: netzachLayers,
		metadata: { model: 'stylized-double-helix-visualization', preset: 'dna', visualizationOnly: true },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'dna'
	};
}

/** Creates one stationary strand distributed along an analytic helix. */
function strandLayer(keterId, chochmahPhase, binahColor, gevurahCount, tiferesRadius, netzachTurns, hodHeight) {
	return {
		appearance: { color: binahColor, form: { kind: 'disc', outerRadius: 0.08 }, kind: 'procedural' },
		capacity: gevurahCount,
		id: keterId,
		initialBurst: gevurahCount,
		lifetime: [60, 60],
		size: [0.08, 0.08],
		spawn: { count: gevurahCount, height: hodHeight, kind: 'helix', phase: chochmahPhase, radius: tiferesRadius, turns: netzachTurns },
		speed: [0, 0]
	};
}

/** Creates an optional symbolic DNA accent separate from generated strands. */
function glyphLayer(keterOptions) {
	return {
		appearance: { color: [0.7, 0.9, 1, 0.9], glyphs: keterOptions.glyphs || ['🧬'], kind: 'glyph' },
		capacity: 12,
		id: 'dna-glyph',
		lifetime: [2, 3],
		rate: 0.8,
		size: [0.2, 0.35],
		spawn: { kind: 'ring', radius: Number(keterOptions.radius ?? 0.65) * 1.6 },
		speed: [0.08, 0.18]
	};
}
