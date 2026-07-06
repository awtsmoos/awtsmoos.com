// B"H
import assert from "node:assert/strict";
import { canonicalizeWorkerDependencyUrl, WORKER_BOOT_IMPORT_SEAL } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/entry/WorkerBootImports.js?case-test";
assert.equal(WORKER_BOOT_IMPORT_SEAL, "case-correct-olam-import-20260706-bh2");
assert.equal(canonicalizeWorkerDependencyUrl("/games/mitzvahWorld/ckidsAwtsmoos/olam/oyved/core/boot/OlamDynamicBoot.js?x=1"), "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/boot/OlamDynamicBoot.js?x=1");
assert.equal(canonicalizeWorkerDependencyUrl("/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/boot/OlamDynamicBoot.js?x=1"), "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/boot/OlamDynamicBoot.js?x=1");
console.log("B'H mitzvahWorld.workerBootImportCase.smoke passed", { seal:WORKER_BOOT_IMPORT_SEAL });
