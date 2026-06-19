// B"H
import { DialogueBeatCompiler } from '../../../director/dialogue/DialogueBeatCompiler.js';
import { SCENE3_METADATA } from './metadata.js';
import { SCENE3_CHARACTERS } from './characters.js';
import { SCENE3_PROPS } from './props.js';
import { SCENE3_CAMERAS } from './cameras.js';
import { SCENE3_BEATS } from './beats.js';

/**
 * @file SceneThree.js
 * @description Assembles the split scene-three vessels into one living scene.
 */
export const SCENE_THREE = {
  duration: SCENE3_METADATA.duration,
  scene: SCENE3_METADATA.scene,
  cameras: SCENE3_CAMERAS,
  initialCharacters: SCENE3_CHARACTERS,
  initialProps: SCENE3_PROPS,
  events: DialogueBeatCompiler.compile(SCENE3_BEATS)
};
