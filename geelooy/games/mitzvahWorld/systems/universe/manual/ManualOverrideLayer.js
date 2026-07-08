// B"H
import { normalizeTransform } from "./ManualTransformControls.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { manualLockState } from "./ManualLocking.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { manualGroupOf } from "./ManualGrouping.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function applyManualOverride(command = {}, source = {}) { const manual = source.manual || command.manual || {}; return { ...command, manual:{ ...manual, transform:normalizeTransform(manual), lock:manualLockState(manual) }, group:manualGroupOf({ ...source, manual }) }; }
