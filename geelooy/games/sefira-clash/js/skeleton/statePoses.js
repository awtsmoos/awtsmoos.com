//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the state poses vessel in this instant, revealing
 * its focused js skeleton service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { point } from './poseMath.js';

/**
 * B"H
 * Non-attack state poses.
 *
 * Chapter 18: landing, falling, ledge, shield, charge, and stun are not new
 * rules. They are visible vowels in the body. The Awtsmoos renews the instant;
 * the fighter answers by compressing, stretching, coiling, or surviving.
 */
export function applyStatePose(anim, p, facing, s, intent) {
	if (anim.kind === 'squat') crouchPose(p, s, 1.05);
	else if (anim.kind === 'rise') risePose(p, facing, s);
	else if (anim.kind === 'apex') apexPose(p, facing, s);
	else if (anim.kind === 'fall') fallPose(p, facing, s, intent);
	else if (anim.kind === 'fastFall') spearPose(p, facing, s);
	else if (anim.kind === 'landing') crouchPose(p, s, 1.45 + (anim.landingImpact || 0));
	else if (anim.kind === 'hitstun') hitstunPose(p, facing, s, intent);
	else if (anim.kind === 'ledgeHang') ledgePose(p, facing, s);
	else if (anim.kind === 'charge' || anim.kind === 'maxCharge')
		chargePose(p, facing, s, anim.charge);
	if (intent.panic > 0.45) panicPose(p, facing, s, intent.panic);
	return p;
}

function crouchPose(p, s, power) {
	p.chest.y += 18 * s * power;
	p.head.y += 18 * s * power;
	p.leftKnee.y += 18 * s * power;
	p.rightKnee.y += 18 * s * power;
	p.leftFoot.x -= 10 * s * power;
	p.rightFoot.x += 10 * s * power;
	p.leftHand.y += 14 * s * power;
	p.rightHand.y += 14 * s * power;
}
function risePose(p, facing, s) {
	p.leftHand.y -= 28 * s;
	p.rightHand.y -= 32 * s;
	p.leftFoot.x -= facing * 14 * s;
	p.rightFoot.x -= facing * 6 * s;
}
function apexPose(p, facing, s) {
	p.leftHand.x -= facing * 18 * s;
	p.rightHand.x += facing * 18 * s;
	p.leftKnee.y += 8 * s;
	p.rightKnee.y += 8 * s;
}
function fallPose(p, facing, s, intent) {
	p.chest.x += facing * (6 + intent.recover * 14) * s;
	p.leftHand.y += 22 * s;
	p.rightHand.y += 18 * s;
	p.leftFoot.y += 8 * s;
	p.rightFoot.y += 8 * s;
}
function spearPose(p, facing, s) {
	p.chest.x += facing * 18 * s;
	p.head.x += facing * 14 * s;
	p.leftHand.y += 42 * s;
	p.rightHand.y += 42 * s;
	p.leftFoot.y -= 12 * s;
	p.rightFoot.y -= 6 * s;
}
function hitstunPose(p, facing, s, intent) {
	const back = facing * (18 + intent.damageCurl * 22) * s;
	p.chest.x -= back;
	p.head.x -= back * 1.15;
	p.leftHand.x -= back * 1.8;
	p.rightHand.x -= back * 1.4;
}
function ledgePose(p, facing, s) {
	p.chest.y += 44 * s;
	p.head.y += 42 * s;
	p.rightHand.x += facing * 34 * s;
	p.rightHand.y -= 60 * s;
	p.leftFoot.y += 35 * s;
	p.rightFoot.y += 35 * s;
}
function chargePose(p, facing, s, charge) {
	const tremble = Math.sin(charge * 40 + p.chest.x * 0.03) * charge * 7 * s;
	p.chest.x -= facing * (10 + charge * 16) * s;
	p.rightHand.x += facing * (18 + charge * 22) * s - tremble;
	p.leftHand.x += tremble;
}
function panicPose(p, facing, s, panic) {
	p.leftHand = point(p.leftHand.x - facing * 16 * panic * s, p.leftHand.y - 8 * panic * s);
	p.rightHand = point(p.rightHand.x + facing * 12 * panic * s, p.rightHand.y - 6 * panic * s);
}
