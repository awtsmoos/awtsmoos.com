// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
export function composeSefirosScene(plan = {}) { return renderPacket("scene", { id:plan.id || "sefiros_scene", packets:plan.sefiros?.items || plan.items || [] }); }
