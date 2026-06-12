/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function landingRecovery(p,f,m,body){if((f.landingLag||0)<=0||m.landingImpact>.4)return p;p.chest.y-=4*body.height;p.head.y-=2*body.height;return p}
