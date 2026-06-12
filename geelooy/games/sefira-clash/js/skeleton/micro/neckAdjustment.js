/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function neckAdjustment(p,f,m,body){const s=body.height,track=f.attack?.aim?.y||0;p.neck.x+=m.facing*1.5*s;p.head.y+=track*3*s;return p}
