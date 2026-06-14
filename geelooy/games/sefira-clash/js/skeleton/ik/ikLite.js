/**
 * B"H
 * Ordered hyper-real IK vessel.
 *
 * Chapter 103: feet first find the earth, legs then solve toward those honest
 * feet, arms solve as living chains, and the head crowns the body. Order itself
 * becomes mercy against folded crab-poses.
 */
import { armConstraint } from './armConstraint.js';
import { legConstraint } from './legConstraint.js';
import { headConstraint } from './headConstraint.js';
import { footConstraint } from './footConstraint.js';

export function ikLite(pose, f, metrics) {
  pose.groundY = Number.isFinite(f?.y) ? f.y : pose.groundY;
  footConstraint(pose, f, metrics);
  legConstraint(pose, 'left');
  legConstraint(pose, 'right');
  armConstraint(pose, 'left');
  armConstraint(pose, 'right');
  headConstraint(pose);
  return pose;
}
