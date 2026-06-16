/** B"H — V3 forearm. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawForearm(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.arm.lower, mat, false); }
