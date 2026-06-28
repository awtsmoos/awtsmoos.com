// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { OutdoorSkyPainter } from './professionalOutdoor/OutdoorSkyPainter.js';
import { OutdoorLayerPainter } from './professionalOutdoor/OutdoorLayerPainter.js';
import { OutdoorWeatherPainter } from './professionalOutdoor/OutdoorWeatherPainter.js';

export class ProfessionalWorkshopWorld {
  static render(ctx, scene = {}, width, height, time = 0, camera = {}) {
    const w = width, h = height, outdoor = scene.environment === 'professional_2d_outdoor_plaza';
    if (outdoor) return this.renderOutdoor(ctx, scene, w, h, time, camera);
    return this.renderWorkshop(ctx, scene, w, h, time, camera);
  }

  static renderOutdoor(ctx, scene, w, h, time, camera) {
    OutdoorSkyPainter.render(ctx, scene, w, h, time);
    OutdoorLayerPainter.render(ctx, w, h, camera, time);
    OutdoorWeatherPainter.render(ctx, scene, w, h, time);
  }

  static renderWorkshop(ctx, scene, w, h, time, camera) {
    const bg = scene.background || {}, grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, bg.skyColorTop || '#79cfff'); grd.addColorStop(.55, bg.skyColorBottom || '#ffe1a1'); grd.addColorStop(1, bg.groundColor || '#5faa57');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    this.hills(ctx, w, h, camera, .12, '#6ea6c8', .52); this.village(ctx, w, h, camera, .3);
    this.arch(ctx, w, h, camera, .58); this.workshopFloor(ctx, w, h); this.motes(ctx, w, h, time * .001); this.foreground(ctx, w, h, time * .001);
  }

  static build(ctx = {}) {
    const w = Math.max(1000, ctx.width || ctx.canvas?.width || 1200), h = Math.max(720, ctx.height || ctx.canvas?.height || 800);
    return G.group('professional_2d_world', null, [
      G.rect('painted_sky', { x: -w, y: -h, width: w * 3, height: h * 1.4, fill: '#16233f' }),
      G.ellipse('soft_far_hills', w * .5, h * .34, w * .8, h * .18, 0, { fill: '#6ea6c8' }),
      G.rect('storybook_village_band', { x: -w, y: h * .38, width: w * 3, height: h * .18, fill: '#39445d' }),
      G.rect('wet_plaza_floor', { x: -w, y: h * .58, width: w * 3, height: h, fill: '#39484d' }),
      G.circle('warm_lantern_rim', { x: w * .44, y: h * .58, radius: h * .18, fill: 'rgba(255,217,120,.35)' })
    ]);
  }

  static hills(ctx, w, h, camera, depth, color, y) {
    ctx.save(); ctx.translate(-(camera.x || 0) * depth, 0); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-w, h * y);
    for (let i = -1; i <= 7; i++) ctx.quadraticCurveTo(w * (i + .25), h * (y - .16), w * (i + .55), h * y);
    ctx.lineTo(w * 3, h); ctx.lineTo(-w, h); ctx.fill(); ctx.restore();
  }

  static village(ctx, w, h, camera, depth) {
    ctx.save(); ctx.translate(-(camera.x || 0) * depth, 0);
    for (let i = -2; i < 9; i++) { const x = i * w * .18, y = h * (.43 + (i % 2) * .025); ctx.fillStyle = ['#9b5c42', '#b96f4a', '#7d4a38'][Math.abs(i) % 3]; ctx.fillRect(x, y, w * .13, h * .15); ctx.fillStyle = '#6f2f35'; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + w * .065, y - h * .08); ctx.lineTo(x + w * .14, y); ctx.fill(); }
    ctx.restore();
  }

  static arch(ctx, w, h, camera, depth) {
    ctx.save(); ctx.translate(-(camera.x || 0) * depth, 0); ctx.strokeStyle = '#7a4b2c'; ctx.lineWidth = 28; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w * .14, h * .6); ctx.quadraticCurveTo(w * .5, h * .12, w * .86, h * .6); ctx.stroke(); ctx.fillStyle = 'rgba(255,232,166,.28)'; ctx.fillRect(w * .18, h * .24, w * .64, h * .36); ctx.restore();
  }

  static workshopFloor(ctx, w, h) { ctx.fillStyle = '#5faa57'; ctx.fillRect(-w, h * .58, w * 3, h); ctx.fillStyle = 'rgba(80,44,20,.18)'; ctx.beginPath(); ctx.ellipse(w * .5, h * .72, w * .36, h * .07, 0, 0, Math.PI * 2); ctx.fill(); }
  static motes(ctx, w, h, t) { ctx.fillStyle = 'rgba(255,245,190,.55)'; for (let i = 0; i < 34; i++) { const x = (Math.sin(i * 12.989 + t) * 43758.5453 % 1 + 1) % 1 * w, y = h * .14 + ((i * 53 + t * 18) % (h * .42)); ctx.beginPath(); ctx.arc(x, y, 1.2 + (i % 3), 0, Math.PI * 2); ctx.fill(); } }
  static foreground(ctx, w, h, t) { ctx.fillStyle = 'rgba(31,103,45,.38)'; ctx.fillRect(0, h * .84, w, h * .16); for (let i = 0; i < 12; i++) { ctx.fillStyle = ['#ff78b7', '#ffe66d', '#ffffff'][i % 3]; ctx.beginPath(); ctx.arc(i * w / 11, h * (.86 + .02 * Math.sin(t + i)), 7 + i % 4, 0, Math.PI * 2); ctx.fill(); } }
}
