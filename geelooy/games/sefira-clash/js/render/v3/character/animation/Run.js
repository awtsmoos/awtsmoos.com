/** B"H — run, sprint, brake, and turn silhouettes with living weight. */
import { add } from '../CharacterRig.js';
import { clamp, wave } from './Math.js';
export function run(p, f, info = {}) {
  const face = p.face, speed = clamp(Math.abs(f.vx || 0) / 9), ph = wave(f, 0.18 * (0.55 + speed));
  const sprint = info.name === 'sprint', brake = info.name === 'brake', turn = info.name === 'turnaround';
  const lean = face * (brake ? -9 : turn ? -13 : sprint ? 15 : 8) * (0.45 + speed);
  const bob = Math.abs(ph) * (sprint ? 6 : 4);
  p.pelvis = add(p.pelvis, lean * 0.25, bob * 0.5);
  p.chest = add(p.chest, lean, -bob - (sprint ? 3 : 0));
  p.neck = add(p.neck, lean * 0.8, -bob);
  p.head = add(p.head, lean * 0.9, -bob - Math.abs(ph) * 2);
  swingArm(p, 'left', -ph, face, speed, sprint);
  swingArm(p, 'right', ph, face, speed, sprint);
  strideLeg(p, 'left', ph, face, speed, sprint, brake || turn);
  strideLeg(p, 'right', -ph, face, speed, sprint, brake || turn);
  if (turn) { p.leftHand = add(p.leftHand, -face * 18, -8); p.rightHand = add(p.rightHand, -face * 18, -8); }
  return p;
}
function swingArm(p, s, ph, face, speed, sprint) {
  p[s+'Elbow'] = add(p[s+'Elbow'], -face * ph * (20 + speed * 13), -6 - Math.abs(ph) * 5);
  p[s+'Hand'] = add(p[s+'Hand'], -face * ph * (28 + speed * 18), -8 - Math.abs(ph) * (sprint ? 12 : 7));
}
function strideLeg(p, s, ph, face, speed, sprint, braking) {
  const forward = Math.max(0, ph), back = Math.max(0, -ph), long = 22 + speed * (sprint ? 30 : 20);
  p[s+'Knee'] = add(p[s+'Knee'], face * ph * long * 0.7, -forward * 14 + back * 5);
  p[s+'Foot'] = add(p[s+'Foot'], face * ph * long, -forward * 11 + back * 3 + (braking ? -4 : 0));
}
