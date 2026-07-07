// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const index = readFileSync("index.js", "utf8");
assert(index.includes("installRealismRuntimeContract"), "index must import realism runtime contract");
assert(index.includes("realism-runtime-20260707"), "index must cache-bust realism runtime import");
assert(index.includes("installRealismRuntimeContract(window)"), "index must install realism runtime at boot");
console.log(JSON.stringify({ ok:true, test:"bootRealismRuntimeWiringAudit" }, null, 2));
