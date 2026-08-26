// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAtomParticleEffect.js
 * @description Creates a stylized atomic visualization with a generated nucleus, orbit-constrained electrons, and optional ⚛️ Unicode accent.
 * The Awtsmoos is beyond nucleus and orbit; Awtsmoos.com lets finite points circle a measured center only as an educational visual garment,
 * while explicit metadata prevents artistic trajectories from masquerading as literal quantum-mechanical electron paths or full physical simulation.
 */

/** Creates one renderer-neutral stylized atom recipe. */
export function createAtomParticleEffect(keterOptions = {}) {
	const chochmahElectrons = Math.max(1, Math.round(Number(keterOptions.electrons ?? 3)));
	const binahRadius = Math.max(1e-6, Number(keterOptions.radius ?? 0.85));
	const gevurahLayers = [nucleusLayer(keterOptions)];
	for (let tiferesIndex = 0; tiferesIndex < chochmahElectrons; tiferesIndex += 1) {
		gevurahLayers.push(electronLayer(tiferesIndex, chochmahElectrons, binahRadius, keterOptions));
	}
	if (keterOptions.glyphAccent) gevurahLayers.push(glyphLayer(keterOptions));
	return {
		id: String(keterOptions.id || 'atom'),
		layers: gevurahLayers,
		metadata: { model: 'stylized-atomic-visualization', preset: 'atom', visualizationOnly: true },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'atom'
	};
}

/** Creates a compact stationary generated nucleus cloud. */
function nucleusLayer(keterOptions) {
	return {
		appearance: { color: keterOptions.nucleusColor || [1, 0.25, 0.18, 1], form: { kind: 'disc', outerRadius: 0.11 }, kind: 'procedural' },
		capacity: 24,
		id: 'nucleus',
		initialBurst: keterOptions.nucleons ?? 12,
		lifetime: [120, 120],
		size: [0.08, 0.13],
		spawn: { kind: 'sphere', radius: 0.18 },
		speed: [0, 0]
	};
}

/** Creates one electron constrained by tangential orbit force plus radial spring correction. */
function electronLayer(keterIndex, chochmahCount, binahRadius, gevurahOptions) {
	const tiferesAngle = keterIndex / chochmahCount * Math.PI * 2;
	const netzachAxis = [Math.sin(tiferesAngle) * 0.7, Math.cos(tiferesAngle * 0.5), Math.cos(tiferesAngle) * 0.7];
	return {
		appearance: { color: gevurahOptions.electronColor || [0.2, 0.75, 1, 1], form: { kind: 'disc', outerRadius: 0.07 }, kind: 'procedural' },
		capacity: 1,
		forces: [{ axis: netzachAxis, radius: binahRadius, springStrength: 8, strength: 3.5, type: 'orbit' }],
		id: `electron-${keterIndex}`,
		initialBurst: 1,
		lifetime: [120, 120],
		position: [binahRadius, 0, 0],
		size: [0.055, 0.055],
		spawn: { kind: 'point' },
		speed: [0, 0]
	};
}

/** Creates an optional symbolic atom accent. */
function glyphLayer(keterOptions) {
	return {
		appearance: { color: [0.7, 0.9, 1, 0.85], glyphs: keterOptions.glyphs || ['⚛️'], kind: 'glyph' },
		capacity: 6,
		id: 'atom-glyph',
		lifetime: [2, 3],
		rate: 0.3,
		size: [0.22, 0.35],
		spawn: { kind: 'ring', radius: Number(keterOptions.radius ?? 0.85) * 1.6 },
		speed: [0.05, 0.12]
	};
}
