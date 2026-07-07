// B"H
import assert from "node:assert/strict";
import {
  canonicalizeOlamPathname,
  canonicalizeOlamUrl,
  resolveModuleRecord
} from "../../ckidsAwtsmoos/Olam/oyved/core/boot/ModuleUrlResolver.js";

const lowercasePath = "/games/mitzvahWorld/ckidsAwtsmoos/olam/core/OlamVessel.js";
assert.equal(
  canonicalizeOlamPathname(lowercasePath),
  "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js"
);

const url = "http://localhost:8080/games/mitzvahWorld/ckidsAwtsmoos/olam/core/OlamVessel.js?v=x#hash";
assert.equal(
  canonicalizeOlamUrl(url),
  "http://localhost:8080/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js?v=x#hash"
);

const record = resolveModuleRecord({
  key: "olamCore",
  label: "Olam core direct vessel",
  relativePath: "../../../core/OlamVessel.js?v=test",
  expectedEnd: "/games/mitzvahWorld/ckidsAwtsmoos/olam/core/OlamVessel.js",
  requiredExport: "default"
});
assert.match(record.url, /\/ckidsAwtsmoos\/Olam\/core\/OlamVessel\.js\?v=test$/);
assert.equal(record.expectedEnd, "/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js");
assert.equal(record.caseCanonicalized, true);
assert(!record.url.includes("/ckidsAwtsmoos/olam/"));

console.log(JSON.stringify({ ok: true, test: "olamUrlCanonicalizationAudit", url: record.url }, null, 2));
