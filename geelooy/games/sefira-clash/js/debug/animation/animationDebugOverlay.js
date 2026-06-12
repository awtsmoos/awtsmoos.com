/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
import {drawCenterOfMass} from './drawCenterOfMass.js';import {drawFootPlants} from './drawFootPlants.js';import {drawMotionVectors} from './drawMotionVectors.js';import {drawPoseInfluences} from './drawPoseInfluences.js';import {drawClothAnchors} from './drawClothAnchors.js';import {drawAnimationLabels} from './drawAnimationLabels.js';
export function drawAnimationDebugOverlay(ctx,f){drawCenterOfMass(ctx,f);drawFootPlants(ctx,f);drawMotionVectors(ctx,f);drawPoseInfluences(ctx,f);drawClothAnchors(ctx,f);drawAnimationLabels(ctx,f)}
