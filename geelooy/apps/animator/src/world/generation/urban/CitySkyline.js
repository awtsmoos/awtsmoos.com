
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { WindowMatrix } from './WindowMatrix.js';

/**
 * @class CitySkyline
 * @description
 * THE URBAN FIRMAMENT (Ir HaKodesh).
 * B"H
 * 
 * Procedural generation of massive flat vector buildings.
 */
export class CitySkyline {
  /**
   * Manifests a towering skyline.
   */
  static build(buildingsData) {
    if (!buildingsData) return null;

    return G.group('city_layer', null, buildingsData.map((b, i) => {
      const w = b.w || 250;
      const h = b.h || 800;
      const color = b.color || '#111';

      return G.group(`bld_${i}`, { x: b.x, y: b.y }, [
        // The Main Pillar
        G.rect('struct', 0, -h, w, h, { fill: color, stroke: '#000', lineWidth: 8 }),
        
        // Window Matrix (Internal logic)
        WindowMatrix.build(w, h, b.x),

        // B"H - Random Water Tower on roof
        (i % 3 === 0) ? G.group('water_tower', { x: w * 0.5, y: -h - 40 }, [
          G.rect('wt_base', -15, 0, 30, 40, { fill: '#333' }),
          G.ellipse('wt_tank', 0, 0, 35, 45, 0, { fill: '#5d4037', stroke: '#000', lineWidth: 4 })
        ]) : null,

        // The Roof Overhang (Perspective marker)
        G.rect('roof', -10, -h - 10, w + 20, 10, { fill: '#000', stroke: '#000', lineWidth: 2 }),
        
        // Dynamic Antenna Array
        G.group('antennas', { x: w * 0.2, y: -h }, [
          G.path('ant1', [{type:'move',x:0,y:0}, {type:'line',x:0,y:-80}], {stroke:'#000', lineWidth:4}),
          G.path('ant2', [{type:'move',x:0,y:-60}, {type:'line',x:15,y:-50}], {stroke:'#000', lineWidth:2}),
          G.path('ant3', [{type:'move',x:0,y:-70}, {type:'line',x:-15,y:-55}], {stroke:'#000', lineWidth:2})
        ])
      ]);
    }));
  }
}
