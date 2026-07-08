// B"H
import { sefirahBatch } from "./SefirahPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosScenePlan(id, packets = []) { return { id, kind:"sefiros_scene_plan", sefiros:sefirahBatch(packets), createdAt:new Date().toISOString() }; }
