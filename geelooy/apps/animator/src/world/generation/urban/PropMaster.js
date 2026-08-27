// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LampPost } from './LampPost.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @file PropMaster.js
 * @description
 * THE ORCHESTRATOR OF URBAN DETAILS (Mehaneh HaPratim).
 * B"H - Spatially hashes the city to prevent prop collision.
 * Every bench, hydrant, and trashcan knows its sacred domain.
 * No overlapping. No chaos. The spatial order of the Awtsmoos rules.
 *
 * THE POEM OF SPATIAL HARMONY:
 * The bench sat inside the hydrant of red,
 * The trashcan engulfed the pigeon's small head!
 * So the Scribe brought forth the Hash of Space,
 * Assigning a zone to every single place!
 * Now objects exist with respectful domains,
 * And harmony rules on the digital plains!
 */
export class PropMaster {
  static build(groundY, cityWidth) {
    const props = [];
    const occupiedSpaces = [];

    const isSpaceFree = (targetX, buffer) => !occupiedSpaces.some(space => Math.abs(space - targetX) < buffer);
    const reserveSpace = (x) => { occupiedSpaces.push(x); };

    for (let x = -cityWidth / 2; x < cityWidth / 2; x += 400) {
      props.push(LampPost.build(`lp_${x}`, x, groundY));
      reserveSpace(x);
    }

    for (let x = -cityWidth / 2 + 100; x < cityWidth / 2; x += 150) {
      const chance = seededRandom(x);
      if (!isSpaceFree(x, 90)) continue;

      if (chance < 0.15) {
        if (isSpaceFree(x, 120)) {
          props.push(G.group(`bench_${x}`, { x, y: groundY }, [
            G.rect('bshadow', -40, 0, 80, 4, { fill: 'rgba(0,0,0,0.3)' }),
            G.rect('blegL', -30, -30, 4, 30, { fill: '#111' }),
            G.rect('blegR', 26, -30, 4, 30, { fill: '#111' }),
            G.rect('seat', -40, -30, 80, 6, { fill: '#5c4033', stroke: '#3b251a', lineWidth: 1 }),
            G.rect('back', -40, -45, 80, 8, { fill: '#8b5a2b', stroke: '#5c3a1a', lineWidth: 1 })
          ]));
          reserveSpace(x);
        }
      } else if (chance > 0.15 && chance < 0.3) {
        props.push(G.group(`trash_${x}`, { x, y: groundY }, [
          G.rect('tc_body', -12, -35, 24, 35, { fill: '#2f4f4f', stroke: '#111', lineWidth: 2 }),
          G.rect('tc_top', -14, -40, 28, 5, { fill: '#1f3f3f' })
        ]));
        reserveSpace(x);
      } else if (chance > 0.3 && chance < 0.4) {
        props.push(G.group(`hydrant_${x}`, { x, y: groundY }, [
          G.rect('body', -8, -30, 16, 30, { fill: '#c0392b' }),
          G.rect('top_cap', -10, -35, 20, 5, { fill: '#c0392b' }),
          G.circle('front_nut', 0, -15, 4, { fill: '#bdc3c7' })
        ]));
        reserveSpace(x);
      } else if (chance > 0.4 && chance < 0.6) {
        props.push(G.group(`urbantree_${x}`, { x, y: groundY }, [
          G.rect('trunk', -8, -80, 16, 80, { fill: '#4d2600' }),
          G.circle('leaf1', -15, -95, 35, { fill: '#006400', stroke: '#0a2911', lineWidth: 1 }),
          G.circle('leaf2', 15, -90, 30, { fill: '#005000', stroke: '#0a2911', lineWidth: 1 }),
          G.circle('leaf3', 0, -115, 35, { fill: '#1e5128', stroke: '#0a2911', lineWidth: 1 })
        ]));
        reserveSpace(x);
      } else if (chance > 0.6 && chance < 0.65) {
        props.push(G.group(`news_${x}`, { x, y: groundY }, [
          G.rect('Npost', -4, -30, 8, 30, { fill: '#333' }),
          G.rect('Nbox', -15, -60, 30, 30, { fill: '#d35400' }),
          G.rect('Nwin', -10, -55, 20, 15, { fill: '#85c1e9' })
        ]));
        reserveSpace(x);
      }
    }

    return G.group('prop_layer', null, props);
  }
}