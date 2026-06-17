// B"H
import { normalizeInputTuning, applyAxisTuning } from "../settings/InputTuning.js";
const tuning = normalizeInputTuning({ sensitivity:2, deadzone:12 });
const axis = applyAxisTuning(1, -1, tuning);
console.log(JSON.stringify({ tuning, axis }, null, 2));
