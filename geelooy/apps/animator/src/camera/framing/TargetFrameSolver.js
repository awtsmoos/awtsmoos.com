// B"H
import { ObjectInsertFrameSolver } from './ObjectInsertFrameSolver.js';
import { CameraClampSolver } from './CameraClampSolver.js';
import { ShotProfileLibrary } from './ShotProfileLibrary.js';
import { PortraitCompositionSolver } from './PortraitCompositionSolver.js';
import { TableAwareFrameSolver } from './TableAwareFrameSolver.js';
import { HatHeadroomSolver } from './HatHeadroomSolver.js';
import { FrameBounds } from './FrameBounds.js';
export class TargetFrameSolver {
  static solve({shotType='mediumShot',targets=[],event={}}={}){const profile=ShotProfileLibrary.get(shotType);let cam=/insert|detail|food|object|book|soup/i.test(shotType)?{...ObjectInsertFrameSolver.frame(targets),shotType}:this.people(shotType,targets,event,profile);cam=TableAwareFrameSolver.apply(cam,profile);cam=HatHeadroomSolver.apply(cam,targets);cam=PortraitCompositionSolver.apply(cam,shotType);return CameraClampSolver.clamp(cam);}
  static people(shotType,targets,event,profile){const actors=targets.filter(t=>t.type!=='prop');const use=actors.length?actors:targets;const bounds=FrameBounds.combine(use);const center=use.length?use.reduce((s,t)=>s+Number(t.position?.x||0),0)/use.length:bounds.x;return{x:this.lookRoom(center,use,event),y:profile.y,zoom:this.zoom(profile,bounds,use.length),shotType};}
  static zoom(profile,bounds,count){if(count>2)return Math.max(profile.min,Math.min(profile.max,profile.zoom*.92));if(bounds.w>260)return Math.max(profile.min,Math.min(profile.max,profile.zoom*.95));return profile.zoom;}
  static lookRoom(x,targets,event){const t=`${event.movementIntent||''} ${event.action||''}`;if(!/walk|follow|track/i.test(t))return x;return x+(targets[0]?.raw?.flipX?-16:16);}
}
