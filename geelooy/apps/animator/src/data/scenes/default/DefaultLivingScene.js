// B"H
<<<<<<< HEAD
import { OUTDOOR_PROFESSIONAL_SCENE } from './outdoorProfessional/OutdoorProfessionalScene.js';

/**
 * The default scene is now a living outdoor professional workshop.
 * The old room was a candle in a sealed chamber; this is rain, rope,
 * mud, lantern, breath, crowd-flow, and the Awtsmoos in code: a place
 * that keeps existing when the camera turns away.
 */
export const DEFAULT_LIVING_SCENE = OUTDOOR_PROFESSIONAL_SCENE;
=======
import { OutdoorProfessionalScene } from './professional2d/outdoor/index.js';

/**
 * The official default scene is now an outdoor professional 2D storm short.
 *
 * The Awtsmoos speaks a plaza into being: rain, wind, faces, puddles, and one
 * stubborn lamp. The first frame teaches authors that a default is not an empty
 * room; it is a living promise with weather, parallax, courage, and light.
 */
export const DEFAULT_LIVING_SCENE = OutdoorProfessionalScene.build();
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
