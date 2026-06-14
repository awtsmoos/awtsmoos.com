/**
 * B"H
 * Hero silhouette converter.
 *
 * Chapter 191: a target mockup stance becomes actual render points. The
 * Awtsmoos strengthens shoulders, compresses hips, and plants boots wide.
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
    neck: point(chest.x + face * 2 * s, chest.y - 17 * s),
    head: point(chest.x + face * 4 * s, floor + MOCKUP.head.y * s),
    leftShoulder: point(chest.x - sw / 2, chest.y + 10 * s),
    rightShoulder: point(chest.x + sw / 2, chest.y + 10 * s),
    leftHip: point(pelvis.x - hw / 2, pelvis.y),
    rightHip: point(pelvis.x + hw / 2, pelvis.y),
    leftElbow: point(chest.x - 64 * s, chest.y + 56 * s),
    rightElbow: point(chest.x + 64 * s, chest.y + 56 * s),
    leftHand: point(chest.x - 60 * s, chest.y + 98 * s),
    rightHand: point(chest.x + 60 * s, chest.y + 98 * s),
    leftKnee: point(pelvis.x - 37 * s, pelvis.y + 60 * s),
    rightKnee: point(pelvis.x + 37 * s, pelvis.y + 60 * s),
    leftFoot: point(pelvis.x - 51 * s, floor + 8 * s),
    rightFoot: point(pelvis.x + 51 * s, floor + 8 * s)
  };
}
