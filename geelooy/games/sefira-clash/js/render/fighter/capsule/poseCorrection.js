/**
 * B"H
 * Mockup final pose correction.
 *
 * Chapter 143: even after gameplay chaos, the visible warrior returns to the
 * image: helmet attached, broad shoulders, narrow waist, planted boots.
 */
import { point, add, clamp, toward, dist } from './math.js';
import { LIMB_BOUNDS } from './limbBounds.js';

export function correctCapsulePose(p) {
  correctCore(p);
  correctArms(p);
  correctLegs(p);
  return p;
}

function correctCore(p) {
  const shoulder = clamp(Math.abs(p.rightShoulder.x - p.leftShoulder.x), 64, 72);
  const hip = clamp(Math.abs(p.rightHip.x - p.leftHip.x), 28, 34);
  p.leftShoulder = point(p.chest.x - shoulder / 2, p.chest.y + 10);
  p.rightShoulder = point(p.chest.x + shoulder / 2, p.chest.y + 10);
  p.leftHip = point(p.pelvis.x - hip / 2, p.pelvis.y);
  p.rightHip = point(p.pelvis.x + hip / 2, p.pelvis.y);
  p.neck = point(p.chest.x + p.face * 2, p.chest.y - 15);
  p.head = point(p.neck.x + p.face * 2, p.neck.y - 21);
}

function correctArms(p) {
  arm(p, 'left', -1);
  arm(p, 'right', 1);
}

function arm(p, side, sign) {
  const shoulder = p[side + 'Shoulder'];
  let hand = p[side + 'Hand'];
  const minX = sign < 0 ? shoulder.x - 72 : shoulder.x - 36;
  const maxX = sign < 0 ? shoulder.x + 36 : shoulder.x + 72;
  hand = point(clamp(hand.x, minX, maxX), clamp(hand.y, shoulder.y + LIMB_BOUNDS.arm.handDropMin, shoulder.y + LIMB_BOUNDS.arm.handDropMax));
  const targetElbow = add(shoulder, sign * 24, 43);
  let elbow = p[side + 'Elbow'];
  const minElbowX = sign < 0 ? shoulder.x - 52 : shoulder.x - 12;
  const maxElbowX = sign < 0 ? shoulder.x + 12 : shoulder.x + 52;
  elbow = dist(elbow, targetElbow) > 34 ? toward(targetElbow, elbow, 34) : elbow;
  elbow = point(clamp(elbow.x, minElbowX, maxElbowX), clamp(elbow.y, shoulder.y + 28, hand.y + 6));
  p[side + 'Elbow'] = elbow;
  p[side + 'Hand'] = hand;
}

function correctLegs(p) {
  leg(p, 'left', -1);
  leg(p, 'right', 1);
}

function leg(p, side, sign) {
  const hip = p[side + 'Hip'];
  let foot = p[side + 'Foot'];
  foot = point(clamp(foot.x, hip.x - 62, hip.x + 62), clamp(foot.y, hip.y + LIMB_BOUNDS.leg.footDropMin, hip.y + LIMB_BOUNDS.leg.footDropMax));
  const targetKnee = add(hip, sign * 18, 52);
  let knee = p[side + 'Knee'];
  knee = dist(knee, targetKnee) > 36 ? toward(targetKnee, knee, 36) : knee;
  knee.y = clamp(knee.y, hip.y + 36, foot.y - 18);
  p[side + 'Knee'] = knee;
  p[side + 'Foot'] = foot;
}
