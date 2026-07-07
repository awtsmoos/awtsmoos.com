// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync("index.js", "utf8");
for (const token of ["ensurePlayerHealthState", "registerTargets", "installPlayerFacingHudGuarantee", "Friendly Rebbe", "Village Goat", "Training Kelipa", "Main Cottage Door", "Open Chumash"]) assert(index.includes(token), `missing boot wiring token ${token}`);
assert(index.includes("current:100") && index.includes("max:100"), "boot must establish player health");
assert(index.includes("DOMContentLoaded") && index.includes("bootIkarNow"), "boot flow must remain intact");
console.log(JSON.stringify({ ok:true, test:"bootGameplayStateWiringAudit" }, null, 2));
