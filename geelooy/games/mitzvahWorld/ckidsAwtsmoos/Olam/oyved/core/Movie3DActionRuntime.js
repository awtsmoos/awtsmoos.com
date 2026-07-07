// B"H
/** Real 3D movie actions: AnimationMixer clips on chossid.glb, never 2D. */
import * as THREE from "/games/scripts/build/three.module.js";
const A={idle:["stand_Armature","stand 2_Armature","neutral_Armature"],walk:["walk_Armature","walk"],run:["run_Armature","run"],jump:["jump_Armature","jump"],talk:["hands-out","neutral_Armature"],punch:["punch"],stab:["stab"],dance:["dance silly_Armature","dance hip hop_Armature"]};
const FLAG="__AWTSMOOS_ENABLE_WORKER_PLAYER_MIXER__";
function playerOf(o){return o?.chossid||o?.player||o?.nivrayim?.find?.(x=>x?.type==="chossid")||null}
function names(p){return(p?.animations||[]).map(c=>c?.name).filter(Boolean)}
function clipObj(p,n){const k=String(n||"").toLowerCase();return(p?.animations||[]).find(c=>String(c?.name||"").toLowerCase()===k)||(p?.animations||[]).find(c=>String(c?.name||"").toLowerCase().includes(k))||null}
function clipName(p,a){for(const n of(A[a]||[a])){const c=clipObj(p,n);if(c)return c.name}return null}
function bone(root,re){let out=null;root?.traverse?.(n=>{if(!out&&re.test(n.name||""))out=n});return out}
function quat(x,y,z){const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));return[q.x,q.y,q.z,q.w]}
function track(n,t,v){return new THREE.QuaternionKeyframeTrack(`${n}.quaternion`,t,v)}
function genTalk(p){const r=p?.modelMesh||p?.mesh,l=bone(r,/LeftArm$/),rr=bone(r,/RightArm$/);if(!l||!rr)return null;const t=[0,.3,.6,.9,1.2];return new THREE.AnimationClip("generated_talkHands_3d",1.2,[track(l.name,t,[...quat(.15,0,.55),...quat(-.45,0,1),...quat(.05,0,.35),...quat(-.32,0,.9),...quat(.15,0,.55)]),track(rr.name,t,[...quat(.15,0,-.55),...quat(-.45,0,-1),...quat(.05,0,-.35),...quat(-.32,0,-.9),...quat(.15,0,-.55)])])}
function ensureGenerated(p,a){if(a!=="talk")return null;const found=clipObj(p,"generated_talkHands_3d");if(found)return found.name;const c=genTalk(p);if(!c)return null;p.animations||=[];p.animations.push(c);p.__awtsmoosClipActionByKey?.clear?.();p.getChaweeyoos?.();return c.name}
function advance(p,dt=.12){try{p.animationMixer?.update?.(dt);p.mesh?.updateMatrixWorld?.(true);p.modelMesh?.updateMatrixWorld?.(true);return true}catch{return false}}
function report(o,p,a,c,src,changed){const d={ok:Boolean(p&&c),at:Date.now(),action:a,clip:c,source:src,changed,clipNames:names(p),mixer:Boolean(p?.animationMixer),current:p?.currentAction?._clip?.name||null,currentTime:p?.currentAction?.time||0,real3DOnly:true,overlay:false};if(o)o.__AWTSMOOS_MOVIE_3D_ACTION_REPORT__=d;return d}
export function playMovie3DAction(o,payload={}){globalThis[FLAG]=true;const p=playerOf(o),a=String(payload.action||"idle");if(!p)return report(o,p,a,null,"missing-player",false);let c=clipName(p,a),src="built-in-glb";if(!c){c=ensureGenerated(p,a);src="generated-three-clip"}if(!c)return report(o,p,a,null,"missing-clip",false);const last=p.__awtsmoosMovieAction||{},changed=last.clip!==c||last.action!==a||payload.force===true;p.__awtsmoosMovieAction={action:a,clip:c,at:Date.now()};p.playChaweeyoos?.(c,{force:changed,loop:payload.loop!==false,duration:.08,timeScale:Number(payload.timeScale)||1});if(changed)advance(p,.16);if(a==="walk"||a==="run"){p.moving.forward=true;p.isWalking=true}if(a==="jump"){p.moving.jump=true;p.jumped=true}return report(o,p,a,c,src,changed)}
export default playMovie3DAction;
