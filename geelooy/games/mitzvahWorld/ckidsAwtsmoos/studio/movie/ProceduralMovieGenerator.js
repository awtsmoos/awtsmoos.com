// B"H
import { createTimeline, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";

export function generateProceduralMovie(options = {}) {
  const duration = Math.max(10, Number(options.duration || 30));
  const actors = options.actors || ["player", "rebbe", "fox"];
  const timeline = createTimeline({ id:`movie_${Date.now().toString(36)}`, duration });
  const camera = addTimelineClip(timeline, "camera", { label:"Opening wide shot", start:0, duration:duration * .28, payload:{ shot:"wide", location:options.location || "village" } });
  addTimelineKeyframe(timeline, camera.id, { time:0, value:{ position:[0, 5, 8], lookAt:[0, 1, 0] } });
  addTimelineKeyframe(timeline, camera.id, { time:camera.duration, value:{ position:[4, 3, 5], lookAt:[1, 1, 0] } });
  actors.forEach((actor, index) => addTimelineClip(timeline, "actor", { label:`Actor ${actor}`, start:index, duration:duration - index, payload:{ actor, action:index ? "enter" : "idle" } }));
  addTimelineClip(timeline, "dialogue", { label:"Dialogue", start:3, duration:5, payload:{ speaker:actors[1] || actors[0], text:"A placeholder line belongs here." } });
  addTimelineClip(timeline, "subtitle", { label:"Subtitle", start:3, duration:5, payload:{ text:"A placeholder line belongs here." } });
  addTimelineClip(timeline, "audio", { label:"Music placeholder", start:0, duration, payload:{ sound:"gentle_theme_placeholder" } });
  return { ok:true, theme:options.theme || "mitzvah", timeline };
}

export default { generateProceduralMovie };
