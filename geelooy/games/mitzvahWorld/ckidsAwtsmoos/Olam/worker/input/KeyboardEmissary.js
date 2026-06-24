// B"H
/**
 * KeyboardEmissary: keys are decrees, but repeated decrees need not cross the veil.
 * Down events are de-duplicated until keyup; keyup remains exact for safety.
 */
import SefiraOfInput from './SefiraOfInput.js?v=npc-scroll-pass-through-20260609-bh638';
const TYPING_TAGS=new Set(['INPUT','TEXTAREA','SELECT']);
function isTyping(){const el=document.activeElement;return !!el&&TYPING_TAGS.has(String(el.tagName||'').toUpperCase());}
function post(worker,payload){try{worker?.postMessage?.(payload);}catch(error){console.warn('B"H | KeyboardEmissary post failed',error);}}
export default class KeyboardEmissary{
  static bind(worker){const down=new Set();window.addEventListener('keydown',e=>{if(isTyping())return;const code=e.code||e.key;if(down.has(code))return;down.add(code);post(worker,{keydown:SefiraOfInput.cleanseEvent(e)});},{passive:true});window.addEventListener('keyup',e=>{if(isTyping())return;const code=e.code||e.key;down.delete(code);post(worker,{keyup:SefiraOfInput.cleanseEvent(e)});},{passive:true});window.addEventListener('blur',()=>down.clear(),{passive:true});}
}

