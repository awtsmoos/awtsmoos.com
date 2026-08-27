
// B"H
import { WorldManifest } from '../../../../data/manifests/WorldManifest.js';

/**
 * @file CameraStateInit.js
 * @description Assigns the initial parameters of the viewport lens.
 */
export class CameraStateInit {
  static apply(state) {
    state.register('camera', { ...WorldManifest.camera, zoom: 0.8, x: 0, y: -50 }); 
  }
}
