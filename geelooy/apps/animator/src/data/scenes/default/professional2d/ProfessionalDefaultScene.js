// B"H
import { PROFESSIONAL_CHARACTERS } from './ProfessionalCharacters.js';
import { PROFESSIONAL_PROPS } from './ProfessionalProps.js';
import { ProfessionalBeats } from './ProfessionalBeats.js';
import { PROFESSIONAL_CAMERAS, PROFESSIONAL_SHOT_FLOW } from './ProfessionalCameras.js';
import { PROFESSIONAL_WORLD } from './ProfessionalWorld.js';

export class ProfessionalDefaultScene {
  static build(options = {}) {
    const beats = options.beats || ProfessionalBeats.defaultBeats();
    return {
      id: 'professional_default_2d_short_v1',
      name: options.name || 'The Lantern That Would Not Light',
      duration: options.duration || 17600,
      scene: { ...PROFESSIONAL_WORLD, ...(options.scene || {}) },
      shotFlow: options.shotFlow || PROFESSIONAL_SHOT_FLOW,
      cameras: options.cameras || PROFESSIONAL_CAMERAS,
      initialCharacters: options.characters || PROFESSIONAL_CHARACTERS,
      initialProps: options.props || PROFESSIONAL_PROPS,
      authoring: {
        system: 'professionalDefault2D', version: 1, title: 'Professional 2D Default Short',
        promise: 'rich scene, ensemble acting, emotional prop, cinematic cameras, face-first motion'
      },
      events: ProfessionalBeats.build(beats)
    };
  }
}
