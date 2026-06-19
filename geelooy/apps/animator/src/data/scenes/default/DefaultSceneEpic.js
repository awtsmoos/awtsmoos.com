
// B"H
import { ScenePacker } from '../../../utils/ScenePacker.js';
import { EventCompiler } from './events/EventCompiler.js';

/**
 * @file DefaultSceneEpic.js
 * @description
 * THE PACKED EPIC OF CONTINUOUS ACTION. 
 * B"H - No empty moments in the Tabernacle of Art!
 * The massive JSON file was shattered and reconstructed via JS modules
 * to bypass static server MIME limits.
 */

const packed = ScenePacker.pack(EventCompiler);

export const DEFAULT_SCENE = {
  id: 'packed_epic_v1',
  name: 'The Savage Park Revelation',
  duration: packed.duration,
  events: packed.events
};
