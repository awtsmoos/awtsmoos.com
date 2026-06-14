// B"H
/**
 * @file update.js
 * @description
 * Chapter 416: the model faces the same vector that moves the soul.
 * The Awtsmoos unifies input, physics, and garment direction after every frame,
 * so the Chossid no longer looks opposite the road he walks.
 */
import Chai from "../../chai/index.js?v=village-polish-20260612-bh810";
const INPUTS=["FORWARD","BACKWARD","LEFT_STRIDE","RIGHT_STRIDE","JUMP","DOWN","UP"];
function activeInputs(chossid){ return Object.keys(chossid?.olam?.inputs||{}).filter(k=>chossid.olam.inputs[k]); }
function shouldRunControls(chossid){ const cutscene=chossid?.olam?.isPlayingCutscene===true, has=INPUTS.some(k=>chossid?.olam?.inputs?.[k]===true); return !cutscene||has; }
function traceFrame(chossid,stage,extra={}){ const now=Date.now(), inputs=activeInputs(chossid), cadence=inputs.length?1000:2200; if(chossid.__lastFrameTraceAt&&now-chossid.__lastFrameTraceAt<cadence) return; chossid.__lastFrameTraceAt=now; const payload={stage,inputs,isReady:chossid.isReady,heesHawveh:chossid.heesHawveh,cutscene:chossid?.olam?.isPlayingCutscene,hasMesh:Boolean(chossid.mesh),hasModel:Boolean(chossid.modelMesh),modelParentIsRoot:chossid?.modelMesh?.parent===chossid?.mesh,visibleBody:chossid.__visibleBodyState||null,...extra}; chossid.olam.__movementTrace||=[]; chossid.olam.__movementTrace.push({at:now,kind:"CHOSSID_FRAME_TRACE",...payload}); chossid.olam.__movementTrace=chossid.olam.__movementTrace.slice(-80); }
function movementVector(chossid){ const m=chossid.moving||{}, v={x:0,z:0}; if(m.forward) v.z-=1; if(m.backward) v.z+=1; if(m.stridingLeft) v.x-=1; if(m.stridingRight) v.x+=1; const len=Math.hypot(v.x,v.z); if(len<.001) return null; return {x:v.x/len,z:v.z/len}; }
function alignModelFacing(chossid){ const v=movementVector(chossid); if(!v) return; const root=chossid.modelMesh||chossid.guf||chossid.mesh; if(!root) return; const yaw=Math.atan2(v.x,v.z)+Math.PI; if(!Number.isFinite(yaw)) return; chossid.__awtsmoosUnifiedFacingYaw=yaw; const turn=Number.isFinite(chossid.options?.lerpTurnSpeed)?chossid.options.lerpTurnSpeed:.38; root.rotation.y=lerpAngle(root.rotation.y,yaw,turn); }
function lerpAngle(a,b,t){ const d=Math.atan2(Math.sin(b-a),Math.cos(b-a)); return a+d*Math.max(0,Math.min(1,t)); }
export default {
  heesHawvoos(deltaTime){ if(!this.startedAll){ this.olam.ayshPeula("ready from chossid"); this.startedAll=true; } traceFrame(this,"frame-enter",{deltaTime}); if(shouldRunControls(this)) this.controls(deltaTime); else traceFrame(this,"controls-skipped-cutscene",{deltaTime}); if(this.olam&&this.olam.isLookingForSomething) this.checkHover(this.olam,false); if(this.koach!==undefined&&this.maxKoach!==undefined&&this.koach<this.maxKoach){ this.koach+=deltaTime*2; if(this.koach>this.maxKoach) this.koach=this.maxKoach; if(!this.lastKoachUpdate||Date.now()-this.lastKoachUpdate>1000){ if(typeof this.updateStatsUI==='function') this.updateStatsUI(); this.lastKoachUpdate=Date.now(); } } if(typeof this.adjustDOF==='function') this.adjustDOF(); if(typeof this.postProcessing==='function') this.postProcessing(); Chai.prototype.heesHawvoos.call(this,deltaTime); alignModelFacing(this); }
};
