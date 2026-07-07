// B"H
import assert from "node:assert/strict";
import example from "../../ckidsAwtsmoos/studio/schema/examples/aiVideoCompleteExample.json" with { type:"json" };
import { createEncodingJob, exportAiVideoCutscene, timelineFromAiVideo } from "../../ckidsAwtsmoos/studio/movie/AiVideoJsonBridge.js";

const built = timelineFromAiVideo(example);
assert.equal(built.ok, true);
assert.equal(built.summary.durationSec, 18);
assert.equal(built.summary.counts.camera, 4);
assert.equal(built.summary.counts.actor, 4);
assert.equal(built.summary.counts.dialogue, 2);
assert.equal(built.summary.counts.subtitle, 2);
assert.equal(built.summary.counts.audio, 1);
assert.equal(built.summary.counts.effect, 1);

const exported = exportAiVideoCutscene(example);
assert.equal(exported.cutscene.schema, "mitzvah-cutscene-v1");
assert.equal(exported.cutscene.runtime.playable, true);

const job = createEncodingJob(example, { fps:24, size:[1280, 720] });
assert.equal(job.status, "queued");
assert.equal(job.summary.clips, 14);
console.log(JSON.stringify({ ok:true, test:"aiVideoJsonBridge", summary:job.summary }, null, 2));
