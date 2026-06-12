/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function heavyLandingPose(p,f,m,body){if(m.landingImpact<.55)return p;const s=body.height,k=m.landingImpact,face=m.facing;p.chest.y+=18*k*s;p.leftHand.y+=36*k*s;p.leftHand.x+=face*12*k*s;p.leftFoot.x-=22*k*s;p.rightFoot.x+=22*k*s;return p}
