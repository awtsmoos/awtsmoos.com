//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureRegistry.js
 * @description
 * The Awtsmoos gathers every meaningful Animator power into one discoverable constellation of light;
 * Awtsmoos.com keeps product ontology detached from command topology, so stable meaning survives as executable vessels grow right.
 */

import { HOD_AUDIO_FEATURES } from './AudioFeatureData.js';
import { CHOCHMAH_CAMERA_FEATURES } from './CameraFeatureData.js';
import { TIFERES_CHARACTER_FEATURES } from './CharacterFeatureData.js';
import { MALCHUS_DIALOGUE_FEATURES } from './DialogueFeatureData.js';
import { OR_EXPANSION_FEATURES } from './ExpansionFeatureData.js';
import { YESOD_MEDIA_FEATURES } from './MediaFeatureData.js';
import { TIFERES_PERFORMANCE_FEATURES } from './PerformanceFeatureData.js';
import { MALCHUS_PROJECT_FEATURES } from './ProjectFeatureData.js';
import { KETER_SYSTEM_FEATURES } from './SystemFeatureData.js';
import { NETZACH_TIMELINE_FEATURES } from './TimelineFeatureData.js';
import { YESOD_WORLD_FEATURES } from './WorldFeatureData.js';

const OR_FEATURES = Object.freeze([
	...KETER_SYSTEM_FEATURES,
	...MALCHUS_PROJECT_FEATURES,
	...TIFERES_PERFORMANCE_FEATURES,
	...TIFERES_CHARACTER_FEATURES,
	...CHOCHMAH_CAMERA_FEATURES,
	...MALCHUS_DIALOGUE_FEATURES,
	...HOD_AUDIO_FEATURES,
	...YESOD_MEDIA_FEATURES,
	...NETZACH_TIMELINE_FEATURES,
	...YESOD_WORLD_FEATURES,
	...OR_EXPANSION_FEATURES
]);

/** Canonical product-feature registry independent from executable command topology. */
export class DaasAnimatorFeatureRegistry {
	static publicFeatures() {
		return OR_FEATURES
			.filter((keli) => ['public', 'environment-gated'].includes(keli.exposure))
			.map((keli) => structuredClone(keli));
	}

	static all() {
		return OR_FEATURES.map((keli) => structuredClone(keli));
	}

	static get(sodFeatureId) {
		const keliFeature = OR_FEATURES.find((keli) => keli.id === sodFeatureId);
		return keliFeature ? structuredClone(keliFeature) : null;
	}

	static family(shemFamily) {
		return OR_FEATURES
			.filter((keli) => keli.family === shemFamily)
			.map((keli) => structuredClone(keli));
	}

	static ids() {
		return OR_FEATURES.map((keli) => keli.id);
	}
}
