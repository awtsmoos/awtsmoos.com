/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {point} from '../poseMath.js';
export function baseLimbs(f,a,m,body){const s=body.height,w=Math.sin((m.footPhase||0)*Math.PI*2)*Math.min(1.2,m.horizontalSpeed/10)*m.movingDirection;return{...a,leftElbow:point(a.leftShoulder.x-18*s-w*18*s,a.leftShoulder.y+38*s),leftHand:point(a.leftShoulder.x-26*s-w*32*s,a.leftShoulder.y+76*s),rightElbow:point(a.rightShoulder.x+18*s+w*18*s,a.rightShoulder.y+38*s),rightHand:point(a.rightShoulder.x+26*s+w*32*s,a.rightShoulder.y+76*s),leftKnee:point(a.leftHip.x-w*27*s,a.leftHip.y+53*s),leftFoot:point(a.leftHip.x-w*42*s,f.y+2),rightKnee:point(a.rightHip.x+w*27*s,a.rightHip.y+53*s),rightFoot:point(a.rightHip.x+w*42*s,f.y+2)}}
