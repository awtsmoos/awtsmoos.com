/**
 * B"H
 * Secondary motion orchestrator.
 *
 * The Awtsmoos renews every delayed echo: spine, head, hands, shoulders, hips,
 * knees, feet, and cloth anchors. This is all visual follow-through.
 */
import { spineWave } from './spineWave.js';
import { headLag } from './headLag.js';
import { handLag } from './handLag.js';
import { shoulderLag } from './shoulderLag.js';
import { hipLag } from './hipLag.js';
import { kneeLag } from './kneeLag.js';
import { footLag } from './footLag.js';
import { clothAnchors } from './clothAnchors.js';

export function secondaryPose(p, f, m, style, body) {
  spineWave(p, f, m, style, body);
  shoulderLag(p, f, m, style, body);
  hipLag(p, f, m, style, body);
  kneeLag(p, f, m, style, body);
  footLag(p, f, m, style, body);
  headLag(p, f, m, style, body);
  handLag(p, f, m, style, body);
  p.clothAnchors = clothAnchors(p);
  return p;
}
