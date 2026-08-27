// B"H
import { PROFESSIONAL_WORKSHOP_WORLD } from './ProfessionalWorkshopWorld.js';
import { LIVING_CHARACTERS } from './LivingCharacters.js';
import { FACIAL_PERFORMANCE } from './FacialPerformance.js';
import { ENVIRONMENTAL_DYNAMICS } from './EnvironmentalDynamics.js';
import { REACTIVE_CROWD } from './ReactiveCrowd.js';
import { VIRTUAL_CINEMATOGRAPHER } from './VirtualCinematographer.js';
import { STORY_MEMORY } from './StoryMemory.js';
import { DIRECTOR_BRAIN } from './DirectorBrain.js';

const crowdAsCharacters = Object.fromEntries(REACTIVE_CROWD.map(extra => [extra.id, extra]));

const prop = (id, type, x, y, size, layer = 'front') => ({
  id, type, x, y, size, layer, visible: true, reactive: true, static: false
});

const props = [
  prop('rope_line', 'rope', 18, -146, 76), prop('blueprint_case', 'book', -64, -118, 48),
  prop('leaking_tarp', 'cloth', 0, -220, 170, 'back'), prop('lantern', 'sparkle', 112, -172, 24),
  prop('tool_crate', 'box', -136, -104, 52), prop('puddle_main', 'water', 44, -76, 68),
  prop('mud_track_left', 'terrain_memory', -102, -62, 50), prop('grass_foreground', 'grass', 0, -28, 180),
  prop('wet_plank', 'plank', 72, -90, 88), prop('loose_blueprint_corner', 'paper', -38, -132, 24)
];

const eventTypes = ['camera', 'character', 'environment', 'crowd', 'director'];
const events = VIRTUAL_CINEMATOGRAPHER.plans.flatMap((plan, index) => eventTypes.map((type, offset) => ({
  id: `${plan.id}_${type}`, type, start: plan.at + offset * 120, end: plan.at + 1000 + offset * 120,
  cameraId: plan.id, targets: ['mentor', 'apprentice', 'client', 'rope_line', 'puddle_main'],
  focus: plan.focus, live: true, noDeadFrame: true, continuityIndex: index
})));

/**
 * A scene built as a living pact: actors, extras, rain, camera, memory,
 * and director answer one another like instruments in a single breath.
 */
export const OUTDOOR_PROFESSIONAL_SCENE = {
  id: 'outdoor_professional_default_scene_v1',
  name: 'Outdoor Professional Living Workshop',
  duration: 15800, scene: PROFESSIONAL_WORKSHOP_WORLD,
  initialCharacters: { ...LIVING_CHARACTERS, ...crowdAsCharacters },
  primaryCharacters: Object.keys(LIVING_CHARACTERS), backgroundCrowd: REACTIVE_CROWD,
  initialProps: props, shotFlow: VIRTUAL_CINEMATOGRAPHER.plans.map(p => ({ at: p.at, name: p.id, purpose: p.focus })),
  cameras: VIRTUAL_CINEMATOGRAPHER.plans, facialPerformance: FACIAL_PERFORMANCE,
  environmentalDynamics: ENVIRONMENTAL_DYNAMICS, virtualCinematographer: VIRTUAL_CINEMATOGRAPHER,
  storyMemory: STORY_MEMORY, directorBrain: DIRECTOR_BRAIN, events,
  authoring: { system: 'outdoorProfessionalLivingWorld', version: 1,
    promise: 'professional director cinematographer actors extras weather lighting and editor collaborate continuously' },
  verificationContract: { allCharactersProcedural: true, allCamerasLive: true,
    everyFramePrimaryFocus: true, coherentEnvironment: true, continuityPreserved: true,
    directorQuality: 100, noDeadFrames: true, noFrozenCharacters: true, noUnresolvedStateTransitions: true }
};
