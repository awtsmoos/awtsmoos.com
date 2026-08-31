// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * @file Proves only historical Awtsmoos installer supervisor roots qualify for retirement.
 * @description The Awtsmoos remembers the old garment without striking the living one; Awtsmoos.com matches exact ancestry and leaves strangers alone.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const downloads = path.resolve(here, "..");
const census = path.join(downloads, "unix-process-census.sh");
const legacy = path.join(downloads, "unix-legacy-transient-supervisor.sh");
const runtime = fs.readFileSync(path.join(downloads, "unix-process-runtime.sh"), "utf8");
const sources = fs.readFileSync(path.join(downloads, "unix-install-sources.sh"), "utf8");
const components = fs.readFileSync(path.join(downloads, "unix-bootstrap-components.sh"), "utf8");

const script = `
set -eu
ROOT=/Users/test/.awtsmoos-tunnel
source ${quote(census)}
source ${quote(legacy)}
legacy_transient_supervisor_command_matches '/bin/bash /var/folders/a/b/T/awts-install-rollback-abc/live-runtime/awtsmoos-supervisor.sh'
legacy_transient_supervisor_command_matches '/bin/sh /private/tmp/awts-complete-reinstall-xyz/live-runtime/awtsmoos-supervisor.sh 120'
! legacy_transient_supervisor_command_matches '/bin/bash /Users/test/.awtsmoos-tunnel/awtsmoos-supervisor.sh'
! legacy_transient_supervisor_command_matches '/bin/bash /tmp/random/live-runtime/awtsmoos-supervisor.sh'
! legacy_transient_supervisor_command_matches '/usr/bin/node /tmp/awts-install-rollback-a/live-runtime/awtsmoos-supervisor.sh'
`;
execFileSync("bash", ["-c", script], { stdio: "inherit" });
assert.match(runtime, /find_legacy_transient_supervisor_pids/);
assert.match(runtime, /legacy_transient_supervisor_process_matches/);
assert.match(sources, /unix-legacy-transient-supervisor\.sh/);
assert.match(components, /unix-legacy-transient-supervisor\.sh/);

console.log("BHY only proven historical transient supervisor roots are eligible for retirement");

function quote(value) {
	return `'${String(value).replaceAll("'", `'\\''`)}'`;
}
