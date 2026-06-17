// B"H
import { composeSefirosScene } from "./SefirosSceneComposer.js";
import { sefirosToLegacyThreeSummary } from "./SefirosLegacyThreeCompatibility.js";
export function sefirosRenderGateway(scenePlan = {}) { const scene = composeSefirosScene(scenePlan); return { scene, legacySummary:sefirosToLegacyThreeSummary(scenePlan) }; }
