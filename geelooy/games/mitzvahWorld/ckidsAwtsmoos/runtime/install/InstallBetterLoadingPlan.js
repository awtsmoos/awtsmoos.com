// B"H
/** @file InstallBetterLoadingPlan.js @description Loader polish begins as a real readiness graph. */
import { installLoadingReadinessPlan, loadingTips } from "../loading/LoadingReadinessPlan.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installBetterLoadingPlan(runtime) { const steps = installLoadingReadinessPlan(runtime); runtime?.markReady?.("loading:tips", { tips:loadingTips() }); return { steps, tips:loadingTips(), glass:"glow-particles-biome-preview", honest:true }; }
export default installBetterLoadingPlan;
