// B"H
/**
 * MouseEmissary: the gaze crosses the worker boundary only as fast as frames can breathe.
 * Clicks remain immediate; motion is coalesced so realism never becomes input stampede.
 */
import SefiraOfInput from './SefiraOfInput.js?compact=true&v=npc-scroll-pass-through-20260609-bh638';
const now=()=>performance?.now?.()||Date.now();
function post(worker,payload){try{worker?.postMessage?.(payload);}catch(error){console.warn('B"H | MouseEmissary post failed',error);}}
function makeMotionFlush(worker){let scheduled=false,lastMove=null,drag={dx:0,dy:0,active:false};function flush(){scheduled=false;if(drag.active){post(worker,{cameraDrag:{dx:drag.dx,dy:drag.dy}});drag={dx:0,dy:0,active:false};}if(lastMove){post(worker,{mousemove:lastMove});lastMove=null;}}return function queue(e,isDragging){lastMove=SefiraOfInput.cleanseEvent(e);if(isDragging){drag.dx+=e.movementX||0;drag.dy+=e.movementY||0;drag.active=true;}if(!scheduled){scheduled=true;requestAnimationFrame(flush);}};}
export default class MouseEmissary{
  static bind(worker){let isLeftDown=false,isRightDown=false,lastDownAt=0,lastDownButton=null;const queueMotion=makeMotionFlush(worker);window.addEventListener('mousedown',e=>{if(SefiraOfInput.isUI(e.target))return;const at=now();if(e.button===lastDownButton&&at-lastDownAt<32)return;lastDownAt=at;lastDownButton=e.button;if(e.button===0)isLeftDown=true;if(e.button===2)isRightDown=true;post(worker,{mousedown:SefiraOfInput.cleanseEvent(e)});},{passive:true});window.addEventListener('mouseup',e=>{isLeftDown=false;isRightDown=false;post(worker,{mouseup:SefiraOfInput.cleanseEvent(e)});},{passive:true});window.addEventListener('mousemove',e=>{queueMotion(e,isLeftDown||isRightDown);},{passive:true});window.addEventListener('wheel',e=>{if(SefiraOfInput.isUI(e.target))return;if(e.cancelable)e.preventDefault();post(worker,{wheel:SefiraOfInput.cleanseEvent(e)});},{passive:false});}
}

