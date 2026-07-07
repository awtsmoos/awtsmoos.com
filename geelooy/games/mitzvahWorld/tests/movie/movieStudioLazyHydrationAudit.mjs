// B"H
import assert from "node:assert/strict";
import { createMovieMakerState, exerciseMovieMaker, hydrateMovieStudioPanel } from "../../ckidsAwtsmoos/studio/movie/MovieMakerApp.js";
import { generateProceduralMovie } from "../../ckidsAwtsmoos/studio/movie/ProceduralMovieGenerator.js";
import { movieActionNames } from "../../ckidsAwtsmoos/studio/movie/MovieActionCatalog.js";

const state = createMovieMakerState();
assert.deepEqual([...state.hydratedPanels], ["timeline", "inspector"], "movie studio must start with minimal hydrated panels");
assert(state.availableActions.includes("singNiggun") && state.availableActions.includes("customStaffSpecial"), "custom and singing-school actions must be selectable");
assert.equal(hydrateMovieStudioPanel(state, "preview").ok, true, "preview panel must hydrate lazily");
assert([...state.hydratedPanels].includes("preview"), "preview hydration must be recorded");

const generated = generateProceduralMovie({ duration:30 });
assert(generated.scene.characters.length >= 4, "default movie must include multiple chossid.glb humans with varied clothes");
assert(generated.scene.singingSchool?.actions.includes("singNiggun"), "default movie must include singing school actions");
assert(generated.proceduralDirector.cameraCalls.length >= 8, "default movie must include multiple camera angles");
assert(generated.proceduralDirector.actionsPlayed.includes("walkAndTalk"), "default movie must include walking and talking action");
assert(generated.proceduralDirector.actionsPlayed.includes("customStaffSpecial"), "default movie must include custom staff special");
assert(movieActionNames().includes("customSwordSpecial") && movieActionNames().includes("customBowSpecial"), "custom sword/staff/bow specials must be in picker");

const exercised = exerciseMovieMaker(state);
assert(exercised.job.summary.customActions.includes("studentHarmony"), "AI JSON custom actions must survive import and encode");
assert([...state.hydratedPanels].includes("renderQueue"), "encoding must lazily hydrate render queue");
console.log(JSON.stringify({ ok:true, audit:"movieStudioLazyHydrationAudit", hydrated:[...state.hydratedPanels], cameraCalls:generated.proceduralDirector.cameraCalls }, null, 2));
