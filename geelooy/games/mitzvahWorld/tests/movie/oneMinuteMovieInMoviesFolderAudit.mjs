// B"H
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

const scenePath = "data/movie/defaults/defaultChossidBusyActionScene60s.json";
const scene = JSON.parse(readFileSync(scenePath, "utf8"));
const output = `movies/${scene.outputName}`;
if (!existsSync(output) || statSync(output).size < 1000000) {
  const render = spawnSync("node", ["tools/renderDefaultMovieScene.mjs", `--scene=${scenePath}`, `--out=${output}`, "--noLegacyReport=true"], { encoding:"utf8" });
  assert.equal(render.status, 0, `one-minute renderer failed: ${render.stderr}`);
}
assert(existsSync(output), "one-minute movie must exist in movies folder");
assert(statSync(output).size > 1000000, "one-minute movie must not be tiny/corrupt");
const probe = spawnSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-count_frames", "-print_format", "json", output], { encoding:"utf8" });
assert.equal(probe.status, 0, `ffprobe failed: ${probe.stderr}`);
const report = JSON.parse(probe.stdout);
const video = report.streams.find(s => s.codec_type === "video");
const audio = report.streams.find(s => s.codec_type === "audio");
assert(video, "video stream missing");
assert(audio, "audio stream missing");
assert.equal(video.codec_name, "h264", "video codec must be h264");
assert.equal(audio.codec_name, "aac", "audio codec must be aac");
assert.equal(video.width, scene.render.width, "width mismatch");
assert.equal(video.height, scene.render.height, "height mismatch");
assert(Number(report.format.duration) >= 59.9, "movie must be a real one-minute render");
assert(Number(video.nb_read_frames || video.nb_frames) >= 1800, "one-minute movie must have 1800 frames at 30fps");
console.log(JSON.stringify({ ok:true, test:"oneMinuteMovieInMoviesFolderAudit", output, duration:Number(report.format.duration), frames:Number(video.nb_read_frames || video.nb_frames), size:statSync(output).size }, null, 2));
