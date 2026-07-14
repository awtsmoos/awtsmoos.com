// B"H
// Boruch Hashem
// Blessed is He
import { archetypeFor } from '../game/rivalStrategies.js';
import { radiusForMass } from '../game/scoring.js';
import { heightAt, hsl, TAU } from '../math.js';

const NAMES = ['Ari', 'Shneur', 'Levi', 'Dov', 'Mendel', 'Yosef', 'Meir', 'Elazar', 'Akiva'];

/**
 * Rival identity combines a visible name, deterministic strategy, and bounded
 * armor that becomes more common only in later campaign chapters.
 */
export function createRivals(level) {
	return Array.from({ length: level.rivals }, (_, index) => createRival(level, index));
}

function createRival(level, index) {
	const angle = index / level.rivals * TAU + 0.4;
	const mass = 22 + index * 3 + level.index * 2;
	const x = Math.cos(angle) * level.bounds * 0.58;
	const y = Math.sin(angle) * level.bounds * 0.58;
	const maxArmor = Math.min(2, Math.floor(level.index / 80));
	return {
		id: `rival-${index}`,
		index,
		name: NAMES[index % NAMES.length],
		archetype: archetypeFor(level, index),
		x,
		y,
		z: heightAt(x, y, level.index),
		vx: 0,
		vy: 0,
		mass,
		r: radiusForMass(mass),
		score: 0,
		color: hsl(level.hue + 70 + index * 39, 82, 59),
		targetId: null,
		think: index * 0.08,
		respawn: 0,
		grace: 1.5,
		armor: maxArmor,
		maxArmor,
		hitCooldown: 0,
		stun: 0,
		lastPulseSerial: -1
	};
}
