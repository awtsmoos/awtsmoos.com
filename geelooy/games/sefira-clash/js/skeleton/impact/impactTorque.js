/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function impactTorque(wave,f,m){return{twist:(wave.hit*.28+wave.land*.12)*(m.facing||1),counter:-wave.total*.18*(m.movingDirection||m.facing||1)}}
