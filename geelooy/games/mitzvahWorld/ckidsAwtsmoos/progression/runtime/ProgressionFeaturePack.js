// B"H
/** @file ProgressionFeaturePack.js @description Installs shared XP, level, stat growth, and reward math. */
import { createProgressionRuntime, xpReward, statGrowth, levelFromXp } from "./LevelCurveRuntime.js";
export function installProgressionFeaturePack(runtime){ const progression=createProgressionRuntime(runtime); const api={ progression, xpReward, statGrowth, levelFromXp, ensure:(id,seed)=>progression.ensure(id,seed), award:(id,target,source)=>progression.award(id,target,source), snapshot:id=>progression.snapshot(id) }; runtime.progression=api; runtime?.markReady?.("progression:levels",{curve:"similar-level-xp-v1"}); return api; }
export default installProgressionFeaturePack;
