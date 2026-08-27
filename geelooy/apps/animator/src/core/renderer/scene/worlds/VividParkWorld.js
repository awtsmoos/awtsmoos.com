// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file VividParkWorld.js
 * @description A first revealed world: sky, trees, food, paths, and blessing.
 */
export class VividParkWorld {
  static build(ctx = {}, camera = {}) {
    const size = this.size(ctx);
    const w = size.w;
    const h = size.h;
    return G.group('vivid_park_world', null, [
      ...this.sky(w, h),
      ...this.farPark(w, h),
      ...this.midPark(w, h),
      ...this.picnicStory(w, h),
      ...this.foreground(w, h),
      ...this.benefitGlow(w, h, camera)
    ]);
  }

  static size(ctx = {}) {
    const canvas = ctx.canvas || ctx.ctx?.canvas || {};
    return {
      w: Math.max(1000, Number(canvas.width || ctx.width || 1200)),
      h: Math.max(720, Number(canvas.height || ctx.height || 800))
    };
  }

  static sky(w, h) {
    return [
      G.rect('park_sky_high_blue', { x: -w, y: -h, width: w * 3, height: h * 1.15, fill: '#7fd6ff' }),
      G.rect('park_sky_warm_horizon', { x: -w, y: h * 0.02, width: w * 3, height: h * 0.42, fill: 'rgba(255,232,166,.82)' }),
      ...this.clouds(w, h),
      G.circle('park_sun_soft', { x: w * 0.78, y: -h * 0.22, radius: h * 0.12, fill: '#ffe66d' })
    ];
  }

  static clouds(w, h) {
    const cloud = (id, x, y, s) => G.group(id, null, [
      G.ellipse(`${id}_a`, x, y, 70 * s, 24 * s, 0, { fill: 'rgba(255,255,255,.86)' }),
      G.ellipse(`${id}_b`, x + 48 * s, y + 5 * s, 54 * s, 20 * s, 0, { fill: 'rgba(255,255,255,.76)' }),
      G.ellipse(`${id}_c`, x - 46 * s, y + 7 * s, 44 * s, 16 * s, 0, { fill: 'rgba(255,255,255,.68)' })
    ]);
    return [cloud('park_cloud_left', w * 0.2, -h * 0.32, 1.2), cloud('park_cloud_right', w * 0.72, -h * 0.38, 0.95)];
  }

  static farPark(w, h) {
    return [
      G.rect('park_far_tree_line', { x: -w, y: h * 0.08, width: w * 3, height: h * 0.22, fill: '#6bbb63' }),
      ...this.treeRow('far_tree', -w * 0.15, h * 0.06, w, 9, 0.72),
      G.rect('park_path_far', { x: -w * 0.25, y: h * 0.31, width: w * 1.8, height: h * 0.1, fill: '#e9c986' }),
      G.ellipse('park_pond', w * 0.72, h * 0.32, w * 0.22, h * 0.055, 0, { fill: '#51b8e8' }),
      G.rect('park_bridge', { x: w * 0.59, y: h * 0.25, width: w * 0.28, height: 10, fill: '#8a532b' })
    ];
  }

  static midPark(w, h) {
    return [
      G.rect('park_grass_main', { x: -w, y: h * 0.38, width: w * 3, height: h * 1.2, fill: '#67be55' }),
      G.ellipse('park_path_main', w * 0.5, h * 0.7, w * 0.8, h * 0.18, 0, { fill: '#e6bd75' }),
      G.ellipse('park_table_shadow', w * 0.5, h * 0.61, w * 0.34, h * 0.045, 0, { fill: 'rgba(78,45,18,.25)' }),
      ...this.treeRow('mid_tree', -w * 0.05, h * 0.19, w, 7, 1)
    ];
  }

  static picnicStory(w, h) {
    const y = h * 0.5;
    return [
      G.rect('picnic_table_top', { x: w * 0.24, y, width: w * 0.52, height: h * 0.055, fill: '#a9652f' }),
      G.rect('picnic_table_front', { x: w * 0.21, y: y + h * 0.045, width: w * 0.58, height: h * 0.05, fill: '#7b421f' }),
      G.ellipse('fruit_bowl', w * 0.38, y - h * 0.015, w * 0.055, h * 0.024, 0, { fill: '#8b451f' }),
      G.circle('apple_red', { x: w * 0.36, y: y - h * 0.038, radius: h * 0.014, fill: '#e53b3b' }),
      G.circle('apple_green', { x: w * 0.4, y: y - h * 0.041, radius: h * 0.014, fill: '#87c944' }),
      G.rect('lunch_plate', { x: w * 0.5, y: y - h * 0.035, width: w * 0.13, height: h * 0.018, fill: '#f8f2dd' }),
      G.rect('benefit_sign', { x: w * 0.68, y: h * 0.37, width: w * 0.18, height: h * 0.075, fill: '#75441f', stroke: '#f2cc65', lineWidth: 4 }),
      G.text('benefit_sign_text', 'EAT WELL • LIVE WELL', w * 0.695, h * 0.415, { fill: '#fff1a8', font: 'bold 28px sans-serif' })
    ];
  }

  static foreground(w, h) {
    return [
      ...this.flowers('fg_left_flowers', w * 0.05, h * 0.83, 7),
      ...this.flowers('fg_right_flowers', w * 0.82, h * 0.82, 8),
      G.rect('park_foreground_grass', { x: -w, y: h * 0.83, width: w * 3, height: h * 0.4, fill: 'rgba(39,126,45,.35)' })
    ];
  }

  static benefitGlow(w, h) {
    return [
      G.circle('benefit_energy_glow', { x: w * 0.51, y: h * 0.42, radius: h * 0.075, fill: 'rgba(255,229,96,.22)' }),
      G.circle('benefit_friendship_glow', { x: w * 0.44, y: h * 0.45, radius: h * 0.05, fill: 'rgba(255,118,169,.16)' })
    ];
  }

  static treeRow(prefix, startX, y, w, count, scale) {
    return Array.from({ length: count }, (_, i) => this.tree(`${prefix}_${i}`, startX + i * (w / (count - 1)), y + (i % 2) * 24, scale + (i % 3) * 0.08));
  }

  static tree(id, x, y, s) {
    return G.group(id, null, [
      G.rect(`${id}_trunk`, { x: x - 10 * s, y: y + 72 * s, width: 20 * s, height: 110 * s, fill: '#7b421f' }),
      G.circle(`${id}_leaf_a`, { x, y: y + 60 * s, radius: 62 * s, fill: '#3fae49' }),
      G.circle(`${id}_leaf_b`, { x: x - 42 * s, y: y + 88 * s, radius: 42 * s, fill: '#5fbd55' }),
      G.circle(`${id}_leaf_c`, { x: x + 46 * s, y: y + 86 * s, radius: 48 * s, fill: '#4caf50' })
    ]);
  }

  static flowers(prefix, x, y, count) {
    return Array.from({ length: count }, (_, i) => G.circle(`${prefix}_${i}`, { x: x + i * 28, y: y + (i % 3) * 12, radius: 8, fill: ['#ff69b4', '#ffe66d', '#ffffff'][i % 3] }));
  }
}
