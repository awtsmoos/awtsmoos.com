// B"H
/** @file VisualTuningBootstrap.js @description Boot-time beauty/tuning only: atmosphere, trees, seamless textures, UV audit, animals/houses. */
import ATMOSPHERE_TUNING from "./AtmosphereTuning.js";
import { rtxFeelingWithoutRtx } from "./RtxFeelingWithoutRtx.js";
import { treeScaleTuning, applyTreeScale } from "./TreeScaleTuning.js";
import { tuneSeamlessTextures } from "./SeamlessTextureTuning.js";
import { tuneAnimalAndHouseBeauty } from "./AnimalBeautyTuning.js?v=step-by-step-20260621-bh1";
import { enforceTextureQuality } from "./TextureQualityEnforcer.js?v=step-by-step-20260621-bh1";
import { auditUvDensity } from "./UvDensityAudit.js?v=step-by-step-20260621-bh1";
import { detectDeviceTier } from "../performance/DeviceTierDetector.js";
import { visualTuningReport } from "./VisualTuningReport.js";
import { findLiveScene, liveSceneStatus } from "./LiveSceneFinder.js";

export function bootVisualTuning(win = globalThis.window, doc = globalThis.document) {
  const tier = detectDeviceTier(win, win?.navigator), scene = findLiveScene(win), sceneStatus = liveSceneStatus(win);
  const missing = { scanned:0, skipped:true, reason:sceneStatus.reason };
  const trees = scene ? applyTreeScale(scene, treeScaleTuning(tier)) : { touched:0, skipped:true, reason:sceneStatus.reason };
  const textureQuality = scene ? enforceTextureQuality(scene) : missing;
  const seamlessTextures = scene ? tuneSeamlessTextures(scene) : missing;
  const uvDensity = scene ? auditUvDensity(scene) : missing;
  const beauty = scene ? tuneAnimalAndHouseBeauty(scene) : missing;
  doc?.documentElement?.style?.setProperty?.("--awt-visual-saturation", String(ATMOSPHERE_TUNING.saturation));
  doc?.documentElement?.classList?.add?.("awtsmoos-visual-tuned");
  const result = { atmosphere:ATMOSPHERE_TUNING, rtxFeeling:rtxFeelingWithoutRtx(tier), trees, textureQuality, seamlessTextures, uvDensity, beauty, scene:sceneStatus };
  const report = visualTuningReport(result);
  Object.assign(report, result);
  win.__AWTSMOOS_VISUAL_TUNING__ = report;
  win.__AWTSMOOS_VISUAL_TUNING_REPORT__ = () => report;
  return report;
}
bootVisualTuning();
setTimeout(() => bootVisualTuning(), 4000);
setTimeout(() => bootVisualTuning(), 12000);
setTimeout(() => bootVisualTuning(), 45000);
export default bootVisualTuning;
