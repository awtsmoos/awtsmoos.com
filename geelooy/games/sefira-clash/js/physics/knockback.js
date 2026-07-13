//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the knockback vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { COMBAT_TUNING } from '../data/combatTuning.js';

/**
 * B"H
 * Launch law with directional influence, rapid escape, and major-hit stun.
 *
 * Chapter 99: a rapid punch is no longer a cage. It shoves the target away,
 * gives hands back to the trapped player, and lets charged thunder pop bodies
 * out even before their damage is high.
 */
export function applyKnockback(target, source, attack, weapon) {
	const vector = predictLaunch(target, source, attack, weapon);
	target.vx = vector.x * vector.force;
	target.vy = vector.y * vector.force;
	target.stun = stunFor(vector.force, target.damage, attack, source);
	target.launchVector = vector;
	if (attack.rapid) markRapidMobility(target, vector, source);
	applyMoveSpecificRules(target, vector.force, attack, vector);
	return vector;
}

/**
 * Reveals the predict launch behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} target The target value entering this behavior.
 * @param {*} source The source value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function predictLaunch(target, source, attack = {}, weapon = null) {
	const percent = Math.max(0, target.damage || 0);
	const baseKnock = (attack.knock || 8) + (weapon?.knock || 0);
	let force = (baseKnock * launchScale(percent, attack)) / Math.max(0.6, target.stats?.mass || 1);
	if (attack.rapid) force *= COMBAT_TUNING.rapid.pushMultiplier;
	if (attack.fullCharge) force = Math.max(force, COMBAT_TUNING.launch.chargedLowPercentMinForce);
	const aim = normalizedAim(attack.aim, source, target);
	const influenced = applyDirectionalInfluence(aim, target.lastInput, attack);
	return {
		x: influenced.x,
		y: influenced.y,
		force,
		percent,
		killDanger: percent >= COMBAT_TUNING.launch.killDangerPercent
	};
}

/**
 * Reveals the launch scale behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} percent The percent value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function launchScale(percent, attack = {}) {
	const lowResist = percent < 35 ? 0.24 + percent * 0.012 : 0.66;
	const midGrowth = Math.max(0, percent - 35) * 0.017;
	const highGrowth = Math.max(0, percent - 95) ** 1.22 * 0.0065;
	const fullChargeBonus = attack.fullCharge ? Math.min(1.15, percent * 0.0065 + 0.18) : 0;
	return Math.max(0.18, lowResist + midGrowth + highGrowth + fullChargeBonus);
}

function normalizedAim(aim, source, target) {
	const fallbackX = Math.sign(source?.face || target.x - source.x || 1) || 1;
	const x = Number.isFinite(aim?.x) ? aim.x : fallbackX;
	const y = Number.isFinite(aim?.y) ? aim.y : -0.2;
	const mag = Math.hypot(x, y) || 1;
	return { x: x / mag, y: y / mag };
}

function applyDirectionalInfluence(aim, input = {}, attack = {}) {
	const strength = attack.rapid
		? COMBAT_TUNING.launch.rapidDiStrength
		: COMBAT_TUNING.launch.diStrength;
	const ix = Number(input.x || 0);
	const iy = Number(input.y || input.aimY || 0);
	const mag = Math.hypot(ix, iy);
	if (mag < 0.2) return aim;
	const mixed = { x: aim.x + (ix / mag) * strength, y: aim.y + (iy / mag) * strength };
	const outMag = Math.hypot(mixed.x, mixed.y) || 1;
	return { x: mixed.x / outMag, y: mixed.y / outMag };
}

function stunFor(force, percent, attack, source) {
	const rage = source?.buffs?.rageScroll ? 1.18 : 1;
	const raw = (8 + force * 1.6 + percent * 0.05) * rage;
	if (attack.rapid)
		return Math.min(COMBAT_TUNING.rapid.stunCap, raw * COMBAT_TUNING.rapid.stunScale);
	const major = force >= COMBAT_TUNING.launch.majorStunForce || attack.fullCharge;
	return Math.min(96, raw + (major ? COMBAT_TUNING.launch.majorStunBonus : 0));
}

function markRapidMobility(target, vector, source) {
	target.rapidMobilityFrames = Math.max(
		target.rapidMobilityFrames || 0,
		COMBAT_TUNING.rapid.mobilityFrames
	);
	const away = Math.sign((target.x || 0) - (source?.x || 0)) || Math.sign(vector.x) || 1;
	target.vx += away * COMBAT_TUNING.rapid.escapeNudge;
	target.vy += Math.min(-0.4, vector.y * 0.25);
}

function applyMoveSpecificRules(target, force, attack, aim) {
	if (attack.id === 'sweep') target.vy = Math.max(target.vy, -1.5);
	if (attack.id === 'meteorKick') target.vy = Math.max(target.vy, Math.abs(force) * 0.92);
	if (aim.y > 0.42 && attack.id !== 'sweep')
		target.vy = Math.max(target.vy, Math.abs(force) * Math.max(0.48, aim.y));
	if (aim.y < -0.42)
		target.vy = Math.min(target.vy, -Math.abs(force) * Math.max(0.62, Math.abs(aim.y)));
	if (target.damage < 40 && attack.fullCharge) {
		target.vx *= COMBAT_TUNING.launch.lowPercentBrake;
		target.vy *= COMBAT_TUNING.launch.lowPercentBrake;
		target.vx += Math.sign(target.vx || aim.x || 1) * 1.2;
	}
}
