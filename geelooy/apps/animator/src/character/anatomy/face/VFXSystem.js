
// B"H
import { VirtualGraph as G }  from '../../../engine/graph/VirtualGraph.js';

/**
 * @file VFXSystem.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 28: THE SYSTEM OF SPARKS (Ma'arachet HaNitzotzot)
 * THE ANIME AURA REVELATION
 * ═══════════════════════════════════════════════════════════════
 *
 * Adds massive, full-body aura eruptions when `data.vfx_aura` is true.
 * Built entirely out of sharp, overlapping polygons vibrating with math!
 */
export class VFXSystem {
  static build(data, profile, time) {
    const nodes     = [];
    const intensity = data.exaggeration || 0;
    
    // ── 0. ANIME AURA OF RAGE ──────────────────────────────────
    if (data.vfx_aura) {
      const auraNodes = [];
      const auraW = 120;
      
      // Generate 20 jagged spikes radiating upwards
      for(let i=0; i<20; i++) {
         const bx = (i / 20) * auraW * 2 - auraW;
         const spikeHeight = 150 + Math.random() * 100 + (Math.sin(time*0.05 + i)*50);
         const flameDrift = Math.sin(time*0.02 + i) * 30;
         
         auraNodes.push(G.path(`aura_spike_${i}`, [
            { type: 'move', x: bx, y: 150 }, // Base (feet)
            { type: 'line', x: bx + flameDrift, y: -spikeHeight }, // Tip
            { type: 'line', x: bx + 15, y: 150 }
         ], { fill: i % 2 === 0 ? 'rgba(255, 204, 0, 0.8)' : 'rgba(255, 50, 0, 0.6)', composite: 'screen' }));
      }
      
      nodes.push(G.group('epic_aura', { y: -50 }, auraNodes));
    }

    if (intensity <= 0) return G.group('vfx_void', null, nodes);

    const { joy = 0, sadness = 0, anger = 0, stress = 0 } = data;

    // ── 1. TEARS OF THE BROKEN VESSEL ─────────────────────────
    if (sadness * intensity > 0.7) {
      const phase   = (time % 2000) / 2000;
      const slide   = phase * 80;
      const fadeIn  = Math.min(1, phase / 0.1);
      const fadeOut = 1 - Math.max(0, (phase - 0.85) / 0.15);
      const alpha   = 0.7 * fadeIn * fadeOut;

      const tearColor = `rgba(135, 206, 235, ${alpha})`;

      const drawTear = (side) => {
        const x = side === 'left' ? -25 : 25;
        return G.path(`tear_${side}`, [
          { type: 'move', x, y: -10 + slide },
          { type: 'bezier', c1x: x - 5, c1y: 5 + slide, c2x: x + 5, c2y: 5 + slide, x, y: 15 + slide }
        ], { stroke: tearColor, lineWidth: 6, lineCap: 'round' });
      };

      if (profile.type !== 'side' || profile.dir === -1) nodes.push(drawTear('left'));
      if (profile.type !== 'side' || profile.dir ===  1) nodes.push(drawTear('right'));
    }

    // ── 2. ANGRY VEIN ──────────────────────────────────────────
    if (Math.max(anger, stress) * intensity > 0.8) {
      const vX = 45 * (profile.dir || 1);
      const vY = -60;
      const pulse = 1 + Math.sin(time * 0.0126) * 0.15;
      nodes.push(G.path('vein_pop', [
        { type: 'move', x: vX - 8 * pulse, y: vY - 4 }, { type: 'line', x: vX + 8 * pulse, y: vY + 4 },
        { type: 'move', x: vX - 4,         y: vY - 8 * pulse }, { type: 'line', x: vX + 4, y: vY + 8 * pulse }
      ], { stroke: '#ff0000', lineWidth: 3, lineCap: 'round' }));
    }

    // ── 3. JOYOUS SPARKLES ─────────────────────────────────────
    if (joy * intensity > 0.9) {
      for (let i = 0; i < 3; i++) {
        const sX = Math.sin(time * 0.005 + i) * 80;
        const sY = -120 + Math.cos(time * 0.003 + i) * 40;
        nodes.push(G.group(`sparkle_${i}`, { x: sX, y: sY, rotation: time * 0.1 }, [
          G.path('s', [
            { type: 'move', x: -10, y: 0 }, { type: 'line', x: 10, y: 0 },
            { type: 'move', x: 0, y: -10 }, { type: 'line', x: 0, y: 10 }
          ], { stroke: '#ffd700', lineWidth: 2 })
        ]));
      }
    }

    return G.group('vfx_layer', null, nodes);
  }
}
