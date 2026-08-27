
// B"H
import { Event01_Environment } from './Event01_Environment.js';
import { Event02_C1Running } from './Event02_C1Running.js';
import { Event03_C1Camera } from './Event03_C1Camera.js';
import { Event04_C2Camera } from './Event04_C2Camera.js';
import { Event05_C1Talk } from './Event05_C1Talk.js';
import { Event06_C2Wave } from './Event06_C2Wave.js';
import { Event07_C2Camera } from './Event07_C2Camera.js';
import { Event08_C2Talk } from './Event08_C2Talk.js';
import { Event09_C3Dance } from './Event09_C3Dance.js';
import { Event10_C4Dance } from './Event10_C4Dance.js';
import { Event11_C3Camera } from './Event11_C3Camera.js';
import { Event12_C3Talk } from './Event12_C3Talk.js';
import { Event13_C4Camera } from './Event13_C4Camera.js';
import { Event14_C4Talk } from './Event14_C4Talk.js';
import { Event15_WideReveal } from './Event15_WideReveal.js';
import { Event16_C1Talk2 } from './Event16_C1Talk2.js';
import { Event17_C2Talk2 } from './Event17_C2Talk2.js';
import { Event18_AllWave } from './Event18_AllWave.js';
import { Event19_FinalWord } from './Event19_FinalWord.js';

/**
 * @file EventCompiler.js
 * @description Gathers the shattered sparks of the script into a single linear array.
 */
export const EventCompiler = [
  Event01_Environment,
  Event02_C1Running, Event03_C1Camera, Event04_C2Camera, Event05_C1Talk,
  Event06_C2Wave, Event07_C2Camera, Event08_C2Talk,
  Event09_C3Dance, Event10_C4Dance, Event11_C3Camera, Event12_C3Talk, Event13_C4Camera, Event14_C4Talk,
  Event15_WideReveal, Event16_C1Talk2, Event17_C2Talk2,
  ...Event18_AllWave,
  Event19_FinalWord
];
