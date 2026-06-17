// B"H
import ATMOSPHERE_TUNING from "./AtmosphereTuning.js";
import { rtxFeelingWithoutRtx } from "./RtxFeelingWithoutRtx.js";
import { treeScaleTuning, applyTreeScale } from "./TreeScaleTuning.js";
import { detectDeviceTier } from "../performance/DeviceTierDetector.js";
import { visualTuningReport } from "./VisualTuningReport.js";
import { findLiveScene, liveSceneStatus } from "./LiveSceneFinder.js";
export function bootVisualTuning(win = globalThis.window, doc = globalThis.document) {
  const tier = detectDeviceTier(win, win?.navigator);
  const scene = findLiveScene(win);
  const sceneStatus = liveSceneStatus(win);
  const trees = scene ? applyTreeScale(scene, treeScaleTuning(tier)) : { touched:0, skipped:true, reason:sceneStatus.reason };
  doc?.documentElement?.style?.setProperty?.("--awt-visual-saturation", String(ATMOSPHERE_TUNING.saturation));
  doc?.documentElement?.classList?.add?.("awtsmoos-visual-tuned");
  const result = { atmosphere:ATMOSPHERE_TUNING, rtxFeeling:rtxFeelingWithoutRtx(tier), trees, scene:sceneStatus };
  const report = visualTuningReport(result); report.scene = sceneStatus;
  win.__AWTSMOOS_VISUAL_TUNING__ = report;
  win.__AWTSMOOS_VISUAL_TUNING_REPORT__ = () => report;
  return report;
}
bootVisualTuning();
setTimeout(() => bootVisualTuning(), 4000);
setTimeout(() => bootVisualTuning(), 12000);
setTimeout(() => bootVisualTuning(), 45000);
export default bootVisualTuning;
