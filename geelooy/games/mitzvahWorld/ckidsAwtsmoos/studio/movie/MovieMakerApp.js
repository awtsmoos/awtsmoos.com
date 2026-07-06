// B"H
import { createTimeline, addTrack, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";
import { generateProceduralMovie } from "./ProceduralMovieGenerator.js";
import { exportCutscene, playCutscenePreview } from "./CutsceneExporter.js";

export function createMovieMakerState() {
  const timeline = createTimeline({ duration:30 });
  addTrack(timeline, "camera", "Camera");
  addTrack(timeline, "actor", "Actors");
  addTrack(timeline, "dialogue", "Dialogue");
  addTrack(timeline, "subtitle", "Subtitles");
  addTrack(timeline, "audio", "Audio");
  return { timeline, playing:false, selectedClipId:null, exported:null };
}

export function exerciseMovieMaker(state = createMovieMakerState()) {
  const camera = addTimelineClip(state.timeline, "camera", { label:"Camera shot", start:0, duration:4, payload:{ shot:"medium" } });
  addTimelineClip(state.timeline, "actor", { label:"Player enters", start:1, duration:6, payload:{ actor:"player" } });
  addTimelineClip(state.timeline, "dialogue", { label:"Dialogue", start:2, duration:3, payload:{ speaker:"guide", text:"Welcome." } });
  addTimelineClip(state.timeline, "subtitle", { label:"Subtitle", start:2, duration:3, payload:{ text:"Welcome." } });
  addTimelineKeyframe(state.timeline, camera.id, { time:0, value:{ position:[0, 3, 6] } });
  const generated = generateProceduralMovie({ theme:"quest", actors:["player", "guide"], duration:18 });
  state.exported = exportCutscene({ id:"studio_cutscene", timeline:state.timeline });
  const played = playCutscenePreview(state.exported, state);
  return { state, generated, played };
}

export function mountMovieMakerApp(root = document.body) {
  const state = createMovieMakerState();
  root.innerHTML = `<main class="studio-shell movie-maker" data-app="movie-maker"><header><a href="./">PLAY WORLD</a><a href="./studio.html">WORLD STUDIO</a><strong>MOVIE MAKER</strong></header><section class="workspace"><aside><button data-action="generate">Generate Movie</button><button data-action="export">Export Cutscene</button><button data-action="play">Play Preview</button></aside><div class="timeline" data-role="timeline"></div><aside class="inspector"><h2>Inspector</h2><div data-role="status"></div></aside></section></main>`;
  const timelineEl = root.querySelector("[data-role='timeline']");
  const statusEl = root.querySelector("[data-role='status']");
  const render = () => {
    timelineEl.innerHTML = state.timeline.tracks.map(track => `<div class="track"><b>${track.label}</b>${track.clips.map(clip => `<span class="clip" style="left:${clip.start * 18}px;width:${clip.duration * 18}px">${clip.label}</span>`).join("")}</div>`).join("");
    statusEl.textContent = `${state.timeline.tracks.length} tracks, ${state.timeline.tracks.reduce((sum, track) => sum + track.clips.length, 0)} clips`;
  };
  root.addEventListener("click", event => {
    const action = event.target?.dataset?.action;
    if (action === "generate") state.timeline = generateProceduralMovie({}).timeline;
    if (action === "export") state.exported = exportCutscene({ id:"manual_cutscene", timeline:state.timeline });
    if (action === "play") playCutscenePreview(state.exported || exportCutscene({ timeline:state.timeline }), state);
    render();
  });
  render();
  globalThis.__MITZVAH_MOVIE_MAKER__ = { state, exercise:() => exerciseMovieMaker(state) };
  return globalThis.__MITZVAH_MOVIE_MAKER__;
}

export default { createMovieMakerState, exerciseMovieMaker, mountMovieMakerApp };
