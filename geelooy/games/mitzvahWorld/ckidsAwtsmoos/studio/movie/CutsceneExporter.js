// B"H
import { createTimeline } from "./Timeline.js";

export function exportCutscene(project = {}) {
  const timeline = createTimeline(project.timeline || project);
  return {
    schema:"mitzvah-cutscene-v1",
    id:project.id || timeline.id,
    name:project.name || "Cutscene",
    timeline,
    runtime:{ playable:true, exportedAt:new Date().toISOString() }
  };
}

export function importCutscene(json) {
  const data = typeof json === "string" ? JSON.parse(json) : json;
  return { ok:true, cutscene:exportCutscene(data) };
}

export function playCutscenePreview(cutscene, sink = {}) {
  sink.lastCutscene = cutscene;
  sink.played = true;
  return { ok:true, cutsceneId:cutscene?.id, trackCount:cutscene?.timeline?.tracks?.length || 0 };
}

export default { exportCutscene, importCutscene, playCutscenePreview };
