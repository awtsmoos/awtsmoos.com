/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {point,exactAim,perpOf} from '../poseMath.js';
export const aimFor=(f,m)=>exactAim(f.attack?.aim,m.facing);
export function twistTorso(p,aim,s,lean,lift=0){p.chest.x-=aim.x*lean*s;p.chest.y+=lift*s;p.head.x-=aim.x*lean*.55*s;p.head.y+=lift*.55*s}
export {point,perpOf};
