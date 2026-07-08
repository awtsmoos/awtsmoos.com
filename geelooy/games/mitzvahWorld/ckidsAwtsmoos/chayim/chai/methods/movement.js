// B"H
/**
 * @file movement.js
 * @description Animation name resolution must never return null for idle/walk/run.
 */
import Utils from "../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const DEFAULT_ROLE = Object.freeze({ idle:"idle", stand:"stand", run:"run", walk:"walk", jump:"jump", falling:"falling", "left turn":"left turn", "right turn":"right turn" });
function resolveEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") return entry;
  if (typeof entry === "function") return entry();
  if (typeof entry !== "object") return null;
  const ran = Math.random(); let sum = 0, found = null;
  Object.entries(entry).forEach(([key, value]) => { if (found !== null) return; if (typeof value === "number" && value <= 1) sum += value; if (ran <= sum) found = key; });
  return found;
}
function isRunMode(entity) {
  if (entity?.olam?.runMode === "run") return true;
  if (entity?.olam?.runMode === "walk") return false;
  if (entity?.olam?.inputs && Object.prototype.hasOwnProperty.call(entity.olam.inputs, "RUNNING")) return entity.olam.inputs.RUNNING === true;
  return entity?.moving?.running === true;
}
function gaitAwareKey(entity, nm) { if (nm !== "run" && nm !== "walk") return nm; return isRunMode(entity) ? "run" : "walk"; }
export default {
  resetMoving() { Object.keys(this.moving).forEach(q => { this.moving[q] = false; }); },
  getChaweeyoos(nm) {
    const role = gaitAwareKey(this, nm || "idle"), primary = resolveEntry(this.chaweeyoosMap?.[role]);
    if (primary) return primary;
    if (role !== nm) { const fallbackMapped = resolveEntry(this.chaweeyoosMap?.[nm]); if (fallbackMapped) return fallbackMapped; }
    return DEFAULT_ROLE[role] || DEFAULT_ROLE[nm] || role || nm || "idle";
  },
  getModelVector() { return Utils.getForwardVector(this.modelMesh, this.currentModelVector); },
  getForwardVector() { return Utils.getForwardVector(this.nonRotatingEmptyForMovement, this.worldDirectionVector); }
};
