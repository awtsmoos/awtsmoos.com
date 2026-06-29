// B"H
/**
 * FpsGuardian: no scene traversal during gameplay.
 * It broadcasts budgets; render systems decide cheaply at their own cadence.
 */
const KEY='__AWTSMOOS_FPS_GUARDIAN__';
const TARGET=60,WINDOW=90;
const STAGES=Object.freeze([
  {name:'rich-60-proof',wildlifeTickSec:.45,visualTickSec:1.0,movieTickSec:1/60,accents:false,farInteriors:false,shadows:false,textureAniso:4,maxActiveEnemies:24,maxDistantActors:28},
  {name:'spike-shield',wildlifeTickSec:.75,visualTickSec:1.5,movieTickSec:1/60,accents:false,farInteriors:false,shadows:false,textureAniso:3,maxActiveEnemies:20,maxDistantActors:24},
  {name:'ten-minute-guarantee',wildlifeTickSec:1.15,visualTickSec:2.2,movieTickSec:1/60,accents:false,farInteriors:false,shadows:false,textureAniso:2,maxActiveEnemies:18,maxDistantActors:20},
  {name:'hundreds-nearby-combat-clamp',wildlifeTickSec:1.7,visualTickSec:3.0,movieTickSec:1/60,accents:false,farInteriors:false,shadows:false,textureAniso:1,maxActiveEnemies:14,maxDistantActors:14},
  {name:'emergency-exact-frame-pacer',wildlifeTickSec:2.4,visualTickSec:4.2,movieTickSec:1/60,accents:false,farInteriors:false,shadows:false,textureAniso:1,maxActiveEnemies:10,maxDistantActors:8}
]);
const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const fpsOf=ms=>1000/Math.max(.001,ms);
const pct=(sorted,p)=>sorted[Math.min(sorted.length-1,Math.max(0,Math.floor(sorted.length*p)))]||0;
function publish(win,state,stage,reason='boot'){
  const config=STAGES[stage]||STAGES.at(-1),root=win.document?.documentElement;
  root?.classList?.toggle('awtsmoos-fps-guardian-active',true);
  root?.setAttribute?.('data-awtsmoos-fps-stage',config.name);
  state.stage=stage;state.config=config;state.appliedAt=Date.now();state.history.push({at:state.appliedAt,stage,name:config.name,reason,avgFps:state.avgFps,minFps:state.minFps,p95FrameMs:state.p95FrameMs});state.history=state.history.slice(-20);
  win.__AWTSMOOS_GAMEPLAY_BUDGET__={...config,stage,targetFps:TARGET,seal:'no-traverse-fps-guardian-20260623-bh4'};
  win.dispatchEvent?.(new CustomEvent('awtsmoos:fps-guardian-stage',{detail:{stage,config,reason}}));
}
function adapt(win,state){if(state.samples.length<WINDOW)return;const recent=state.samples.slice(-WINDOW),sorted=recent.slice().sort((a,b)=>a-b),fps=recent.map(fpsOf);state.avgFps=Number(avg(fps).toFixed(2));state.minFps=Number(Math.min(...fps).toFixed(2));state.p95FrameMs=Number(pct(sorted,.95).toFixed(2));state.p99FrameMs=Number(pct(sorted,.99).toFixed(2));state.longFrames=recent.filter(v=>v>34).length;state.stable60=state.minFps>=TARGET&&state.p95FrameMs<=20;const now=performance.now();if(now-state.lastAdapt<3000)return;if((state.minFps<55||state.p95FrameMs>26||state.longFrames>3)&&state.stage<STAGES.length-1){state.lastAdapt=now;publish(win,state,state.stage+1,'spike');}}
export function bootFpsGuardian(win=globalThis.window){if(!win)return null;if(win[KEY])return win[KEY];const state={targetFps:TARGET,stage:2,config:STAGES[2],samples:[],avgFps:0,minFps:0,p95FrameMs:0,p99FrameMs:0,longFrames:0,stable60:false,last:0,lastAdapt:0,history:[]};win[KEY]=state;publish(win,state,2,'boot-conservative');const tick=t=>{if(state.last){const dt=t-state.last;if(dt>0&&dt<250)state.samples.push(dt);if(state.samples.length>WINDOW*5)state.samples.splice(0,state.samples.length-WINDOW*5);adapt(win,state);}state.last=t;win.requestAnimationFrame(tick);};win.requestAnimationFrame(tick);return state;}
bootFpsGuardian();
export default bootFpsGuardian;
