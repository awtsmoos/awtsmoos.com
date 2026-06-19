// B"H
import assert from "node:assert/strict";
import { compileMovieProject } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/movie/MovieTimelineCompiler.js";
import { MovieDirectorRuntime } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/movie/MovieDirectorRuntime.js";
import { MITZVAH_MOVIE_PROJECT } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/movie/MitzvahMovieProject.js";

const project = compileMovieProject(MITZVAH_MOVIE_PROJECT);
assert.equal(project.id, "mitzvah_world_universal_movie_generator");
assert.equal(project.report.scenes, 6);
assert.ok(project.report.camera >= 20);
assert.ok(project.report.dialogue >= 6);
assert.ok(project.report.actions >= 4);

const holder = { camera:{ position:{ x:0, y:0, z:0, set(x,y,z){ this.x=x; this.y=y; this.z=z; } }, lookAt(){} } };
const runtime = new MovieDirectorRuntime(holder, MITZVAH_MOVIE_PROJECT);
const preview = runtime.preview("rebbe_first_question");
assert.equal(preview.ok, true);
assert.equal(preview.scene.kind, "dialogue");
assert.ok(preview.firstPose.pos.y > 0);

const adhoc = runtime.generateScene({
  id:"instant_scene",
  kind:"battle",
  durationSec:12,
  actors:[{ id:"player" }, { id:"fox" }],
  beats:[{ id:"strike", at:4, actor:"fox", action:"lunge", text:"The field suddenly moves." }]
});
assert.equal(adhoc.kind, "battle");
assert.ok(adhoc.report.camera >= 4);
assert.equal(adhoc.report.dialogue, 1);
assert.equal(adhoc.report.actions, 1);

console.log(JSON.stringify({ ok:true, project:project.report, preview:preview.scene.id, adhoc:adhoc.report }, null, 2));
