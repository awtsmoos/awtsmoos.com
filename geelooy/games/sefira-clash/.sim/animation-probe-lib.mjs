import { buildSkeleton } from '../js/skeleton/buildSkeleton.js';
import { solveSkeleton } from '../js/skeleton/solveSkeleton.js';
export function fighter(patch={}){const f={id:'probe',x:180,y:260,vx:0,vy:0,face:1,grounded:true,damage:20,stocks:2,dna:{height:1,hue:210,arm:1,leg:1},motionClock:44,aiMind:{role:{name:'Hunter'},koIntent:{active:true}},...patch};f.bones=buildSkeleton(f);solveSkeleton(f);return f}
export function assert(c,m){if(!c)throw new Error(m)}
export function finite(f){for(const b of Object.values(f.bones))if(b.root&&b.tip&&![b.root.x,b.root.y,b.tip.x,b.tip.y].every(Number.isFinite))throw new Error('nonfinite bone')}
