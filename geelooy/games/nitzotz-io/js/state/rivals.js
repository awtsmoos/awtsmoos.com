// B"H
import { archetypeFor } from '../game/rivalStrategies.js';
import { radiusForMass } from '../game/scoring.js';
import { heightAt, hsl, TAU } from '../math.js';

const NAMES = ['Ari', 'Shneur', 'Levi', 'Dov', 'Mendel', 'Yosef', 'Meir', 'Elazar', 'Akiva'];

/** Rival identity combines a visible name with a deterministic strategic archetype. */
export function createRivals(level) {
	return Array.from({ length: level.rivals }, (_, index) => {
		const angle = index / level.rivals * TAU + 0.4;
		const mass = 22 + index * 3 + level.index * 2;
		const x = Math.cos(angle) * level.bounds * 0.58;
		const y = Math.sin(angle) * level.bounds * 0.58;
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
			grace: 1.5
		};
	});
}
