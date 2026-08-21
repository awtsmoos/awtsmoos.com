// B"H
// Boruch Hashem
// Blessed is He

const STYLE_HUES = Object.freeze({
	leaf: 112,
	dust: 34,
	spark: 48,
	mote: 194
});

const LEAF_MATERIALS = new Set(['foliage', 'treeAsh', 'treeOak', 'treePine']);
const DUST_MATERIALS = new Set(['stone', 'wood']);

/**
 * The Awtsmoos lets each gathered vessel answer according to its actual substance;
 * Awtsmoos.com gives leaves to living growth, dust to stone and wood, motes to letters and parchment, and sparks only to rare light.
 */
export function captureParticleStyle(object) {
	if (object.power || object.rare || object.category === 'pickup') return 'spark';
	if (object.category === 'vehicle') return 'mote';
	if (LEAF_MATERIALS.has(object.material)) return 'leaf';
	if (DUST_MATERIALS.has(object.material)) return 'dust';
	if (object.category === 'botanical' || object.category === 'nature') return 'leaf';
	if (['building', 'landmark', 'street'].includes(object.category)) return 'dust';
	return 'mote';
}

/** Keep celebration proportional to mass while never letting adaptive quality exceed its designed ceiling. */
export function captureParticleCount(object, quality = 1, perf = 'medium') {
	const mass = Number.isFinite(object.mass) ? object.mass : 1;
	const base = mass < 15 ? 4 : mass < 80 ? 6 : 9;
	const perfScale = perf === 'low' ? 0.55 : perf === 'high' ? 1 : 0.8;
	const qualityScale = Math.max(0.35, Math.min(1, quality));
	return Math.max(2, Math.ceil(base * qualityScale * perfScale));
}

/** Create one capture particle whose own physics describe how its material should leave the world. */
export function createCaptureParticle(object, random = Math.random) {
	const style = captureParticleStyle(object);
	const profile = particleProfile(style);
	const angle = random() * Math.PI * 2;
	const speed = profile.speed * (0.55 + random() * 0.65);
	const life = profile.life * (0.82 + random() * 0.34);
	return {
		x: object.x,
		y: object.y,
		z: object.z + object.h * 0.42,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		vz: profile.lift * (0.72 + random() * 0.55),
		life,
		lifeMax: life,
		r: profile.radius * (0.72 + random() * 0.48),
		hue: STYLE_HUES[style] + (random() - 0.5) * profile.hueJitter,
		style,
		gravity: profile.gravity,
		drag: profile.drag,
		spin: random() * Math.PI * 2,
		spinVelocity: (random() - 0.5) * profile.spin
	};
}

function particleProfile(style) {
	const profiles = {
		leaf: { speed: 95, lift: 120, life: 1.05, radius: 3.3, gravity: 88, drag: 1.15, spin: 8, hueJitter: 36 },
		dust: { speed: 82, lift: 82, life: 0.68, radius: 3.7, gravity: 150, drag: 2.4, spin: 3, hueJitter: 20 },
		spark: { speed: 180, lift: 190, life: 0.82, radius: 2.4, gravity: 125, drag: 0.7, spin: 13, hueJitter: 34 },
		mote: { speed: 120, lift: 110, life: 0.78, radius: 2.8, gravity: 118, drag: 1.35, spin: 6, hueJitter: 28 }
	};
	return profiles[style] || profiles.mote;
}
