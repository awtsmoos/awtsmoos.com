/**
 * B"H
 * Final visual pose correction.
 *
 * Chapter 131: after every wind, strike, recoil, and run, the Awtsmoos restores
 * human readability. Head attached, shoulders heroic, hips quiet, feet below.
 */
import { point, add, clamp, toward, dist } from './math.js';
import { LIMB_BOUNDS } from './limbBounds.js';

export function correctCapsulePose(p) {
  p = correctCore(p);
  p = correctArms(p);
  p = correctLegs(p);
  return p;
}

function correctCore(p) {
  const shoulder = clamp(Math.abs(p.rightShoulder.x - p.leftShoulder.x), LIMB_BOUNDS.shoulderWidth.min, LIMB_BOUNDS.shoulderWidth.max);
  const hip = clamp(Math.abs(p.rightHip.x - p.leftHip.x), LIMB_BOUNDS.hipWidth.min, LIMB_BOUNDS.hipWidth.max);
  p.leftShoulder = point(p.chest.x - shoulder / 2, p.chest.y + 8);
  p.rightShoulder = point(p.chest.x + shoulder / 2, p.chest.y + 8);
  p.leftHip = point(p.pelvis.x - hip / 2, p.pelvis.y);
  p.rightHip = point(p.pelvis.x + hip / 2, p.pelvis.y);
  p.neck = point(p.chest.x + p.face * 2, p.chest.y - 16);
  p.head = point(p.neck.x + p.face * 2, p.neck.y - 21);
  return p;
}

function correctArms(p) {
  arm(p, 'left', -1);
  arm(p, 'right', 1);
  return p;
}

function arm(p, side, sign) {
  const shoulder = p[side + 'Shoulder'];
  let hand = p[side + 'Hand'];
  hand = point(clamp(hand.x, shoulder.x - 58, shoulder.x + 58), clamp(hand.y, shoulder.y + 22, shoulder.y + 78));
  const targetElbow = add(shoulder, sign * 19, 34);
  let elbow = p[side + 'Elbow'];
  elbow = dist(elbow, targetElbow) > 34 ? toward(targetElbow, elbow, 34) : elbow;
  elbow.y = clamp(elbow.y, shoulder.y + 16, hand.y + 10);
  const total = dist(shoulder, elbow) + dist(elbow, hand);
  if (total < 50) hand = add(hand, sign * (50 - total + 8), 10);
  p[side + 'Elbow'] = elbow;
  p[side + 'Hand'] = hand;
}

function correctLegs(p) {
  leg(p, 'left', -1);
  leg(p, 'right', 1);
  return p;
}

function leg(p, side, sign) {
  const hip = p[side + 'Hip'];
  let foot = p[side + 'Foot'];
  foot = point(clamp(foot.x, hip.x - 52, hip.x + 52), clamp(foot.y, hip.y + 66, hip.y + 90));
  const targetKnee = add(hip, sign * 11, 43);
  let knee = p[side + 'Knee'];
  knee = dist(knee, targetKnee) > 30 ? toward(targetKnee, knee, 30) : knee;
  knee.y = clamp(knee.y, hip.y + 24, foot.y - 12);
  p[side + 'Knee'] = knee;
  p[side + 'Foot'] = foot;
}
