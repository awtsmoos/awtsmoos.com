/**
 * B"H
 * Converter-backed hero pose gate.
 *
 * Chapter 205: the mockup measurements are now the first truth. Each animation
 * keyframe bends that sculpted silhouette instead of rebuilding a stick body.
 */
import { heroSilhouette } from './converter/HeroSilhouette.js';
import { applyPoseTimeline } from './poses/PoseTimeline.js';

export function heroPose(f) {
  return applyPoseTimeline(heroSilhouette(f), f);
}
