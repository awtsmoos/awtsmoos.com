// B"H
import assert from "node:assert/strict";
import { canonicalizeOlamUrl, resolveModuleRecord } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/boot/ModuleUrlResolver.js?v=case-correct-olam-import-20260706-bh1";
assert.equal(canonicalizeOlamUrl("https://awtsmoos.com/games/mitzvahWorld/ckidsAwtsmoos/olam/core/OlamVessel.js?x=1"), "https://awtsmoos.com/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js?x=1");
assert.equal(canonicalizeOlamUrl("https://awtsmoos.com/geelooy/games/mitzvahWorld/ckidsAwtsmoos/olam/oyved/core/boot/OlamDynamicBoot.js"), "https://awtsmoos.com/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core/boot/OlamDynamicBoot.js");
const resolved = resolveModuleRecord({ key:"olamCore", label:"Olam core", relativePath:"../../../core/OlamVessel.js?compact=true&v=test", expectedEnd:"/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js", requiredExport:"default" });
assert.ok(resolved.url.includes("/ckidsAwtsmoos/Olam/core/OlamVessel.js"));
assert.equal(resolved.url.includes("/ckidsAwtsmoos/olam/"), false);
console.log("B'H mitzvahWorld.olamImportCase.smoke passed", { url:resolved.url, caseCanonicalized:resolved.caseCanonicalized });
