// B"H
/**
 * @file PhysicsNumbers.js
 * @purpose Central numeric helpers for player physics modules.
 * @owner Live Chossid movement and grounding runtime.
 * @inputs Raw numeric values, angles, and THREE math utilities.
 * @outputs Stable finite numbers, normalized angles, and slope constants.
 * @runtimeAuthority Pure math only; no player, mesh, or world mutation.
 * @updateOrder Import before ground, motion, visual, and frame modules.
 * @callers Physics split modules and physics/index.js.
 * @invariants Non-finite values never leak into capsule math.
 * @failureModes Bad numbers resolve to caller-provided fallbacks.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
export const MOVING_EPSILON_SQ = 0.0001;
export const finite = value => Number.isFinite(Number(value));
export const numeric = (value, fallback = 0) => finite(value) ? Number(value) : fallback;
export const normAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
export const steepSlopeY = () => Math.cos(THREE.MathUtils.degToRad(50));
