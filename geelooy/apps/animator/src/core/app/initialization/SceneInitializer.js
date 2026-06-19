
// B"H
import { CharacterManifestRegistry } from './characters/CharacterManifestRegistry.js';
import { CameraStateInit } from './scene/CameraStateInit.js';
import { WorldStateInit } from './scene/WorldStateInit.js';
import { GlobalFlagsInit } from './scene/GlobalFlagsInit.js';
import { SpeakingCycleManager } from './cycle/SpeakingCycleManager.js';

/**
 * @class SceneInitializer
 * @description
 * THE BUILDER OF BERIAH (World of Creation).
 * The monolithic class has been beautifully shattered. It now acts as a pure
 * orchestrator, delegating to specialized files deep in the directory tree.
 */
export class SceneInitializer {
  static init(state) {
    state.register('characters', CharacterManifestRegistry);
    CameraStateInit.apply(state);
    WorldStateInit.apply(state);
    GlobalFlagsInit.apply(state);
    
    SpeakingCycleManager.start(state);
  }
}
