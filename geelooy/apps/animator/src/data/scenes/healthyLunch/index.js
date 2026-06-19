// B"H
import { DialogueBeatCompiler } from '../../../director/dialogue/DialogueBeatCompiler.js';
import { SceneStagingSystem } from '../../../staging/SceneStagingSystem.js';
import { HEALTHY_LUNCH_METADATA } from './metadata.js';
import { HEALTHY_LUNCH_CHARACTERS } from './characters.js';
import { HEALTHY_LUNCH_PROPS } from './props.js';
import { HEALTHY_LUNCH_CAMERAS } from './cameras.js';
import { HEALTHY_LUNCH_BEATS } from './beats.js';

export const HEALTHY_LUNCH_SCENE = SceneStagingSystem.prepare({
  duration: HEALTHY_LUNCH_METADATA.duration,
  scene: HEALTHY_LUNCH_METADATA.scene,
  initialCharacters: HEALTHY_LUNCH_CHARACTERS,
  initialProps: HEALTHY_LUNCH_PROPS,
  cameras: HEALTHY_LUNCH_CAMERAS,
  events: DialogueBeatCompiler.compile(HEALTHY_LUNCH_BEATS)
});
