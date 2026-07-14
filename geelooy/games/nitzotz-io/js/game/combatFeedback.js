// B"H
// Boruch Hashem
// Blessed is He
import { addBurst, addText } from '../state.js';

/**
 * The Awtsmoos reveals impact through light, motion, sound, and finite particles.
 * No blood or realistic injury is needed for force to become readable.
 */
export function impactFeedback(world, target, label = 'IMPACT') {
	addBurst(world, particleSource(target, 24));
	addText(world, target.x, target.y, target.z + target.r, label);
	world.camera.shake = Math.max(world.camera.shake, 16);
	world.events.push(['impact']);
	world.message = `${label}. Hold the current and recover.`;
}

/** Break one armor segment with stronger bounded feedback. */
export function armorBreakFeedback(world, target) {
	addBurst(world, particleSource(target, 48));
	addText(world, target.x, target.y, target.z + target.r, 'GEVURAH BROKEN');
	world.camera.shake = Math.max(world.camera.shake, 24);
	world.events.push(['armorBreak']);
	world.message = 'Gevurah absorbed the strike. One armor segment broke.';
}

/** Restore one armor segment after a Chesed recovery cycle. */
export function armorRestoreFeedback(world, target) {
	addText(world, target.x, target.y, target.z + target.r, 'ARMOR RESTORED');
	world.events.push(['upgrade']);
	world.message = 'Chesed restored one Gevurah armor segment.';
}

/** Announce a successful pulse strike without producing unbounded effects. */
export function pulseHitFeedback(world, target) {
	addText(world, target.x, target.y, target.z + target.r, 'CHOCHMAH STRIKE');
	world.events.push(['impact']);
}

function particleSource(target, hue) {
	return {
		x: target.x,
		y: target.y,
		z: target.z || 0,
		h: target.r || 8,
		hue
	};
}
