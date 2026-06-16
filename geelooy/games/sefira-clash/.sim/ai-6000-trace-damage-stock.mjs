import { writeFileSync } from 'fs';
import { MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';
const map=MAPS.find(m=>m.id==='beit-midrash-bouncer')||MAPS[0];
const state=createGameState(map,5,{},{});state.phase='playing';
const input={x:0,y:0,aimX:1,aimY:0,down:false,jump:false,punch:false,kick:false,grab:false,shield:false,special:false};
const events=[];const samples=[];let last=state.fighters.map(f=>snap(f));let attackFrames=0, commands=0;
for(let i=0;i<6000;i++){
 stepState(state,input);
 for(const f of state.fighters){if(!f.human&&f.input&&(f.input.punch||f.input.kick||f.input.grab||f.input.rapidPunch))commands++; if(!f.human&&(f.attack||f.rapidAttack))attackFrames++;}
 for(let n=0;n<state.fighters.length;n++){
  const f=state.fighters[n], prev=last[n];
  if(prev.stocks!==f.stocks||Math.abs(prev.damage-(f.damage||0))>=20||prev.dead!==f.dead||prev.hidden!==!!f.hidden){events.push({frame:state.frame,id:f.id,human:f.human,from:prev,to:snap(f),ai:f.aiMind?{state:f.aiMind.state,opp:f.aiMind.opportunity?.name,tactic:f.aiMind.tactic,reason:f.aiMind.attackCheck?.reason,target:f.aiMind.targetId,noPressure:f.aiMind.noPressure,sameLane:f.aiMind.sameLane}:null});}
  last[n]=snap(f);
 }
 if(state.frame%300===0)samples.push({frame:state.frame,totalDamage:sumDamage(),alive:aliveCount(),winner:state.winner||null,fighters:state.fighters.map(f=>({id:f.id,human:f.human,stocks:f.stocks,damage:Math.round(f.damage||0),dead:f.dead,hidden:!!f.hidden,state:f.aiMind?.state,opp:f.aiMind?.opportunity?.name,tactic:f.aiMind?.tactic,target:f.aiMind?.targetId}))});
}
const report={map:map.id,frame:state.frame,winner:state.winner||null,totalDamage:sumDamage(),alive:aliveCount(),attackFrames,commands,final:state.fighters.map(f=>snap(f)),events:events.slice(-160),samples};
writeFileSync('.sim/ai-6000-trace-damage-stock.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({map:report.map,frame:report.frame,winner:report.winner,totalDamage:report.totalDamage,alive:report.alive,attackFrames,commands,eventCount:events.length,lastEvents:report.events.slice(-10),lastSamples:samples.slice(-5)},null,2));
function snap(f){return{id:f.id,stocks:f.stocks,damage:Math.round(f.damage||0),dead:!!f.dead,hidden:!!f.hidden,x:Math.round(f.x),y:Math.round(f.y)}}
function sumDamage(){return Math.round(state.fighters.reduce((s,f)=>s+(f.damage||0),0));}
function aliveCount(){return state.fighters.filter(f=>!f.dead&&!f.hidden&&(f.stocks||0)>0).length;}
