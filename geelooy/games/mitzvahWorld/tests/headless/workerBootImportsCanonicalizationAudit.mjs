// B"H
import assert from "node:assert/strict";
import {
  WORKER_BOOT_IMPORT_SEAL,
  canonicalizeWorkerDependencyUrl,
  createWorkerDependencyImportUrl
} from "../../ckidsAwtsmoos/Olam/oyved/core/entry/WorkerBootImports.js";

const bad = "/games/mitzvahWorld/ckidsAwtsmoos/olam/oyved/core/boot/OlamDynamicBoot.js?compact=true";
const canonical = canonicalizeWorkerDependencyUrl(bad);
assert.equal(
  canonical,
  "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/boot/OlamDynamicBoot.js?compact=true"
);

const importUrl = createWorkerDependencyImportUrl(bad);
assert(importUrl.includes("/ckidsAwtsmoos/Olam/oyved/core/boot/OlamDynamicBoot.js"));
assert(!importUrl.includes("/ckidsAwtsmoos/olam/"));
assert(importUrl.includes(`awts=${WORKER_BOOT_IMPORT_SEAL}`));
assert(importUrl.indexOf("/ckidsAwtsmoos/Olam/") < importUrl.indexOf("awts="));

console.log(JSON.stringify({ ok: true, test: "workerBootImportsCanonicalizationAudit", importUrl }, null, 2));
