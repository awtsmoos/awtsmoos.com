/** B"H — V3 thigh. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawThigh(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.leg.thigh, mat, true); }
