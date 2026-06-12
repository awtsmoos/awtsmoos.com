/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function footPlantPose(p,f,m,style,body){if(!m.grounded)return p;const s=body.height,left=m.footPhase<.5,foot=left?p.leftFoot:p.rightFoot;foot.y=f.y+2;foot.x+=(left?-1:1)*Math.min(6,m.horizontalSpeed)*s;return p}
