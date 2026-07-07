// B"H
import { createTimeline, addTrack, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";
import { generateProceduralMovie } from "./ProceduralMovieGenerator.js";
import { exportCutscene, playCutscenePreview } from "./CutsceneExporter.js";
import { directGameplayEvents } from "../platform/DirectorAiEngine.js";
import { createEncodingJob, exportAiVideoCutscene } from "./AiVideoJsonBridge.js";
import { DEFAULT_CUSTOM_MOVIE_ACTIONS, actionPickerModel, movieActionNames } from "./MovieActionCatalog.js";

const SAMPLE_AI_VIDEO = { id:"ai_sample_shlichus_video", customActions:DEFAULT_CUSTOM_MOVIE_ACTIONS, video:{ id:"sample_shlichus_video", title:"A Shlichus Awakens", durationSec:26, customActions:[{ id:"studentHarmony", label:"Student Harmony", target:"singNiggun", school:"singing" }], characters:[{ id:"chossid", model:"chossid.glb", clothes:{ shirt:"white", coat:"brown", pants:"black" }, action:"walkAndTalk" }, { id:"student_blue", model:"chossid.glb", clothes:{ shirt:"blue", coat:"navy", pants:"gray" }, action:"studentHarmony" }], shots:[{ cameraCall:"ESTABLISHING_WIDE", shot:"wide", subject:"village", start:0, duration:4, lens:"24mm", position:[0,5,9], lookAt:[0,1,0] }, { cameraCall:"LOW_RUN", shot:"lowRun", actor:"chossid", action:"run_Armature", start:4, duration:4, lens:"28mm", position:[1,1.2,4], lookAt:[0,1,0] }, { cameraCall:"SINGING_SCHOOL", shot:"medium", actor:"student_blue", action:"studentHarmony", start:8, duration:4, lens:"45mm", position:[-1,1.4,4], lookAt:[0,1,0] }, { cameraCall:"ANIMAL_HERO", shot:"animalHero", actor:"goat_1", action:"graze", start:12, duration:4, lens:"70mm", position:[-.5,1.2,3], lookAt:[-2,.6,3] }, { cameraCall:"SPELL_ACTION", shot:"action", actor:"chossid", action:"customStaffSpecial", start:16, duration:5, lens:"35mm", position:[-2,2.4,4], lookAt:[2,1,3] }, { cameraCall:"CRANE_FINISH", shot:"crane", subject:"synagogue", start:21, duration:5, lens:"24mm", position:[0,7,10], lookAt:[0,1,0] }], animals:[{ id:"goat_1", species:"goat", action:"graze", duration:20, diet:"grass" }, { id:"fox_1", species:"fox", action:"prowl", duration:20, diet:"small-prey" }], dialogue:[{ speaker:"rebbe", start:5, duration:4, text:"Every built-in and custom action is selectable now.", bubble:true }], captions:[{ text:"EXTREME CAPTION: the village becomes light", start:1, duration:4, style:"neon-gold" }], speechBubbles:[{ actor:"chossid", text:"Walk, run, GLB clips, singing school, animal actions — all here.", start:9, duration:4 }], effects:[{ name:"holy_glow", start:16, duration:6 }], shaders:[{ name:"golden_bloom_shader", start:21, duration:5 }] } };

function baseTimeline() {
  const timeline = createTimeline({ duration:30 });
  ["camera", "actor", "dialogue", "subtitle", "audio", "effect", "caption", "bubble", "shader"].forEach(kind => addTrack(timeline, kind, kind));
  return timeline;
}

function actionCount(timeline) {
  return timeline.tracks.reduce((sum, track) => sum + track.clips.length, 0);
}

export function createMovieMakerState() {
  const customActions = [...DEFAULT_CUSTOM_MOVIE_ACTIONS, { id:"studentHarmony", label:"Student Harmony", target:"singNiggun", school:"singing" }];
  return { timeline:baseTimeline(), playing:false, selectedClipId:null, exported:null, director:null, customActions, aiVideoJson:JSON.stringify(SAMPLE_AI_VIDEO, null, 2), encodingJobs:[], hydratedPanels:new Set(["timeline", "inspector"]), actionPicker:actionPickerModel(customActions), availableActions:movieActionNames(customActions), bins:["project", "media", "scene", "character", "animal", "action", "dialogue", "quest", "shot", "audio", "effects"], panels:["timeline", "inspector", "curveEditor", "preview", "renderQueue", "storyboard", "script", "directorView", "cameraGraph", "aiJson", "actionPicker"] };
}

export function hydrateMovieStudioPanel(state, panel) {
  if (!state.panels.includes(panel)) return { ok:false, reason:"missing-panel", panel };
  state.hydratedPanels.add(panel);
  return { ok:true, panel, hydrated:[...state.hydratedPanels] };
}

export function exerciseMovieMaker(state = createMovieMakerState()) {
  const camera = addTimelineClip(state.timeline, "camera", { label:"Camera shot", start:0, duration:4, payload:{ shot:"medium", cameraCall:"EXERCISE_CAMERA" } });
  addTimelineClip(state.timeline, "actor", { label:"Player walks", start:1, duration:3, payload:{ actor:"player", action:"walk" } });
  addTimelineClip(state.timeline, "actor", { label:"Player sings", start:4, duration:3, payload:{ actor:"student_blue", action:"studentHarmony", customAction:true } });
  addTimelineClip(state.timeline, "dialogue", { label:"Bubble", start:2, duration:3, payload:{ speaker:"guide", text:"Welcome.", speechBubble:true } });
  addTimelineKeyframe(state.timeline, camera.id, { time:0, value:{ position:[0,3,6], lookAt:[0,1,0], call:"EXERCISE_CAMERA" } });
  const generated = generateProceduralMovie({ theme:"quest", duration:26, customActions:state.customActions });
  state.director = directGameplayEvents([{ kind:"discovery", target:"village" }, { kind:"dialogue", target:"guide", duration:4 }, { kind:"combat", target:"fox_pack" }], { prompt:"Make this scene more emotional." });
  const ai = importAiVideoJson(state, state.aiVideoJson), job = startEncodingJob(state);
  hydrateMovieStudioPanel(state, "preview");
  const played = playCutscenePreview(state.exported, state);
  return { state, generated, ai, job, played };
}

export function importAiVideoJson(state, json = state.aiVideoJson) {
  state.aiVideoJson = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  const built = exportAiVideoCutscene(state.aiVideoJson);
  state.timeline = built.timeline;
  state.exported = built.cutscene;
  state.aiVideoSummary = built.summary;
  state.customActions = built.customActions;
  state.actionPicker = built.actionPicker;
  state.availableActions = movieActionNames(state.customActions);
  return built;
}

export function startEncodingJob(state, options = {}) {
  const job = createEncodingJob(state.aiVideoJson, options);
  state.encodingJobs.unshift(job);
  state.encodingJobs = state.encodingJobs.slice(0, 12);
  hydrateMovieStudioPanel(state, "renderQueue");
  return job;
}

function html() {
  return `<main class="studio-shell movie-maker" data-app="movie-maker"><header><a href="./">PLAY WORLD</a><a href="./studio.html">WORLD STUDIO</a><strong>MOVIE MAKER</strong></header><section class="workspace"><aside><button data-action="generate">Generate Movie</button><button data-action="import-ai-json">Import AI JSON</button><button data-action="encode">ENCODE AS VIDEO</button><button data-action="export">Export Cutscene</button><button data-action="play">Play Preview</button><h3>All Actions</h3><select data-role="action-picker"></select><textarea data-role="ai-json" rows="18"></textarea></aside><div class="timeline" data-role="timeline"></div><aside class="inspector"><h2>Inspector</h2><div data-role="status"></div><pre data-role="queue"></pre></aside></section></main>`;
}

export function mountMovieMakerApp(root = document.body) {
  const state = createMovieMakerState();
  root.innerHTML = html();
  const timelineEl = root.querySelector("[data-role='timeline']"), statusEl = root.querySelector("[data-role='status']"), jsonEl = root.querySelector("[data-role='ai-json']"), queueEl = root.querySelector("[data-role='queue']"), actionEl = root.querySelector("[data-role='action-picker']");
  jsonEl.value = state.aiVideoJson;
  actionEl.innerHTML = state.availableActions.map(action => `<option value="${action}">${action}</option>`).join("");
  const render = () => {
    timelineEl.innerHTML = state.timeline.tracks.map(track => `<div class="track"><b>${track.label}</b>${track.clips.map(clip => `<span class="clip" style="left:${clip.start * 18}px;width:${clip.duration * 18}px">${clip.label}</span>`).join("")}</div>`).join("");
    statusEl.textContent = `${state.timeline.tracks.length} tracks, ${actionCount(state.timeline)} clips, ${state.actionPicker.total} actions, ${state.panels.length} panels, ${state.hydratedPanels.size} hydrated`;
    queueEl.textContent = JSON.stringify({ aiVideo:state.aiVideoSummary || null, hydratedPanels:[...state.hydratedPanels], encodingJobs:state.encodingJobs.map(job => ({ id:job.id, status:job.status, clips:job.summary.clips, cameraCalls:job.summary.cameraCalls })) }, null, 2);
  };
  root.addEventListener("click", event => {
    const action = event.target?.dataset?.action;
    if (action === "generate") { const generated = generateProceduralMovie({ customActions:state.customActions }); state.timeline = generated.timeline; state.aiVideoSummary = { cameraCalls:generated.proceduralDirector.cameraCalls, clips:actionCount(state.timeline), customActions:generated.proceduralDirector.customActions }; }
    if (action === "import-ai-json") importAiVideoJson(state, jsonEl.value);
    if (action === "encode") startEncodingJob(state);
    if (action === "export") state.exported = exportCutscene({ id:"manual_cutscene", timeline:state.timeline });
    if (action === "play") playCutscenePreview(state.exported || exportCutscene({ timeline:state.timeline }), state);
    render();
  });
  render();
  globalThis.__MITZVAH_MOVIE_MAKER__ = { state, exercise:() => exerciseMovieMaker(state), importAiVideoJson:json => importAiVideoJson(state, json), startEncodingJob:options => startEncodingJob(state, options), hydratePanel:panel => hydrateMovieStudioPanel(state, panel), actionPicker:state.actionPicker, sampleAiVideo:SAMPLE_AI_VIDEO };
  return globalThis.__MITZVAH_MOVIE_MAKER__;
}

export default { createMovieMakerState, exerciseMovieMaker, importAiVideoJson, startEncodingJob, hydrateMovieStudioPanel, mountMovieMakerApp };
