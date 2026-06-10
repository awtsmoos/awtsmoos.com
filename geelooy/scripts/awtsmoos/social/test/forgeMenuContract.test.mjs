// B"H
/**
 * Chapter 4 test: the forge button must create actual Heichelos.
 *
 * This static contract guards the profile/social forge path. The menu may sing
 * poetically, but it must still call the real social API, detect alias context,
 * generate ids, and fix the old inverted dropdown toggle.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("geelooy/scripts/awtsmoos/social/addNewBtn.js", "utf8");

assert.match(source, /function activeAlias\(\)/, "active alias detector must exist");
assert.match(source, /function generateHeichelId\(heichelName\)/, "server id generator must exist");
assert.match(source, /function submitHeichel\(data, aliasId\)/, "real submit function must exist");
assert.match(source, /\/api\/social\/alias\/\$\{encodeURIComponent\(aliasId\)\}\/heichelos/, "must call alias heichel creation endpoint");
assert.match(source, /new URLSearchParams\(\{[\s\S]*aliasId/, "submit must send aliasId in form body");
assert.match(source, /if \(drop\.isVisible\(\)\) drop\.hide\(\);\s*else drop\.show\(\);/, "dropdown toggle must not be inverted");
assert.doesNotMatch(source, /await new Promise\(resolve => setTimeout/, "forge must not fake API latency");
assert.doesNotMatch(source, /has been successfully manifested into existence/, "forge must not pretend success without API");

console.log('B"H forgeMenuContract.test passed');
