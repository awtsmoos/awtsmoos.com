// B"H
import { normalizeTransform } from "./ManualTransformControls.js";
import { manualLockState } from "./ManualLocking.js";
import { manualGroupOf } from "./ManualGrouping.js";
export function applyManualOverride(command = {}, source = {}) { const manual = source.manual || command.manual || {}; return { ...command, manual:{ ...manual, transform:normalizeTransform(manual), lock:manualLockState(manual) }, group:manualGroupOf({ ...source, manual }) }; }
