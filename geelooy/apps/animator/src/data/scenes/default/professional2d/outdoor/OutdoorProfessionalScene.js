// B"H
import { OUTDOOR_CHARACTERS } from './OutdoorCharacters.js';
import { OUTDOOR_PROPS } from './OutdoorProps.js';
import { OutdoorBeats } from './OutdoorBeats.js';
import { OUTDOOR_CAMERAS, OUTDOOR_SHOT_FLOW } from './OutdoorCameras.js';
import { OUTDOOR_WORLD } from './OutdoorWorld.js';

export class OutdoorProfessionalScene {
  static build(options = {}) {
    const beats = options.beats || OutdoorBeats.defaultBeats();
    return {
      id: 'professional_outdoor_default_2d_storm_lantern_v1',
      name: options.name || 'When The Rain Asked For Light',
      duration: options.duration || 19400,
      scene: { ...OUTDOOR_WORLD, ...(options.scene || {}) },
      shotFlow: options.shotFlow || OUTDOOR_SHOT_FLOW,
      cameras: options.cameras || OUTDOOR_CAMERAS,
      initialCharacters: options.characters || OUTDOOR_CHARACTERS,
      initialProps: options.props || OUTDOOR_PROPS,
      authoring: {
        system: 'professionalDefault2D', variant: 'outdoorStormPlaza', version: 2,
        title: 'Outdoor Professional 2D Default Short',
        promise: 'storm weather, parallax plaza, five-character acting, cinematic light, face-led emotion'
      },
      events: OutdoorBeats.build(beats)
    };
  }
}
