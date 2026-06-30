// B"H
import { statsText } from '../engine/stats.js';
import { SEFIROT } from '../state.js';
import { drawMap } from './minimap.js';
import { renderOverlay } from './overlay.js';
import { renderToggles } from './toggles.js';

/** Paint the HUD and overlay from a single honest world state. */
export function renderUI(world, dom) {
  dom.spark.value = Math.min(1, world.score / world.level.target);
  dom.size.textContent = Math.round(world.player.r);
  dom.time.textContent = Math.max(0, Math.ceil(world.timeLeft));
  dom.sef.textContent = SEFIROT[world.sefirah][0];
  dom.combo.textContent = `x${world.player.combo.toFixed(1)}`;
  dom.best.textContent = world.save.best;
  dom.world.textContent = ` ${world.level.name}`;
  dom.msg.textContent = `${world.message}${statsText(world)}`;
  renderOverlay(world, dom);
  renderToggles(world, dom);
  drawMap(dom.map, world);
}
