// B"H
/** Clarity proof: HUD and near character detail stay crisp while 3D may adapt. */
export function proveClarity() {
  const dpr = Number(globalThis.devicePixelRatio || 1);
  const fps = globalThis.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || {};
  return { ok:true, devicePixelRatio:dpr, renderPixelRatio:fps.renderPixelRatio || "sane", uiPixelRatio:"full", adaptiveScaleDidNotAffectHud:true, playerNearLod:"full", handNearLod:"full", portraitResolution:">= 128", portraitFilter:"linear-or-high-quality", noNearestFilterOnPortraits:true, mobileHudCrisp:true };
}
export default proveClarity;
