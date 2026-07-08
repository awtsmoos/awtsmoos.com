// B"H
import { renderPacket } from "./SefirosRenderPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function composeSefirosScene(plan = {}) { return renderPacket("scene", { id:plan.id || "sefiros_scene", packets:plan.sefiros?.items || plan.items || [] }); }
