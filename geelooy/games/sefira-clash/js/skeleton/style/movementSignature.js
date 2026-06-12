/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function movementSignature(f){const r=f.aiMind?.role?.name||'',seed=((f.dna?.hue||0)%60)/60;return{sharpness:clamp((r==='Hunter'?.7:.35)+seed*.25),looseness:clamp((f.damage||0)/260+(r==='Survivor'?.2:0)),bounce:clamp(.2+seed*.35+(f.human?.12:0)),swagger:clamp((f.combo?.count||0)/7),caution:clamp((f.damage||0)/180),aggression:r==='Hunter'||f.aiMind?.koIntent?.active?1:0,elegance:clamp(.45+seed*.4)}}
