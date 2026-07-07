// B"H
import { createTimeline, addTrack, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";
import { generateProceduralMovie } from "./ProceduralMovieGenerator.js";
import { exportCutscene, playCutscenePreview } from "./CutsceneExporter.js";
import { directGameplayEvents } from "../platform/DirectorAiEngine.js";
import { createEncodingJob, exportAiVideoCutscene } from "./AiVideoJsonBridge.js";

const SAMPLE_AI_VIDEO = { id:"ai_sample_shlichus_video", video:{ id:"sample_shlichus_video", title:"A Shlichus Awakens", durationSec:18, shots:[{ shot:"wide", subject:"village", start:0, duration:4, position:[0,5,9], lookAt:[0,1,0] }, { shot:"dialog", actor:"rebbe", action:"talkHands", start:4, duration:5, position:[1,2,4], lookAt:[0,1,0] }, { shot:"action", actor:"chossid", action:"castStorm", start:9, duration:5, position:[-2,2.4,4], lookAt:[2,1,3] }, { shot:"crane", subject:"synagogue", start:14, duration:4, position:[0,7,10], lookAt:[0,1,0] }], dialogue:[{ speaker:"rebbe", start:4.2, duration:4, text:"Every mitzvah opens a gate of light." }, { speaker:"chossid", start:10, duration:3, text:"Then let the village become alive." }], audio:[{ label:"Village niggun", start:0, duration:18, sound:"soft_niggun" }] } };

export function createMovieMakerState() {
  const timeline = createTimeline({ duration:30 });
  ["camera", "actor", "dialogue", "subtitle", "audio"].forEach(kind => addTrack(timeline, kind, kind));
  return { timeline, playing:false, selectedClipId:null, exported:null, director:null, aiVideoJson:JSON.stringify(SAMPLE_AI_VIDEO, null, 2), encodingJobs:[], bins:["project", "media", "scene", "character", "animal", "action", "dialogue", "quest", "shot", "audio", "effects"], panels:["timeline", "inspector", "curveEditor", "preview", "renderQueue", "storyboard", "script", "directorView", "cameraGraph", "aiJson"] };
}

export function exerciseMovieMaker(state = createMovieMakerState()) {
  const camera = addTimelineClip(state.timeline, "camera", { label:"Camera shot", start:0, duration:4, payload:{ shot:"medium" } });
  addTimelineClip(state.timeline, "actor", { label:"Player enters", start:1, duration:6, payload:{ actor:"player" } });
  addTimelineClip(state.timeline, "dialogue", { label:"Dialogue", start:2, duration:3, payload:{ speaker:"guide", text:"Welcome." } });
  addTimelineClip(state.timeline, "subtitle", { label:"Subtitle", start:2, duration:3, payload:{ text:"Welcome." } });
  addTimelineKeyframe(state.timeline, camera.id, { time:0, value:{ position:[0, 3, 6] } });
  const generated = generateProceduralMovie({ theme:"quest", actors:["player", "guide"], duration:18 });
  state.director = directGameplayEvents([{ kind:"discovery", target:"village" }, { kind:"dialogue", target:"guide", duration:4 }, { kind:"quest", target:"clear_path" }, { kind:"combat", target:"fox_pack" }], { prompt:"Make this scene more emotional." });
  state.exported = exportCutscene({ id:"studio_cutscene", timeline:state.timeline });
  const ai = importAiVideoJson(state, state.aiVideoJson), job = startEncodingJob(state);
  const played = playCutscenePreview(state.exported, state);
  return { state, generated, ai, job, played };
}

export function importAiVideoJson(state, json = state.aiVideoJson) {
  state.aiVideoJson = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  const built = exportAiVideoCutscene(json);
  state.timeline = built.timeline;
  state.exported = built.cutscene;
  state.aiVideoSummary = built.summary;
  return built;
}

export function startEncodingJob(state, options = {}) {
  const job = createEncodingJob(state.aiVideoJson, options);
  state.encodingJobs.unshift(job);
  state.encodingJobs = state.encodingJobs.slice(0, 12);
  return job;
}

function html() {
  return `<main class="studio-shell movie-maker" data-app="movie-maker"><header><a href="./">PLAY WORLD</a><a href="./studio.html">WORLD STUDIO</a><strong>MOVIE MAKER</strong></header><section class="workspace"><aside><button data-action="generate">Generate Movie</button><button data-action="import-ai-json">Import AI JSON</button><button data-action="encode">Start Encoding Job</button><button data-action="export">Export Cutscene</button><button data-action="play">Play Preview</button><textarea data-role="ai-json" rows="18"></textarea></aside><div class="timeline" data-role="timeline"></div><aside class="inspector"><h2>Inspector</h2><div data-role="status"></div><pre data-role="queue"></pre></aside></section></main>`;
}

export function mountMovieMakerApp(root = document.body) {
  const state = createMovieMakerState();
  root.innerHTML = html();
  const timelineEl = root.querySelector("[data-role='timeline']"), statusEl = root.querySelector("[data-role='status']"), jsonEl = root.querySelector("[data-role='ai-json']"), queueEl = root.querySelector("[data-role='queue']");
  jsonEl.value = state.aiVideoJson;
  const render = () => { timelineEl.innerHTML = state.timeline.tracks.map(track => `<div class="track"><b>${track.label}</b>${track.clips.map(clip => `<span class="clip" style="left:${clip.start * 18}px;width:${clip.duration * 18}px">${clip.label}</span>`).join("")}</div>`).join(""); statusEl.textContent = `${state.timeline.tracks.length} tracks, ${state.timeline.tracks.reduce((sum, track) => sum + track.clips.length, 0)} clips, ${state.bins.length} bins, ${state.panels.length} panels`; queueEl.textContent = JSON.stringify({ aiVideo:state.aiVideoSummary || null, encodingJobs:state.encodingJobs.map(j => ({ id:j.id, status:j.status, clips:j.summary.clips })) }, null, 2); };
  root.addEventListener("click", event => { const action = event.target?.dataset?.action; if (action === "generate") state.timeline = generateProceduralMovie({}).timeline; if (action === "import-ai-json") importAiVideoJson(state, jsonEl.value); if (action === "encode") startEncodingJob(state); if (action === "export") state.exported = exportCutscene({ id:"manual_cutscene", timeline:state.timeline }); if (action === "play") playCutscenePreview(state.exported || exportCutscene({ timeline:state.timeline }), state); render(); });
  render();
  globalThis.__MITZVAH_MOVIE_MAKER__ = { state, exercise:() => exerciseMovieMaker(state), importAiVideoJson:json => importAiVideoJson(state, json), startEncodingJob:options => startEncodingJob(state, options), sampleAiVideo:SAMPLE_AI_VIDEO };
  return globalThis.__MITZVAH_MOVIE_MAKER__;
}

export default { createMovieMakerState, exerciseMovieMaker, importAiVideoJson, startEncodingJob, mountMovieMakerApp };
