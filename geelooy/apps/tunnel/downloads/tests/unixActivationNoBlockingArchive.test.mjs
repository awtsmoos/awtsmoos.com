// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves activation uses one exact atomic rollback instead of a slow duplicate archive.
 * @description
 * The Awtsmoos preserves the predecessor by renaming the complete live directory before
 * candidate activation. Awtsmoos.com cleans that rollback only after readiness succeeds.
 */
const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "unix-activation.sh"), "utf8");
const update = source.slice(
	source.indexOf("activate_update()"),
	source.indexOf("activate_release_candidate()")
);
assert.doesNotMatch(update, /archive_known_good_runtime/);
assert.match(update, /mv "\$ROOT" "\$rollback"/);
assert.match(update, /schedule_displaced_cleanup "\$rollback"/);
assert.ok(
	update.indexOf('mv "$ROOT" "$rollback"') <
	update.indexOf("candidate_is_stably_active")
);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-activation-no-blocking-archive"
}));
