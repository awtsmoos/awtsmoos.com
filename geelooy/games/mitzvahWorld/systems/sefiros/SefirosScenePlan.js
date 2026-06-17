// B"H
import { sefirahBatch } from "./SefirahPacket.js";
export function sefirosScenePlan(id, packets = []) { return { id, kind:"sefiros_scene_plan", sefiros:sefirahBatch(packets), createdAt:new Date().toISOString() }; }
