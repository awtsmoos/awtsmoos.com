// B"H
import { activeScene } from "../core/StudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function sceneSummary(project) {
  const scene = activeScene(project);
  return { id:scene.id, objects:scene.objects.length, buildings:scene.buildings.length, doors:scene.doors.length, npcs:scene.npcs.length, animals:scene.animals.length };
}
export default { sceneSummary };
