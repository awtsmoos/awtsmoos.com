
/* B”H */
import { NodeFactory as N } from '../../../engine/graph/NodeFactory.js';
import { seededRandom } from '../../../utils/random.js';
import { ProceduralNatureForge } from '../../../world/generation/nature/ProceduralNatureForge.js';
import { ProceduralCityForge } from '../../../world/generation/urban/ProceduralCityForge.js';

/**
 * @class EnvironmentBuilders
 * @description
 * THE ALPHABET OF NATURE.
 * B"H
 * Transforms raw scene data into VirtualGraph nodes.
 * Now acts as a router to the supreme Procedural Forges!
 */
export class EnvironmentBuilders {
  static celestialBody(width, height, timeOfDay) {
    const sunX = width * 0.8;
    const sunY = height * 0.2 + (timeOfDay * height * 0.5);
    
    if (timeOfDay < 0.6) {
      return N.circle('sun', sunX, sunY, 40, { fill: '#FFF700' });
    } else {
      return N.group('moon_group', null, [
        N.circle('moon_base', sunX, sunY, 30, { fill: '#EEE' }),
        N.circle('moon_shadow', sunX + 10, sunY - 5, 25, { fill: '#000428' })
      ]);
    }
  }

  static skyscraper(data) {
    // Delegate to the Omni-City Forge!
    return ProceduralCityForge.build(data, { x: data.x, y: data.y }, Date.now());
  }

  static building(data) {
    data.style = 'house'; // Force house style
    return ProceduralCityForge.build(data, { x: data.x, y: data.y }, Date.now());
  }

  static tree(data) {
    // Delegate to the Omni-Nature Forge!
    return ProceduralNatureForge.build(data, { x: data.x, y: data.y }, Date.now());
  }

  static bush(data) {
    data.species = 'bush'; // Force bush species
    return ProceduralNatureForge.build(data, { x: data.x, y: data.y }, Date.now());
  }

  static mountain(data) {
    const segments = 10;
    const step = data.w / segments;
    const points = [{ type: 'move', x: 0, y: 0 }];
    
    for (let i = 1; i <= segments; i++) {
      const px = i * step;
      const py = -seededRandom(data.x + i) * data.h - (i === segments || i === 0 ? 0 : data.h * 0.5);
      points.push({ type: 'line', x: px, y: py });
    }
    points.push({ type: 'line', x: data.w, y: 0 });
    
    return N.group(`mnt_${data.id || data.x}`, { x: data.x, y: data.y }, [
      N.path('mnt_base', points, { fill: data.color || '#222' }),
      N.rect('mnt_snow', 0, -data.h, data.w, data.h * 0.3, { fill: 'rgba(255,255,255,0.8)' })
    ]);
  }

  static bench(data) {
    const w = (data.w || 200) * (data.scale || 1);
    const h = (data.h || 60) * (data.scale || 1);
    return N.group(`bench_${data.id || data.x}`, { x: data.x, y: data.y }, [
       N.rect('shadow', -w/2, 0, w + 10, 5, { fill: 'rgba(0,0,0,0.3)' }),
       N.rect('leg_l', -w/2 + 10, -h, 10, h, { fill: '#222' }),
       N.rect('leg_r', w/2 - 20, -h, 10, h, { fill: '#222' }),
       N.rect('seat', -w/2, -h, w, 12, { fill: '#5c4033', stroke: '#3b251a', lineWidth: 2 }),
       N.rect('seat_slat', -w/2, -h + 15, w, 8, { fill: '#5c4033', stroke: '#3b251a', lineWidth: 2 }),
       N.rect('back_leg_l', -w/2 + 10, -h - 45, 10, 45, { fill: '#222' }),
       N.rect('back_leg_r', w/2 - 20, -h - 45, 10, 45, { fill: '#222' }),
       N.rect('back1', -w/2, -h - 25, w, 10, { fill: '#8b5a2b', stroke: '#5c3a1a', lineWidth: 2 }),
       N.rect('back2', -w/2, -h - 45, w, 12, { fill: '#8b5a2b', stroke: '#5c3a1a', lineWidth: 2 })
    ]);
  }

  // The rest of the props (lamp, pigeon, etc) are retained here for fallback simplicity
  static lamp(data) {
    const h = (data.h || 200) * (data.scale || 1);
    const isOn = data.isOn !== false; 
    
    return N.group(`lamp_${data.id || data.x}`, { x: data.x, y: data.y }, [
       N.rect('base', -15, -10, 30, 10, { fill: '#222' }),
       N.rect('post', -5, -h, 10, h, { fill: '#333' }),
       isOn ? N.circle('light_glow', 0, -h - 15, 60, { fill: 'rgba(255, 223, 100, 0.15)' }) : null,
       N.circle('light_bulb', 0, -h - 15, 15, { fill: isOn ? '#fff0a0' : '#888' }),
       N.rect('cap', -25, -h - 35, 50, 8, { fill: '#222', radius: 4 }), 
       N.rect('cap_top', -10, -h - 45, 20, 10, { fill: '#111' })
    ].filter(Boolean));
  }

  static pigeon(data) {
    const s = (data.scale || 1);
    const flip = data.flipX ? -1 : 1;
    return N.group(`pigeon_${data.id || data.x}`, { x: data.x, y: data.y, scaleX: flip }, [
       N.circle('pg_b', 0, -10 * s, 8 * s, { fill: '#708090' }), 
       N.group('pg_head', { x: 6 * s, y: -16 * s }, [
           N.circle('pg_h', 0, 0, 5 * s, { fill: '#778899' }), 
           N.path('pg_bk', [{ type: 'move', x: 4 * s, y: 0 }, { type: 'line', x: 8 * s, y: 1 * s }, { type: 'line', x: 4 * s, y: 2 * s }], { fill: '#d2b48c' }),
           N.circle('pg_e', 2 * s, -1 * s, 1.5 * s, { fill: '#ff4500' }), 
           N.circle('pg_e_p', 2 * s, -1 * s, 0.5 * s, { fill: '#000' }) 
       ])
    ]);
  }
}
