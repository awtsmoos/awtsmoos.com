/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function eyeTarget(f){const aim=f.attack?.aim||{x:f.face||1,y:0};return{x:(f.face||1)*(f.poseIntent?.hunt?.5:0)+aim.x,y:aim.y-(f.poseIntent?.panic||0)*.2}}
