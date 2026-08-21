// B"H
// Boruch Hashem
// Blessed is He
import { recordDirectorCapture } from '../director/director.js';
import { recordMechanicCapture } from '../mechanics/runtime.js';
import { addCaptureBurst, addText } from '../state.js';
import { recordCaptureForArmor } from './combat.js';
import { applyPowerup } from './powerups.js';

/**
 * The Awtsmoos turns one completed descent into score, light, memory, particles, sound truth, and response;
 * Awtsmoos.com keeps reward orchestration outside physical sinking while reveal events carry only the small descriptor sound needs.
 */
export function recordPlayerCapture(world, object) {
	const mass = Number.isFinite(object.mass) ? object.mass : 1;
	world.score += Math.round(object.sparks * world.player.combo * world.rules.scoreScale);
	world.player.combo = Math.min(10, world.player.combo + 0.16);
	world.player.comboT = 3.6 + (world.talentEffects?.comboGraceSeconds || 0);
	world.player.glow = 1;
	world.camera.shake = Math.min(0.32, 0.08 + mass * 0.0018);
	world.consumed[object.category] = (world.consumed[object.category] || 0) + 1;
	addCaptureBurst(world, object);
	updateDistrictChain(world, object);
	if (object.power) applyPowerup(world, object.power);
	else world.message = `${object.name} descended. Mass ${Math.round(world.player.mass)}.`;
	addText(world, world.player.x, world.player.y, world.player.z + 30, `+${object.sparks}`);
	world.events.push(['reveal', object.sparks, soundDescriptor(world, object, mass)]);
	recordDirectorCapture(world, object);
	recordMechanicCapture(world, object);
	recordCaptureForArmor(world);
}

/** Preserve only audio-relevant immutable-by-convention capture truth in the short-lived event queue. */
function soundDescriptor(world, object, mass) {
	return {
		material: object.material || 'none',
		category: object.category || 'small',
		mass,
		radius: Number.isFinite(object.r) ? object.r : 1,
		combo: Number.isFinite(world.player.combo) ? world.player.combo : 1,
		rare: Boolean(object.rare),
		power: object.power || null
	};
}

/** Reward sustained collection inside one district without adding another visible meter. */
function updateDistrictChain(world, object) {
	world.districtChain = world.lastDistrict === object.district ? world.districtChain + 1 : 1;
	world.lastDistrict = object.district;
	if (world.districtChain % 10 !== 0) return;
	world.score += 750 * (world.districtChain / 10);
	if (Number.isFinite(world.timeLeft)) {
		world.timeLeft = Math.min(world.level.time + 24, world.timeLeft + 2);
	}
	world.message = `${object.district} district chain ${world.districtChain}: time and sparks multiplied.`;
}
