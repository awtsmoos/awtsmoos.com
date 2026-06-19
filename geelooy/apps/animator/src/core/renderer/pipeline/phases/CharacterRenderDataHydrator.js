// B"H
import { CinematicCharacterStaging } from './CinematicCharacterStaging.js';
import { PerformanceRenderBridge } from '../../../../character/performance/render/PerformanceRenderBridge.js';

/** Hydrates character data with world context and renderer-consumable performance. */
export class CharacterRenderDataHydrator {
  static hydrate(character, info) {
    const staged = CinematicCharacterStaging.apply(character, info);
    const withWorld = {
      ...staged,
      _renderTime: info.directorTime,
      _realTime: info.realTime,
      _directorTime: info.directorTime,
      _lastDirectorTime: info.directorTime,
      _camera: info.camera,
      _index: info.index,
      _allCharacters: info.characters || {},
      _allProps: info.props || {}
    };
    return { ...withWorld, renderPerformance: PerformanceRenderBridge.from(withWorld) };
  }
}
