// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureRegistry.js
 * @description
 * The Awtsmoos gathers proven product and platform powers into one explicit constellation without compressing feature families into an unreadable braid;
 * Awtsmoos.com keeps feature truth detached from execution so discovery, documentation, UI, tests, and future agents all drink from one grade.
 */

import { HOD_AUDIO_FEATURES } from './AudioFeatureData.js';
import { CHOCHMAH_CAMERA_FEATURES } from './CameraFeatureData.js';
import { TIFERES_CHARACTER_FEATURES } from './CharacterFeatureData.js';
import { MALCHUS_DIALOGUE_FEATURES } from './DialogueFeatureData.js';
import { BINAH_DOCUMENT_FEATURES } from './DocumentFeatureData.js';
import { HOD_EVENT_FEATURES } from './EventFeatureData.js';
import { YESOD_EXPORT_FEATURES } from './ExportFeatureData.js';
import { GEVURAH_GPU_FEATURES } from './GpuFeatureData.js';
import { YESOD_MEDIA_FEATURES } from './MediaFeatureData.js';
import { KETER_OBJECT_FEATURES } from './ObjectFeatureData.js';
import { TIFERES_PERFORMANCE_FEATURES } from './PerformanceFeatureData.js';
import { GEVURAH_PREFLIGHT_FEATURES } from './PreflightFeatureData.js';
import { MALCHUS_PROJECT_FEATURES } from './ProjectFeatureData.js';
import { TIFERES_RENDER_FEATURES } from './RenderFeatureData.js';
import { MALCHUS_SCENE_FEATURES } from './SceneFeatureData.js';
import { DAAS_SCHEMA_FEATURES } from './SchemaFeatureData.js';
import { KETER_SYSTEM_FEATURES } from './SystemFeatureData.js';
import { YESOD_TEXTURE_FEATURES } from './TextureFeatureData.js';
import { NETZACH_TIMELINE_FEATURES } from './TimelineFeatureData.js';
import { MALCHUS_TRANSACTION_FEATURES } from './TransactionFeatureData.js';
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
	...MALCHUS_SCENE_FEATURES,
	...BINAH_DOCUMENT_FEATURES,
	...YESOD_EXPORT_FEATURES,
	...NETZACH_TIMELINE_FEATURES,
	...YESOD_WORLD_FEATURES,
	...KETER_OBJECT_FEATURES,
	...YESOD_TEXTURE_FEATURES,
	...GEVURAH_GPU_FEATURES,
	...TIFERES_RENDER_FEATURES,
	...DAAS_SCHEMA_FEATURES,
	...HOD_EVENT_FEATURES,
	...MALCHUS_TRANSACTION_FEATURES,
	...GEVURAH_PREFLIGHT_FEATURES
]);

/** Canonical feature registry independent from executable command topology. */
export class DaasAnimatorFeatureRegistry {
	/** @returns {object[]} Public and environment-gated detached features. */
	static publicFeatures() {
		return OR_FEATURES
			.filter((keli) => (
				['public', 'environment-gated'].includes(keli.exposure)
			))
			.map((keli) => structuredClone(keli));
	}

	/** @returns {object[]} Every detached feature descriptor. */
	static all() {
		return OR_FEATURES.map((keli) => structuredClone(keli));
	}

	/** @param {string} sodFeatureId Feature ID. @returns {object|null} Detached descriptor. */
	static get(sodFeatureId) {
		const keliFeature = OR_FEATURES.find((keli) => (
			keli.id === sodFeatureId
		));
		return keliFeature ? structuredClone(keliFeature) : null;
	}

	/** @param {string} shemFamily Family. @returns {object[]} Detached family features. */
	static family(shemFamily) {
		return OR_FEATURES
			.filter((keli) => keli.family === shemFamily)
			.map((keli) => structuredClone(keli));
	}

	/** @returns {string[]} Stable feature IDs. */
	static ids() {
		return OR_FEATURES.map((keli) => keli.id);
	}
}
