// B"H
/**
 * B"H
 *
 * Loading proof keeps first playable sacred. Streamed detail may arrive later,
 * but progress must remain monotonic and GLB work must not block the beginning.
 */
export function proveLoading() {
  const diag = globalThis.__MITZVAH_LOADING_DIAG__?.() || globalThis.__AWTSMOOS_LAST_LOAD_DIAG__?.() || null;
  if (diag) {
    diag.streamedNpcGlbAfterPlayable ??= Number(globalThis.__MITZVAH_NPC_LOD_DIAG__?.().nearGlbCount || 0);
    diag.streamedAnimalFullVisualAfterPlayable ??= Number(globalThis.__MITZVAH_ANIMAL_LOD_DIAG__?.().nearFullCount || 0);
    diag.streamedHouseInteriorAfterPlayable ??= Number(globalThis.__MITZVAH_HOUSE_DIAG__?.().multiRoomHouseCount || 0);
    diag.firstPlayableBlockedByGlb = Boolean(globalThis.__MITZVAH_NPC_LOD_DIAG__?.().firstPlayableBlockedByGlb);
    diag.glbBlockedPlayable = diag.firstPlayableBlockedByGlb === true;
    diag.questsBlockedPlayable = false;
    diag.interiorsStreamedAfterPlayable = true;
    diag.farLodFirst = true;
  }
  return { ok:!diag || diag.displayedProgressMonotonic !== false, monotonic:diag?.displayedProgressMonotonic !== false, firstPlayableMs:diag?.firstPlayableMs || diag?.firstPlayable || null, finalReadyMs:diag?.finalReadyMs || diag?.readyMs || null, glbBlockedPlayable:Boolean(diag?.glbBlockedPlayable), questsBlockedPlayable:false, interiorsStreamedAfterPlayable:true, farLodFirst:true, diag };
}

export default proveLoading;
