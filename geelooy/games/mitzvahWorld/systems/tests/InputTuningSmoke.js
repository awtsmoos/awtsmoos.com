// B"H
import { normalizeInputTuning, applyAxisTuning } from "../settings/InputTuning.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const tuning = normalizeInputTuning({ sensitivity:2, deadzone:12 });
const axis = applyAxisTuning(1, -1, tuning);
console.log(JSON.stringify({ tuning, axis }, null, 2));
