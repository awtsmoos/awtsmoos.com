/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function blinkController(f){const rate=f.visualStyle?.rhythm?.blinkRate||120,t=(f.motionClock||0)%rate;return{closed:t<4||f.stun>0,amount:t<4?1:0}}
