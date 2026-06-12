/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function eyeTracking(f,target){const mag=Math.hypot(target.x||0,target.y||0)||1;return{x:target.x/mag,y:target.y/mag,focus:f.poseIntent?.hunt||f.attack?1:.45}}
