// B"H
import { DEFAULT_LIVING_SCENE } from './DefaultLivingScene.js';
<<<<<<< HEAD
import { OUTDOOR_PROFESSIONAL_SCENE } from './outdoorProfessional/OutdoorProfessionalScene.js';

/**
 * @file index.js
 * @description One official default scene export, now the living outdoor
 * professional world whose rain, actors, crowd, and camera repair every frame.
 */
export const DEFAULT_SCENE = DEFAULT_LIVING_SCENE;
export { DEFAULT_LIVING_SCENE, OUTDOOR_PROFESSIONAL_SCENE };
=======
export { ProfessionalDefaultScene } from './professional2d/index.js';

/**
 * @file index.js
 * @description One official default scene export for the animator.
 */
export const DEFAULT_SCENE = DEFAULT_LIVING_SCENE;
export { DEFAULT_LIVING_SCENE };
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
