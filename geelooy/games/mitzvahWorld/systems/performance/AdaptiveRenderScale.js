// B"H
/**
 * AdaptiveRenderScale: FPS-first pixel contract.
 * Realism must come from memory, story, audio, variation fields, and schedules;
 * if frames shake, pixel ratio yields before civilization does.
 */
export function adaptiveRenderScale(tier={}){
  if(tier.mobile) return .62;
  if(tier.tier==='low') return .66;
  if(tier.tier==='medium') return .74;
  return .82;
}
export function pixelRatioCap(tier={}){
  if(tier.mobile) return .68;
  if(tier.tier==='low') return .72;
  if(tier.tier==='medium') return .78;
  return .82;
}
export function desiredPixelRatio(win=globalThis.window,tier={},scale=adaptiveRenderScale(tier)){
  const native=Number(win?.devicePixelRatio||1);
  const cap=pixelRatioCap(tier);
  const pixelRatio=Math.max(.55,Math.min(cap,native*scale));
  return{native,cap,scale,pixelRatio,applied:pixelRatio<native};
}
export function applyRenderScale(renderer,scale,win=globalThis.window,tier={}){
  if(!renderer||typeof renderer.setPixelRatio!=='function')return{applied:false};
  const state=desiredPixelRatio(win,tier,scale);
  renderer.setPixelRatio(state.pixelRatio);
  if(renderer.info)renderer.info.autoReset=true;
  return{applied:true,...state};
}
export default adaptiveRenderScale;