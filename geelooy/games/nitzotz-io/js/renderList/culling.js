// B"H
import { quality } from '../performance.js';
import { renderSettings } from './settings.js';

/** B"H: The crowded world is filtered by distance, danger, and frame-breath. */
export function visibleObjects(world) {
  const cfg = renderSettings(world.save.perf, quality(world));
  const player = world.player;
  const camera = world.camera;
  return world.level.objects
    .filter(object => keepObject(object, player, camera, cfg))
    .map(object => scoreObject(object, player))
    .sort((a, b) => a.score - b.score)
    .slice(0, cfg.maxObjects)
    .map(entry => entry.object);
}

function keepObject(object, player, camera, cfg) {
  if (object.taken) return false;
  const dPlayer = Math.hypot(object.x - player.x, object.y - player.y);
  if (dPlayer > cfg.drawDistance + object.r * 2) return false;
  const dCamera = Math.hypot(object.x - camera.x, object.y - camera.y);
  const nearCut = cfg.cameraCut + Math.max(object.sx, object.sz) * 0.35;
  return dCamera > nearCut;
}

function scoreObject(object, player) {
  const distance = Math.hypot(object.x - player.x, object.y - player.y);
  const edible = object.r < player.r * 1.2 ? -180 : 0;
  const landmark = object.sparks > 250 ? -80 : 0;
  return { object, score: distance + object.r * 1.5 + edible + landmark };
}
