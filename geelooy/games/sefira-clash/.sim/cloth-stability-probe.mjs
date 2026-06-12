import { buildSkeleton } from '../js/skeleton/buildSkeleton.js';
import { solveSkeleton } from '../js/skeleton/solveSkeleton.js';
const f={id:'cloth',x:140,y:260,vx:12,vy:0,face:1,grounded:true,damage:30,stocks:2,dna:{height:1,hue:44,arm:1,leg:1},motionClock:0,aiMind:{role:{name:'Hunter'},koIntent:{active:true}}};
f.bones=buildSkeleton(f);for(let i=0;i<300;i++){f.motionClock=i;f.vx=Math.sin(i*.1)*12;solveSkeleton(f);for(const chain of Object.values(f.clothState||{})){if(Array.isArray(chain)){if(chain.length>8)throw new Error('runaway cloth');for(const p of chain)if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new Error('bad cloth point')}}}
console.log(JSON.stringify({ok:true,cloth:f.clothState},null,2));
