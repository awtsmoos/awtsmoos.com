/**
 * B"H
 * Stable hero silhouette converter.
 *
 * Chapter 208: the pose is tall again. The Awtsmoos lifts the torso, lengthens
 * the legs, raises the hands, and lets boots touch the platform without blobs.
 */
import { point } from '../math.js';
import { MOCKUP } from './MockupMeasurements.js';
import { heroScale } from './HeroScale.js';

export function heroSilhouette(f) {
  const s = heroScale(f);
  const face = Math.sign(f.face || 1) || 1;
  const x = f.x;
  const floor = f.y;
  const pelvis = point(x, floor + MOCKUP.pelvis.y * s);
  const chest = point(x + face * 2 * s, floor + MOCKUP.chest.y * s);
  const sw = MOCKUP.shoulderWidth * s;
  const hw = MOCKUP.hipWidth * s;
  return {
    face,
    scale: s,
    pelvis,
    chest,
    neck: point(chest.x + face * 2 * s, chest.y - 14 * s),
    head: point(chest.x + face * 4 * s, floor + MOCKUP.head.y * s),
    leftShoulder: point(chest.x - sw / 2, chest.y + 11 * s),
    rightShoulder: point(chest.x + sw / 2, chest.y + 11 * s),
    leftHip: point(pelvis.x - hw / 2, pelvis.y),
    rightHip: point(pelvis.x + hw / 2, pelvis.y),
    leftElbow: point(chest.x - 55 * s, chest.y + 52 * s),
    rightElbow: point(chest.x + 55 * s, chest.y + 52 * s),
    leftHand: point(chest.x - 48 * s, chest.y + 84 * s),
    rightHand: point(chest.x + 48 * s, chest.y + 84 * s),
    leftKnee: point(pelvis.x - 28 * s, pelvis.y + 54 * s),
    rightKnee: point(pelvis.x + 28 * s, pelvis.y + 54 * s),
    leftFoot: point(pelvis.x - 39 * s, floor + 2 * s),
    rightFoot: point(pelvis.x + 39 * s, floor + 2 * s)
  };
}
