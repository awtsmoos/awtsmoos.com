/** B"H — V3 upper arm. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawUpperArm(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.arm.upper, mat, true); }
