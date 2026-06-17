// B"H
function nameOf(item) { return String(item?.name || item?.shaym || item?.id || item?.mesh?.name || item?.constructor?.name || "").toLowerCase(); }
function countNamed(list = [], words = []) { let total = 0; for (const item of list || []) { const text = nameOf(item); if (words.some(word => text.includes(word))) total += 1; } return total; }
function safeChildren(scene) { return Array.isArray(scene?.children) ? scene.children : []; }
function postbuildTruth(olam, postbuild) { if (typeof postbuild?.ok === "boolean") return postbuild.ok; return Boolean(olam?.__mitzvahWorldPostBuildDone || olam?.__mitzvahWorldPostBuild || olam?.livingRegion || olam?.awtsmoosRegion); }
export function makeWorkerWorldReport({ olam = null, scene = null, nivrayim = [], elapsedMs = 0, source = null, postbuild = null } = {}) {
  const children = safeChildren(scene || olam?.scene);
  const souls = Array.isArray(nivrayim) ? nivrayim : [];
  const allNames = [...children, ...souls];
  const postbuildOk = postbuildTruth(olam, postbuild);
  return {
    ok: true,
    source: source || olam?.baseInfo?.id || olam?.baseInfo?.shaym || "unknown",
    at: Date.now(),
    elapsedMs: Math.round(Number(elapsedMs) || 0),
    sceneChildren: children.length,
    nivrayim: souls.length,
    player: Boolean(olam?.player || olam?.chossid || souls.find(x => x?.type === "chossid")),
    npcs: countNamed(souls, ["npc", "merchant", "rebbe", "teacher", "villager", "medabeir"]),
    trees: countNamed(allNames, ["tree", "etz", "oak", "palm", "cedar", "willow"]),
    grass: countNamed(allNames, ["grass", "blade", "meadow"]),
    animals: countNamed(allNames, ["cow", "goat", "sheep", "deer", "bird", "animal"]),
    buildings: countNamed(allNames, ["house", "hut", "shop", "building", "yeshiva", "shul"]),
    hasOctree: Boolean(olam?.worldOctree),
    hasCombat: Boolean(olam?.combatManager),
    hasPostbuild: postbuildOk,
    postbuild: postbuild || { ok: postbuildOk, source: "marker-derived" }
  };
}
export default makeWorkerWorldReport;
