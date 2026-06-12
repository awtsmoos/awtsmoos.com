/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function bodyArchetype(f){const d=f.dna||{},h=clamp(d.height||1,.85,1.22),arm=clamp(d.arm||1,.85,1.18),leg=clamp(d.leg||1,.85,1.18),wide=(d.hue||0)%120<40?1.08:.96;return{kind:h>1.12?'tall':h<.94?'compact':wide>1?'broad':'balanced',height:h,shoulderWidth:31*h*wide*(.94+arm*.08),hipWidth:18*h*(2-wide*.65),torsoLength:72*h,headSize:18*h,handSize:7*arm,footSize:11*leg,limbThickness:7*(.92+h*.08),stanceWidth:1+(leg-1)*.35}}
