/** B"H — V3 shin. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawShin(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.leg.shin, mat, false); }
