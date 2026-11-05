// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureAnimation.js
 * @description Poses one skinned demon for idle, chase, melee, ranged, recoil, and death actions.
 * The Awtsmoos renews one body through shoulders, elbows, hips, knees, spine, head, and tail;
 * Awtsmoos.com preserves world placement while each named bone receives its own action pose.
 */

export function animateMinimalShadowCreature(actor, deltaSeconds) {
	actor.visualClock += deltaSeconds;
	actor.hitTime = Math.max(0, actor.hitTime - deltaSeconds);
	const rig = actor.group.userData.rig;
	if (!rig) return;
	resetAnimatedBones(rig);
	const action = actor.action || (actor.moving ? 'walk' : 'idle');
	const phase = actor.visualClock * (action === 'chase' ? 8.4 : 5.8);
	if (action === 'walk' || action === 'chase') poseTravel(rig, phase, action === 'chase' ? 0.82 : 0.56);
	if (action === 'melee-windup') poseMelee(rig, -0.85, 0.32);
	if (action === 'melee-strike') poseMelee(rig, 1.18, 1.05);
	if (action === 'ranged-cast') poseRanged(rig, actor.actionProgress || 0);
	if (action === 'hit' || actor.hitTime > 0) poseHit(rig, actor.hitTime);
	if (action === 'death' || !actor.alive) poseDeath(rig, actor.deathTime);
	if (action === 'idle') poseIdle(rig, actor.visualClock);
}

function resetAnimatedBones(rig) {
	for (const [name, bone] of Object.entries(rig)) {
		if (name === 'root' || name === 'mesh') continue;
		bone?.resetToBase?.();
	}
}

function poseTravel(rig, phase, amount) {
	const swing = Math.sin(phase) * amount;
	rotateX(rig.leftShoulder, swing);
	rotateX(rig.rightShoulder, -swing);
	rotateX(rig.leftHip, -swing * 0.82);
	rotateX(rig.rightHip, swing * 0.82);
	rotateX(rig.leftElbow, Math.max(0.08, -swing * 0.62));
	rotateX(rig.rightElbow, Math.max(0.08, swing * 0.62));
	rotateX(rig.leftKnee, Math.max(0, swing) * 0.72);
	rotateX(rig.rightKnee, Math.max(0, -swing) * 0.72);
	rotateY(rig.spine, Math.sin(phase) * 0.08);
}

function poseMelee(rig, shoulder, elbow) {
	rotateX(rig.leftShoulder, shoulder);
	rotateX(rig.rightShoulder, shoulder * 0.74);
	rotateX(rig.leftElbow, elbow);
	rotateX(rig.rightElbow, elbow * 0.86);
	rotateY(rig.chest, shoulder * -0.28);
}

function poseRanged(rig, progress) {
	const lift = Math.sin(Math.min(1, progress) * Math.PI) * 1.2;
	rotateZ(rig.leftShoulder, -0.65);
	rotateZ(rig.rightShoulder, 0.65);
	rotateX(rig.leftShoulder, -lift);
	rotateX(rig.rightShoulder, -lift);
	rotateX(rig.leftElbow, 0.9);
	rotateX(rig.rightElbow, 0.9);
}

function poseHit(rig, time) {
	const recoil = Math.sin(time * 30) * 0.28;
	rotateZ(rig.spine, recoil);
	rotateY(rig.head, recoil * 1.4);
}

function poseDeath(rig, time) {
	const progress = Math.min(1, time / 1.2);
	rotateZ(rig.pelvis, -progress * 1.42);
	rotateX(rig.spine, progress * 0.5);
}

function poseIdle(rig, time) {
	rotateY(rig.head, Math.sin(time * 1.2) * 0.18);
	rotateZ(rig.tail, Math.sin(time * 2.2) * 0.25);
	rotateX(rig.chest, Math.sin(time * 2) * 0.025);
}

function rotateX(object, angle) {
	setRotation(object, angle, 0, 0);
}

function rotateY(object, angle) {
	setRotation(object, 0, angle, 0);
}

function rotateZ(object, angle) {
	setRotation(object, 0, 0, angle);
}

function setRotation(object, x, y, z) {
	if (!object) return;
	const sx = Math.sin(x / 2), cx = Math.cos(x / 2);
	const sy = Math.sin(y / 2), cy = Math.cos(y / 2);
	const sz = Math.sin(z / 2), cz = Math.cos(z / 2);
	object.quaternion.set(sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz, cx * cy * cz + sx * sy * sz);
}
