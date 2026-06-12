/**
 * B"H
 * Hyper-real style signature: visual-only personality and rhythm.
 */
import {clamp} from '../poseMath.js';
export function rhythmSignature(f){const seed=((f.dna?.hue||0)*.017+(f.id?.length||0)*.11)%1;return{breathRate:.065+seed*.035,strideRate:.9+seed*.22,idleOffset:seed*Math.PI*2,blinkRate:90+Math.round(seed*70),recoveryDrag:clamp((f.damage||0)/220+.15),snap:clamp(.45+seed*.35)}}
