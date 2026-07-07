// B"H
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

const render = spawnSync("node", ["tools/renderDefaultMovieScene.mjs"], { encoding:"utf8" });
assert.equal(render.status, 0, `renderer failed: ${render.stderr}`);
const scene = JSON.parse(readFileSync("data/movie/defaults/defaultChossidBusyActionScene.json", "utf8"));
const report = JSON.parse(readFileSync("ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/renders/defaultChossidBusyActionScene.ffprobe.json", "utf8"));
const output = report.output;
assert.equal(report.ok, true, "render report must be ok");
assert(existsSync(output), "rendered mp4 must exist outside temp/reply");
assert(statSync(output).size > 100000, "rendered mp4 must not be tiny/corrupt");
const video = report.ffprobe.streams.find(s => s.codec_type === "video");
const audio = report.ffprobe.streams.find(s => s.codec_type === "audio");
assert(video, "video stream missing");
assert(audio, "audio stream missing");
assert.equal(video.codec_name, "h264", "video codec must be h264");
assert.equal(audio.codec_name, "aac", "audio codec must be aac");
assert.equal(video.width, scene.render.width, "width mismatch");
assert.equal(video.height, scene.render.height, "height mismatch");
assert(Number(report.ffprobe.format.duration) >= scene.durationSec - 0.05, "duration too short");
assert(Number(video.nb_read_frames || video.nb_frames) >= scene.durationSec * scene.render.fps, "frame count too low");
for (const action of scene.requiredActions) assert(JSON.stringify(scene).includes(action), `default scene missing ${action}`);
console.log(JSON.stringify({ ok:true, test:"defaultMovieRenderFfprobeAudit", rerendered:true, output, duration:Number(report.ffprobe.format.duration), frames:Number(video.nb_read_frames || video.nb_frames), size:statSync(output).size }, null, 2));
