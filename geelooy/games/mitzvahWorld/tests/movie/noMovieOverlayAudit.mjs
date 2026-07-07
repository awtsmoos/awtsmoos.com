// B"H
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
const forbidden = ["MovieCaptureDirectorOverlay", "awts-movie-capture-director-overlay", "CHOSSID.GLB CINEMATIC", "__MITZVAH_MOVIE_CAPTURE_DIRECTOR__"];
const grep = execSync(`grep -R "${forbidden.join("\\|")}" -n . --exclude-dir=node_modules --exclude-dir=.git || true`, { encoding:"utf8" });
const live = grep.split("\n").filter(line => line && !line.includes("33_delete_2d_overlay") && !line.includes("noMovieOverlayAudit"));
assert.deepEqual(live, [], `overlay references remain:\n${live.join("\n")}`);
assert(!existsSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/MovieCaptureDirectorOverlay.js"), "overlay file must be gone");
assert(!readFileSync("index.js", "utf8").includes("installMovieCaptureDirectorOverlay"), "index must not install overlay");
console.log(JSON.stringify({ ok:true, test:"noMovieOverlayAudit" }, null, 2));
