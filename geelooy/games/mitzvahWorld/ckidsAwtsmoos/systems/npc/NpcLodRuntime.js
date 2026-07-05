// B"H
/** @file NpcLodRuntime.js @description Throttled NPC visual LOD ticker. */
import { applyNpcVisualLod } from "./NpcVisualLod.js?v=deferred-npc-glb-20260705-bh1";
import { collectNpcLodDiagnostics } from "./NpcLodDiagnostics.js?v=deferred-npc-glb-20260705-bh1";

function list(olam) {
  return (olam?.interactableNivrayim || []).filter(n => ["customNpc", "medabeir", "interactiveNpc"].includes(n?.type));
}

export function installNpcLodRuntime(olam) {
  if (!olam || olam.__npcLodRuntimeTicker) return olam?.__npcLodRuntimeTicker || null;
  const ticker = {
    name:"npc_visual_lod_runtime",
    type:"npcLodRuntime",
    isReady:true,
    heesHawveh:true,
    acc:0,
    cursor:0,
    heesHawvoos(dt = 1 / 60) {
      this.acc += Math.min(.08, Number(dt) || 1 / 60);
      if (this.acc < .32) return;
      this.acc = 0;
      const npcs = list(olam);
      if (!npcs.length) return;
      const budget = Math.min(3, npcs.length);
      for (let i = 0; i < budget; i++) {
        applyNpcVisualLod(npcs[(this.cursor + i) % npcs.length], olam);
      }
      this.cursor = (this.cursor + budget) % npcs.length;
      collectNpcLodDiagnostics(olam);
    }
  };
  list(olam).forEach(npc => applyNpcVisualLod(npc, olam, true));
  collectNpcLodDiagnostics(olam);
  olam.__npcLodRuntimeTicker = ticker;
  if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker);
  return ticker;
}

export default installNpcLodRuntime;
