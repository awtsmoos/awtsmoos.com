// B"H
import { detectDeviceTier } from "../performance/DeviceTierDetector.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { adaptiveRenderScale } from "../performance/AdaptiveRenderScale.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { fastSceneBudget } from "../performance/FastSceneBudget.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const tier = detectDeviceTier({ innerWidth:390, innerHeight:780 }, { hardwareConcurrency:4, deviceMemory:4, userAgent:"Android" });
console.log(JSON.stringify({ tier, scale:adaptiveRenderScale(tier), budget:fastSceneBudget(tier) }, null, 2));
