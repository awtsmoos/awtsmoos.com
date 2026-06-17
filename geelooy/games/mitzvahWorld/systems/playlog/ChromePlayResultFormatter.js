// B"H
export function formatChromePlayResult(result = {}) {
  const report = result.worldReport || result.log?.worldReport || null;
  return { ok:Boolean(result.canvas || result.canvasCount || report?.ok), clicked:Boolean(result.clicked), canvas:result.canvas || result.canvasCount || 0, lastStage:result.lastStage || result.log?.lastStage || null, timings:result.log?.marks?.slice?.(-12) || [], world:{ sceneChildren:report?.sceneChildren, nivrayim:report?.nivrayim, trees:report?.trees, buildings:report?.buildings, schools:report?.schoolChecklist, station:report?.starterStation } };
}
export default formatChromePlayResult;
