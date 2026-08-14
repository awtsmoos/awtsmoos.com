// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/** Candidate proof must precede the first predecessor displacement. */
const root = path.resolve(import.meta.dirname, "..");
const activation = fs.readFileSync(path.join(root, "unix-activation.sh"), "utf8");
const promotion = fs.readFileSync(
	path.join(root, "unix-activation-promotion.sh"),
	"utf8"
);
const update = activation.slice(
	activation.indexOf("activate_update()"),
	activation.indexOf("activate_release_candidate()")
);
assert.match(update, /prove_candidate_before_promotion/);
assert.match(update, /promote_candidate_root/);
assert.ok(
	update.indexOf("prove_candidate_before_promotion") <
	update.indexOf("promote_candidate_root")
);
assert.doesNotMatch(update, /mv "\$ROOT"/);
assert.match(promotion, /promote_candidate_root\(\)/);
assert.match(promotion, /stop_candidate_probe[\s\S]*stop_existing_runtime/);
assert.match(promotion, /mv "\$ROOT" "\$rollback"/);
assert.match(promotion, /restart_preserved_predecessor/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-activation-no-blocking-archive",
	proofBeforeDisplacement: true
}));
