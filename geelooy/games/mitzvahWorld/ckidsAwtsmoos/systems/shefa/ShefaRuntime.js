// B"H
/** ShefaRuntime: chesed opens flow, gevurah constricts misuse, and malchus makes the effect visible. */
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
function state(store={}){ store.shefa ||= { chesed:0, gevurah:0, tiferes:0, malchus:0, pulses:[] }; return store.shefa; }
export function applyShefaAction(store={}, action='kindness', amount=1){ const s=state(store), n=Number(amount||1); if(['kindness','tzedakah','hospitality','learning'].includes(action)) s.chesed+=n; if(['harm','theft','broken_promise'].includes(action)) s.gevurah+=n; s.tiferes=clamp(s.chesed-s.gevurah,-20,20); s.malchus=clamp(s.tiferes + Number(store.reputation?.village||0),-30,30); store.economy ||= {}; if(s.malchus>5) store.economy.charity=Math.min(10,(store.economy.charity||0)+1); s.pulses=[...(s.pulses||[]),{ action, amount:n, malchus:s.malchus, at:Date.now() }].slice(-40); return { ...s }; }
export function shefaSummary(store={}){ return { ...state(store) }; }
export function createShefaRuntime(store={}){ return { apply:(a,n)=>applyShefaAction(store,a,n), summary:()=>shefaSummary(store) }; }
export default { applyShefaAction, shefaSummary, createShefaRuntime };
