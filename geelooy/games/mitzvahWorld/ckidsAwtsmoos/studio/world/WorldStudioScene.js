// B"H
import { activeScene } from "../core/StudioState.js";
export function sceneSummary(project) {
  const scene = activeScene(project);
  return { id:scene.id, objects:scene.objects.length, buildings:scene.buildings.length, doors:scene.doors.length, npcs:scene.npcs.length, animals:scene.animals.length };
}
export default { sceneSummary };
