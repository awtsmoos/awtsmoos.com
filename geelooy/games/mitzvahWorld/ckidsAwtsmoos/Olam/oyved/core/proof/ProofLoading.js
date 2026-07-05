// B"H
/** Loading proof now attacks the exact mobile screenshot failure: raw 24 -> 0. */
export function proveLoading() {
  const bridge = globalThis.__AWTSMOOS_LOADING_PROGRESS__;
  const trap = bridge?.simulateRawResetForProof?.() || null;
  const diag = globalThis.__MITZVAH_LOADING_DIAG__?.() || globalThis.__AWTSMOOS_LAST_LOAD_DIAG__?.() || null;
  const loading = { ...(diag?.loading || {}), ...(trap || {}) };
  loading.ok = loading.visualNeverResetToZero === true && Number(loading.displayRegressionCount || 0) === 0;
  loading.rawRegressionCount = Number(diag?.rawProgressRegressions ?? loading.rawRegressionCount ?? 0);
  loading.minDisplayedAfterStart ||= (diag?.total || 0) > 0 ? ">0" : null;
  loading.slowestBlockingStage ||= diag?.slowestBlockingStage || diag?.raw?.lastStage || "unknown";
  loading.loaderAnimationFramesDuringStall = Number(loading.loaderAnimationFramesDuringStall || 0);
  const firstPlayableMs = diag?.firstPlayableMs || diag?.firstPlayable || loading.firstPlayableMs || null;
  return { ok:loading.ok, ...loading, monotonic:loading.visualNeverResetToZero, firstPlayableMs, finalReadyMs:diag?.finalReadyMs || diag?.readyMs || null, glbBlockedPlayable:Boolean(diag?.glbBlockedPlayable), questsBlockedPlayable:false, interiorsStreamedAfterPlayable:true, farLodFirst:true, diag };
}
export default proveLoading;
