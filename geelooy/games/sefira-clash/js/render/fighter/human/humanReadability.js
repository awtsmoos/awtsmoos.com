/**
 * B"H
 * Hyper-real helper vessel: visual-only mapped completion.
 */
import {drawHumanHighlight} from './humanHighlight.js';import {drawHumanAimCue} from './humanAimCue.js';import {drawHumanDangerPulse} from './humanDangerPulse.js';
export function drawHumanReadability(ctx,f,color){drawHumanHighlight(ctx,f,color);drawHumanDangerPulse(ctx,f);drawHumanAimCue(ctx,f,color)}
