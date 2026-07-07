// B"H
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

const reportPath = "ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/real-engine-movie/realEngineMovieCapture.json";
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const output = report.output;
assert.equal(report.ok, true, "capture report must pass");
assert.equal(report.realEngineCapture, true, "must be real browser/game capture");
assert.equal(report.synthetic, false, "must not be synthetic ffmpeg/testsrc render");
assert.equal(report.directorOverlay, true, "must use visible director to avoid wall-only footage");
assert(report.playable?.director?.chossid && report.playable?.director?.hills && report.playable?.director?.houses, "director must prove chossid/hills/houses");
assert.equal(report.fatalConsoleOrNetwork, 0, "no fatal browser errors");
assert(existsSync(output), "output movie missing");
assert(statSync(output).size > 250000, "output too tiny");
const probe = spawnSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-count_frames", "-print_format", "json", output], { encoding:"utf8" });
assert.equal(probe.status, 0, probe.stderr);
const meta = JSON.parse(probe.stdout);
const video = meta.streams.find(s => s.codec_type === "video");
assert.equal(video.codec_name, "h264");
assert.equal(video.width, 1280);
assert.equal(video.height, 720);
assert(Number(video.nb_read_frames || video.nb_frames) >= report.frameCount, "frame count under captured frame count");
console.log(JSON.stringify({ ok:true, test:"realEngineDirectedMovieAudit", output, duration:Number(meta.format.duration), frames:Number(video.nb_read_frames || video.nb_frames), size:statSync(output).size }, null, 2));
