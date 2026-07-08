// B"H
/**
 * @file WorldHeescheel.js
 * @description
 * Chapter 649: The worker genesis now sends mission light to the screen.
 *
 * The Awtsmoos does not only manifest meshes. It also tells the player why the
 * world exists: title, mission, hint, objectives, required perutos, and source.
 * This worker vessel keeps genesis compact, binds HTML signals, loads nivrayim,
 * and emits both `levelGoal` and `levelMission` before the world breathes.
 */
import HTMLMessenger from "./HTMLMessenger.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import TimeTracker from "../../../../utils/TimeTracker.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function elapsed(start) { return (performance.now() - start).toFixed(0); }
function worldDataFrom(options = {}) { return options.worldDayuh || options.userInfo || options; }
function sourcePathFrom(options = {}, worldData = {}) { return options.sourcePath || worldData.sourcePath || worldData.shaym || worldData.id || "current"; }
function requiredPerutosFrom(worldData = {}) {
  const explicit = Number(worldData.requiredPerutos || 0);
  if (explicit > 0) return explicit;
  const collect = worldData.objectives?.find?.(item => item.type === "collect" && item.target === "Coin");
  return Number(collect?.count || worldData.nivrayim?.Coin?.length || 0);
}
function missionPayload(worldData, sourcePath, requiredPerutos) {
  const presentation = worldData.presentation || {};
  return {
    sourcePath,
    id: worldData.id || worldData.shaym || sourcePath,
    title: worldData.title || presentation.titleCard || sourcePath,
    description: worldData.description || "",
    missionText: presentation.missionText || "Collect the perutos, give tzedakah, and return through the mezuzah gate.",
    hintText: presentation.hintText || "Read the platform colors and stay above danger.",
    theme: presentation.theme || worldData.gameplayContract?.theme || null,
    biome: presentation.biome || null,
    difficultyTier: presentation.difficultyTier || null,
    estimatedDifficulty: presentation.estimatedDifficulty || null,
    readabilityContract: presentation.readabilityContract || [],
    objectives: Array.isArray(worldData.objectives) ? worldData.objectives : [],
    requiredPerutos
  };
}
function bindLifecycleSignals(me) {
  me.olam.on("hide loading screen", () => postMessage({ type: "hideLoadingScreen" }));
  me.olam.on("increased percentage", (info = {}) => postMessage({ type: "increasedOlamLoading", payload: info }));
  me.olam.on("ready to start game", () => {
    TimeTracker.log("WORKER_GENESIS", "Sending Game Ignition Signal.");
    postMessage({ type: "game started", payload: true });
    postMessage({ type: "loadedWorld", payload: true });
  });
}
function emitMissionUi(olam, worldData, sourcePath, requiredPerutos) {
  const payload = missionPayload(worldData, sourcePath, requiredPerutos);
  olam.ayshPeula("ui event", "levelGoal", { requiredPerutos, sourcePath, title: payload.title, missionText: payload.missionText });
  olam.ayshPeula("ui event", "levelMission", payload);
  olam.ayshPeula("ui event", "gameHUD", { levelMission: payload });
}

export default class WorldHeescheel {
  static async execute(me, OlamClass, options = {}) {
    TimeTracker.start("WORKER_GENESIS");
    const execStart = performance.now();
    if (!OlamClass) {
      console.error('B"H - 🚨 [WorldHeescheel] FATAL: OlamClass is null. Cannot create from nothing!');
      return { tawchlees: { message: "Class Nullified", code: "ERROR" } };
    }
    me.olam = new OlamClass();
    if (options.set) Object.assign(me.olam, options.set);
    if (options.systemInfo?.set) Object.assign(me.olam, options.systemInfo.set);
    TimeTracker.log("WORKER_GENESIS", "Olam Class Instantiated.");
    await me.olam.init();
    TimeTracker.log("WORKER_GENESIS", "Olam Core Faculties Grafted.");
    bindLifecycleSignals(me);
    HTMLMessenger.bind(me);
    me.olam.ayshPeula("increase loading percentage", { amount: 10, action: "Processing Divine Blueprints..." });
    const worldData = worldDataFrom(options);
    me.olam.sourcePath = sourcePathFrom(options, worldData);
    me.olam.requiredPerutos = requiredPerutosFrom(worldData);
    emitMissionUi(me.olam, worldData, me.olam.sourcePath, me.olam.requiredPerutos);
    const nivrayim = worldData.nivrayim || {};
    const typeCount = Object.keys(nivrayim).length;
    if (typeCount === 0) {
      console.warn(`B"H - [+${elapsed(execStart)}ms] ⚠️ VERSE 5: nivrayim is EMPTY! userInfo keys: ${options.userInfo ? Object.keys(options.userInfo).join(', ') : 'N/A'}`);
    }
    TimeTracker.log("WORKER_GENESIS", "Beginning loadNivrayim sequence.");
    const loadStart = performance.now();
    const result = await me.olam.loadNivrayim(nivrayim);
    const loadMs = (performance.now() - loadStart).toFixed(1);
    TimeTracker.log("WORKER_GENESIS", `loadNivrayim complete. Manifested ${result?.length || 0} souls in ${loadMs}ms.`);
    if (!result || result.length === 0) console.warn(`B"H - [+${elapsed(execStart)}ms] ⚠️ VERSE 6: Manifestation returned 0 souls. Check AWTSMOOS exports for: ${Object.keys(nivrayim).join(', ')}`);
    me.olam.ayshPeula("ready to start game");
    const totalMs = (performance.now() - execStart).toFixed(1);
    TimeTracker.finish("WORKER_GENESIS", `World fully manifested in ${totalMs}ms total.`);
    return { tawchlees: { message: "World Manifested", code: "OK", world: worldData.shaym, entityCount: result?.length || 0, totalMs } };
  }
}
