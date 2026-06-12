/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function bodyLean(balance,momentum,metrics){return{torso:Math.max(-.45,Math.min(.45,balance.normalized*.18+momentum.pushX*.015)),head:Math.max(-.35,Math.min(.35,balance.normalized*.14+momentum.pushX*.01)),hips:Math.max(-.3,Math.min(.3,-balance.normalized*.1+momentum.pushX*.008)),fallDirection:balance.normalized<0?-1:1}}
