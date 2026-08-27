
// B"H
import { WorldManifest } from '../../../../data/manifests/WorldManifest.js';

/**
 * @file WorldStateInit.js
 * @description Assigns the initial structures of the physical universe.
 */
export class WorldStateInit {
  static apply(state) {
    state.register('scene', {
      background: WorldManifest.background,
      props: WorldManifest.props,
      timeOfDay: 0.2, 
      offset: 0,
      groundY: 150 
    });
  }
}
