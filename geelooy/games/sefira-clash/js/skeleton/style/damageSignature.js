/**
 * B"H
 * Hyper-real style signature: visual-only personality and rhythm.
 */
import {clamp} from '../poseMath.js';
export function damageSignature(f){const d=f.damage||0;return{sag:clamp((d-55)/170),wobble:clamp((d-90)/140),stumble:clamp((d-130)/120),critical:d>=170?1:0,breathStrain:clamp(d/220)}}
