// B"H
import { composeSefirosScene } from "./SefirosSceneComposer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { sefirosToLegacyThreeSummary } from "./SefirosLegacyThreeCompatibility.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosRenderGateway(scenePlan = {}) { const scene = composeSefirosScene(scenePlan); return { scene, legacySummary:sefirosToLegacyThreeSummary(scenePlan) }; }
