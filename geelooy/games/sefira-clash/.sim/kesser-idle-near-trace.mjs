import { writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';
const map=MAPS.find(m=>m.id==='kesser-rift');
const state=createGameState(map,5,{},{}); state.phase='playing';
const input={x:0,y:0,aimX:1,aimY:0,down:false,jump:false,punch:false,kick:false,grab:false,shield:false,special:false};
const events=[]; const windows={};
for(let i=0;i<18000;i++){
  stepState(state,input);
  for(const f of state.fighters){
    if(f.human||f.dead||f.hidden) continue;
    const m=f.aiMind||{};
    const idle=m.positionLoop?.idleNearEnemyFrames||0;
    if(idle>100 && (!windows[f.id] || idle>windows[f.id].max)) {
      windows[f.id]={max:idle,frame:state.frame,x:Math.round(f.x),y:Math.round(f.y),vx:+(f.vx||0).toFixed(2),target:m.targetId,state:m.state,opp:m.opportunity?.name,tactic:m.tactic,noPressure:m.noPressure,sameLane:m.sameLane,input:f.input,attack:!!f.attack,rapid:!!f.rapidAttack};
      events.push({...windows[f.id],id:f.id});
    }
  }
}
const out={map:map.id,frame:state.frame,windows:Object.values(windows),lastEvents:events.slice(-80),final:state.fighters.map(f=>({id:f.id,human:f.human,stocks:f.stocks,damage:Math.round(f.damage||0),dead:f.dead,hidden:!!f.hidden,x:Math.round(f.x),y:Math.round(f.y),state:f.aiMind?.state,opp:f.aiMind?.opportunity?.name,tactic:f.aiMind?.tactic,noPressure:f.aiMind?.noPressure,idle:f.aiMind?.positionLoop?.idleNearEnemyFrames,target:f.aiMind?.targetId,input:f.input}))};
writeFileSync('.sim/kesser-idle-near-trace.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
