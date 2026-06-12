/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function desperationPose(p,f,body,damage){const k=damage.critical||0;if(!k)return p;const s=body.height;p.chest.y+=8*s;p.head.y+=6*s;p.leftHand.y-=5*s;p.rightHand.y-=5*s;p.leftFoot.x-=8*s;p.rightFoot.x+=8*s;return p}
