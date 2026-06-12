/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
import {influence} from '../compose/poseInfluence.js';import {PRIORITY} from '../compose/posePriority.js';
export function contactInfluences(f,m,body){const s=body.height,k=m.landingImpact||0;if(!m.grounded&&!k)return[];return[
  influence('leftFoot',0,(f.y+2)-(f.poseSnapshot?.leftFoot?.y??f.y+2),m.grounded?1:0,PRIORITY.contact,'left foot ground'),
  influence('rightFoot',0,(f.y+2)-(f.poseSnapshot?.rightFoot?.y??f.y+2),m.grounded?1:0,PRIORITY.contact,'right foot ground'),
  influence('chest',0,10*k*s,1,PRIORITY.contact,'impact chest drop'),
  influence('head',0,8*k*s,1,PRIORITY.contact,'impact head drop')
]}
