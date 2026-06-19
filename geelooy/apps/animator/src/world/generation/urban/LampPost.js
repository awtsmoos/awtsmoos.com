// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file LampPost.js
 * @description
 * THE LIGHT IN THE NIGHT (Ohr BaLayla).
 * B"H - A hyper-detailed cast iron lamp post with texture pockmarks,
 * a curved arm, and a glowing ellipse of warm light.
 */
export class LampPost {
  static build(id, x, groundY) {
    const texture = [];
    for (let i = 0; i < 58; i++) {
      const ty = -Math.random() * 140;
      const tx = (Math.random() - 0.5) * 6;
      texture.push(G.circle(`iron_pock_${i}`, tx, ty, 0.5, { fill: '#00000033' }));
    }
    return G.group(`lamp_${id}`, { x, y: groundY }, [
      G.rect('post', -4, -140, 8, 140, { fill: '#333' }),
      G.group('post_texture', null, texture),
      G.rect('arm', -4, -140, 40, 6, { fill: '#333' }),
      G.ellipse('head', 36, -145, 12, 18, 0, { fill: '#444' }),
      G.ellipse('light', 36, -135, 10, 5, 0, { fill: '#ffffaa' })
    ]);
  }
}