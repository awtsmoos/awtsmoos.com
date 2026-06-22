// B"H
/**
 * @file VisualTuningBootstrap.js
 * @description
 * Boot-time beauty and truth reporting. Even when the live scene is still hidden
 * in worker breath, this module publishes honest skipped reports so Stephen and
 * every later shliach can distinguish "not run" from "not yet accessible".
 */
import ATMOSPHERE_TUNING from './AtmosphereTuning.js';
import { rtxFeelingWithoutRtx } from './RtxFeelingWithoutRtx.js';
import { treeScaleTuning, applyTreeScale } from './TreeScaleTuning.js';
import { tuneSeamlessTextures } from './SeamlessTextureTuning.js';
import { tuneAnimalAndHouseBeauty } from './AnimalBeautyTuning.js?v=step-by-step-20260621-bh1';
import { enforceTextureQuality } from './TextureQualityEnforcer.js?v=step-by-step-20260621-bh1';
import { auditUvDensity } from './UvDensityAudit.js?v=step-by-step-20260621-bh1';
import { detectDeviceTier } from '../performance/DeviceTierDetector.js';
import { visualTuningReport } from './VisualTuningReport.js';
import { findLiveScene, liveSceneStatus } from './LiveSceneFinder.js';

const RETRY_KEY = '__AWTSMOOS_VISUAL_TUNING_RETRY__';
const ATTEMPT_KEY = '__AWTSMOOS_VISUAL_TUNING_ATTEMPTS__';
const SEAL = 'stephen-visible-visual-truth-20260622-bh1';

function skipped(kind, reason, extra = {}) {
  return {
    kind,
    scanned: 0,
    touched: 0,
    skipped: true,
    reason,
    seal: SEAL,
    at: Date.now(),
    ...extra
  };
}

function publishFallbackGlobals(win, sceneStatus, textureQuality, seamlessTextures, uvDensity, beauty) {
  if (!win) return;
  win.__AWTSMOOS_TEXTURE_PINGPONG_REPORT__ = seamlessTextures;
  win.__AWTSMOOS_TEXTURE_QUALITY_REPORT__ = textureQuality;
  win.__AWTSMOOS_UV_DENSITY_REPORT__ = uvDensity;
  win.__AWTSMOOS_BEAUTY_TUNING__ = beauty;
  win.__AWTSMOOS_SCENE_STATUS__ = sceneStatus;
}

function applyAtmosphere(doc) {
  doc?.documentElement?.style?.setProperty?.('--awt-visual-saturation', String(ATMOSPHERE_TUNING.saturation));
  doc?.documentElement?.classList?.add?.('awtsmoos-visual-tuned');
}

export function bootVisualTuning(win = globalThis.window, doc = globalThis.document) {
  const attempt = Number(win?.[ATTEMPT_KEY] || 0) + 1;
  if (win) win[ATTEMPT_KEY] = attempt;
  const tier = detectDeviceTier(win, win?.navigator);
  const scene = findLiveScene(win);
  const sceneStatus = { ...liveSceneStatus(win), attempt, seal: SEAL, at: Date.now() };
  const reason = sceneStatus.reason || 'scene-not-accessible';
  const missing = kind => skipped(kind, reason, { scene: sceneStatus });
  const trees = scene ? applyTreeScale(scene, treeScaleTuning(tier)) : missing('tree-scale');
  const textureQuality = scene ? enforceTextureQuality(scene) : missing('texture-quality');
  const seamlessTextures = scene ? tuneSeamlessTextures(scene) : missing('seamless-textures');
  const uvDensity = scene ? auditUvDensity(scene) : missing('uv-density');
  const beauty = scene ? tuneAnimalAndHouseBeauty(scene) : missing('animal-house-beauty');
  applyAtmosphere(doc);
  publishFallbackGlobals(win, sceneStatus, textureQuality, seamlessTextures, uvDensity, beauty);
  const result = {
    atmosphere: ATMOSPHERE_TUNING,
    rtxFeeling: rtxFeelingWithoutRtx(tier),
    trees,
    textureQuality,
    seamlessTextures,
    uvDensity,
    beauty,
    scene: sceneStatus,
    seal: SEAL
  };
  const report = visualTuningReport(result);
  Object.assign(report, result);
  if (win) {
    win.__AWTSMOOS_VISUAL_TUNING__ = report;
    win.__AWTSMOOS_VISUAL_TUNING_REPORT__ = () => win.__AWTSMOOS_VISUAL_TUNING__;
  }
  return report;
}

function scheduleVisualRetries(win = globalThis.window, doc = globalThis.document) {
  if (!win || win[RETRY_KEY]) return;
  const delays = [250, 1000, 2500, 5000, 9000, 15000, 30000, 45000];
  const run = index => {
    bootVisualTuning(win, doc);
    if (index >= delays.length - 1 || findLiveScene(win)) {
      win[RETRY_KEY] = null;
      return;
    }
    win[RETRY_KEY] = win.setTimeout(() => run(index + 1), delays[index + 1]);
  };
  win[RETRY_KEY] = win.setTimeout(() => run(0), delays[0]);
}

function bootNow() {
  const report = bootVisualTuning();
  scheduleVisualRetries();
  return report;
}

bootNow();
for (const name of ['awtsmoos-game-ready', 'awtsmoos:renderer-ready', 'awtsmoos:performance-probe', 'awtsmoos:scene-ready', 'awtsmoos:pixel-ratio-governed']) {
  globalThis.window?.addEventListener?.(name, bootNow, { passive: true });
}
export default bootVisualTuning;
