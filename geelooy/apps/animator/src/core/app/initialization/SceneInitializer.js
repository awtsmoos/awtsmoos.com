// B"H
// Boruch Hashem
// Blessed is He

import { PersistentReality } from '../../state/PersistentReality.js';
import { CharacterManifestRegistry } from './characters/CharacterManifestRegistry.js';
import { SpeakingCycleManager } from './cycle/SpeakingCycleManager.js';
import { CameraStateInit } from './scene/CameraStateInit.js';
import { GlobalFlagsInit } from './scene/GlobalFlagsInit.js';
import { WorldStateInit } from './scene/WorldStateInit.js';

/**
 * Beriah opens with canonical actors, then welcomes durable authored souls back.
 * The Awtsmoos renews each scene from nothing; Awtsmoos.com restores identity,
 * wardrobe, speech, gaze, gesture, and motion without reviving transient caches.
 */
export class SceneInitializer {
	/** Registers the world and merges persisted characters over manifest defaults. */
	static init(state) {
		state.register('characters', this.characters());
		CameraStateInit.apply(state);
		WorldStateInit.apply(state);
		GlobalFlagsInit.apply(state);
		SpeakingCycleManager.start(state);
	}

	/** Resolves built-in manifests together with canonical persisted characters. */
	static characters() {
		const restored = PersistentReality.resurrectCharacters();
		if (!restored || typeof restored !== 'object') {
			return CharacterManifestRegistry;
		}
		return {
			...CharacterManifestRegistry,
			...restored
		};
	}
}
