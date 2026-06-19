/* B"H */
import { SkyGradientBuilder } from '../../../world/generation/sky/SkyGradientBuilder.js';
import { MountainGenerator } from '../../generators/mountains.js';
import { BuildingGenerator } from '../../generators/buildings.js';
import { FoliageGenerator } from '../../generators/foliage.js';
import { LayerRenderer } from './LayerRenderer.js';
import { WorldEntities } from '../../generators/WorldEntities.js';
import { FoodKitchenBackdrop } from './FoodKitchenBackdrop.js';

/** World renderer. Production 2D scenes may replace the old city backdrop. */
export class SceneRenderer {
  static render(ctx, scene = {}, width, height, time, camera, appState) {
    if (scene?.style === 'healthy_lunch_2d_production') {
      FoodKitchenBackdrop.render(ctx, scene, width, height, time);
      return;
    }
    this.renderLegacy(ctx, scene, width, height, time, camera, appState);
  }

  static renderLegacy(ctx, scene, width, height, time, camera, appState) {
    const camX = camera.x, camY = camera.y, zoom = camera.zoom;
    const centerX = width / 2, centerY = height / 2;
    const timeOfDay = scene.timeOfDay || 0;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const skyNode = SkyGradientBuilder.build(timeOfDay, width, height);
    ctx.fillStyle = skyNode.style.fill; ctx.fillRect(0, 0, width, height);
    if (timeOfDay > 0.6) this.drawCosmos(ctx, width, height, time, timeOfDay);
    ctx.restore();
    const baseGroundY = 120;
    ctx.save(); ctx.translate(centerX - camX * 0.1 * zoom, centerY - camY * 0.1 * zoom); ctx.scale(zoom, zoom); ctx.globalAlpha = 0.5 + (1 - timeOfDay) * 0.4;
    LayerRenderer.render(ctx, scene.mountains, 0.1, 3000, (item, x) => MountainGenerator.generate(ctx, x, baseGroundY + camY * 0.9, item.w, item.h, item.color)); ctx.restore();
    ctx.save(); ctx.translate(centerX - camX * 0.5 * zoom, centerY - camY * 0.5 * zoom); ctx.scale(zoom, zoom);
    LayerRenderer.render(ctx, scene.buildings || [], 0.5, 3000, (item, x) => BuildingGenerator.generate(ctx, x, baseGroundY + camY * 0.5, item.w, item.h, undefined, timeOfDay)); ctx.restore();
    ctx.save(); ctx.translate(centerX, centerY); ctx.scale(zoom, zoom); ctx.translate(-camX, -camY);
    ctx.fillStyle = timeOfDay > 0.5 ? '#0c101c' : '#2b3f3b'; ctx.fillRect(-width * 5, baseGroundY, width * 10, height * 5);
    ctx.beginPath(); ctx.moveTo(-width * 5, baseGroundY); ctx.lineTo(width * 5, baseGroundY); ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
    LayerRenderer.render(ctx, scene.foliage || [], 1.0, 1500, (item, x) => FoliageGenerator.generate(ctx, x, baseGroundY, item.size, time));
    if (scene.customGroups) scene.customGroups.forEach(group => WorldEntities.renderGroup(ctx, group));
    ctx.restore();
  }

  static drawCosmos(ctx, w, h, time, cycle) {
    ctx.fillStyle = '#fff'; const intensity = (cycle - 0.6) / 0.4;
    for (let i = 0; i < 80; i++) { let x = (Math.sin(i * 721) * 10000) % w; if (x < 0) x += w; let y = (Math.cos(i * 311) * 10000) % (h * 0.6); if (y < 0) y += h * 0.6; ctx.globalAlpha = (Math.sin(i + time * 0.005) + 1) / 2 * intensity; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}
