// B"H
import { generateProceduralMovie } from "./ProceduralMovieGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { directGameplayEvents } from "../platform/DirectorAiEngine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function directMovie(prompt = "mitzvah story", events = []) {
  const movie = generateProceduralMovie({ theme:prompt });
  return { ...movie, director:directGameplayEvents(events.length ? events : movie.shots.map(shot => ({ kind:shot.shot === "overShoulder" ? "dialogue" : shot.shot === "action" ? "combat" : "discovery", target:shot.actor || shot.label, duration:shot.duration })), { prompt }) };
}
export default { directMovie };
