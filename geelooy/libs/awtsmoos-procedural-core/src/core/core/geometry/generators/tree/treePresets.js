
// B"H
/**
 * @file treePresets.js
 * @brief Index of divine tree blueprints.
 */
import { OAK_PRESET } from './presets/oakPreset.js';
import { ASH_PRESET } from './presets/ashPreset.js';
import { SAKURA_PRESET } from './presets/sakuraPreset.js';

const treePresets = {
  'Oak Medium': OAK_PRESET,
  'Ash Large': ASH_PRESET,
  'Sakura': SAKURA_PRESET,
  'Dead Tree': {
      seed: 777,
      type: "dead",
      branch: {
          levels: 5,
          children: { 0: 5, 1: 4, 2: 6, 3: 8, 4: 10 }, 
          force: { direction: { x: 0, y: -0.5, z: 0 }, strength: 0.05 },
          gnarliness: { 0: 0.2, 1: 0.4, 2: 0.5, 3: 0.6, 4: 0.8 },
          length: { 0: 25, 1: 12, 2: 6, 3: 3, 4: 1.5 },
          radius: { 0: 3.0, 1: 1.0, 2: 0.4, 3: 0.15, 4: 0.05 },
          sections: { 0: 10, 1: 8, 2: 5, 3: 3, 4: 3 },
          segments: { 0: 16, 1: 10, 2: 6, 3: 4, 4: 3 },
          start: { 0: 0.05, 1: 0.05, 2: 0.1, 3: 0.1 },
          taper: { 0: 0.6, 1: 0.8, 2: 0.9, 3: 1.0 },
          angle: { 0: 45, 1: 55, 2: 65, 3: 80 }
      },
      leaves: { count: 0, size: 0, color: [0,0,0,0] } 
  }
};

export default treePresets;
