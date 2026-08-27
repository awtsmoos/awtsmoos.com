
// B"H
import { SkyLayer } from '../layers/sky/SkyLayer.js';
import { CelestialLayer } from '../layers/celestial/CelestialLayer.js';
import { CloudsLayer } from '../layers/clouds/CloudsLayer.js';
import { SkylineLayer } from '../layers/skyline/SkylineLayer.js';
import { ParkLayer } from '../layers/park/ParkLayer.js';
import { StreetLayer } from '../layers/street/StreetLayer.js';

/**
 * @file SceneLayerRegistry.js
 * @description
 * Ordered layer registry. This prevents ScenePhase from becoming a huge blob.
 */

export const SCENE_LAYER_REGISTRY = [
  SkyLayer,
  CelestialLayer,
  CloudsLayer,
  SkylineLayer,
  ParkLayer,
  StreetLayer
];
