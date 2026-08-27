// B"H
import { WALK_CORE_KADIM } from './definitions/walk/Core.js';
import { WALK_LEG_KADIM } from './definitions/walk/Legs.js';
import { WALK_ARM_KADIM } from './definitions/walk/Arms.js';

import { MOOD_CALM } from './definitions/idle/Calm.js';
import { MOOD_ECSTATIC } from './definitions/idle/Ecstatic.js';
import { MOOD_INTENSE } from './definitions/idle/Intense.js';

import { JUMP_CURVE_MAALOT } from './definitions/jump/Constants.js';
import { JUMP_PHASES_MAALOT } from './definitions/jump/Phases.js';

export const ANIMATION_REGISTRY = {
  walk: { core: WALK_CORE_KADIM, legs: WALK_LEG_KADIM, arms: WALK_ARM_KADIM },
  idle: { calm: MOOD_CALM, ecstatic: MOOD_ECSTATIC, intense: MOOD_INTENSE },
  jump: { curve: JUMP_CURVE_MAALOT, phases: JUMP_PHASES_MAALOT }
};
