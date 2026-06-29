// B"H
/**
 * AdaptiveRenderScale: crisp native pixel contract.
 * Realism and frame safety now come from LOD, spatial bubbles, and simulation
 * throttles; mobile should not become blurry just to hide expensive content.
 */
export function adaptiveRenderScale(tier={}){
  return 1;
}
export function pixelRatioCap(tier={}){
  if(tier.mobile) return 1;
  if(tier.tier==='low') return 1;
  if(tier.tier==='medium') return 1;
  return 1.25;
}
export function desiredPixelRatio(win=globalThis.window,tier={},scale=adaptiveRenderScale(tier)){
  const native=Number(win?.devicePixelRatio||1);
  const cap=pixelRatioCap(tier);
  const pixelRatio=Math.max(1,Math.min(cap,native*scale));
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
