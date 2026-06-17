// B"H
const CANDIDATES = [
  win => win?.scene,
  win => win?.__AWTSMOOS_SCENE__,
  win => win?.__AWTSMOOS_OLAM__?.scene,
  win => win?.olam?.scene,
  win => win?.ikar?.olam?.scene,
  win => win?.mana?.activeOlam?.scene,
  win => win?.mana?.olam?.scene,
  win => win?.AWTSMOOS_LIVING_REGION_MAIN?.scene
];
export function findLiveScene(win = globalThis.window) {
  for (const get of CANDIDATES) { try { const scene = get(win); if (scene?.children) return scene; } catch {} }
  return null;
}
export function liveSceneStatus(win = globalThis.window) {
  const scene = findLiveScene(win);
  return { accessible:Boolean(scene), childCount:scene?.children?.length || 0, reason:scene ? "main-thread-scene-found" : "worker-scene-not-exposed-to-main-thread" };
}
export default findLiveScene;
