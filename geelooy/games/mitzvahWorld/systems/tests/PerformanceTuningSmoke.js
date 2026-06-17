// B"H
import { detectDeviceTier } from "../performance/DeviceTierDetector.js";
import { adaptiveRenderScale } from "../performance/AdaptiveRenderScale.js";
import { fastSceneBudget } from "../performance/FastSceneBudget.js";
const tier = detectDeviceTier({ innerWidth:390, innerHeight:780 }, { hardwareConcurrency:4, deviceMemory:4, userAgent:"Android" });
console.log(JSON.stringify({ tier, scale:adaptiveRenderScale(tier), budget:fastSceneBudget(tier) }, null, 2));
