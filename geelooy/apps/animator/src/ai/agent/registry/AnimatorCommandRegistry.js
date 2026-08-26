//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRegistry.js
 * @description
 * The Awtsmoos gathers acting, character, camera, dialogue, audio, media, timeline, history, transport, and world into public law;
 * Awtsmoos.com keeps descriptor truth detached and queryable so validators, handlers, docs, UI, and agents all drink from one draw.
 */

import { NETZACH_ANIMATION_COMMANDS } from '../schema/AnimationCommandSchemas.js';
import { HOD_AUDIO_COMMANDS } from '../schema/AudioCommandSchemas.js';
import { CHOCHMAH_CAMERA_COMMANDS } from '../schema/CameraCommandSchemas.js';
import { TIFERES_CHARACTER_COMMANDS } from '../schema/CharacterCommandSchemas.js';
import { MALCHUS_DIALOGUE_DIRECTION_COMMANDS } from '../schema/DialogueDirectionCommandSchemas.js';
import { YESOD_DIALOGUE_RECORDING_COMMANDS } from '../schema/DialogueRecordingCommandSchemas.js';
import { GEVURAH_HISTORY_COMMANDS } from '../schema/HistoryCommandSchemas.js';
import { YESOD_MEDIA_COMMANDS } from '../schema/MediaCommandSchemas.js';
import { NETZACH_PLAYBACK_COMMANDS } from '../schema/PlaybackCommandSchemas.js';
import { TIFERES_PERFORMANCE_COMMANDS } from '../schema/PerformanceCommandSchemas.js';
import { MALCHUS_PROJECT_COMMANDS } from '../schema/ProjectCommandSchemas.js';
import { KETER_SYSTEM_COMMANDS } from '../schema/SystemCommandSchemas.js';
import { NETZACH_TIMELINE_CLIP_COMMANDS } from '../schema/TimelineClipCommandSchemas.js';
import { HOD_TIMELINE_EDITOR_COMMANDS } from '../schema/TimelineEditorCommandSchemas.js';
import { YESOD_WORLD_COMMANDS } from '../schema/WorldCommandSchemas.js';

const OR_COMMANDS = Object.freeze([
	...KETER_SYSTEM_COMMANDS,
	...MALCHUS_PROJECT_COMMANDS,
	...TIFERES_PERFORMANCE_COMMANDS,
	...TIFERES_CHARACTER_COMMANDS,
	...CHOCHMAH_CAMERA_COMMANDS,
	...MALCHUS_DIALOGUE_DIRECTION_COMMANDS,
	...YESOD_DIALOGUE_RECORDING_COMMANDS,
	...HOD_AUDIO_COMMANDS,
	...YESOD_MEDIA_COMMANDS,
	...NETZACH_ANIMATION_COMMANDS,
	...NETZACH_TIMELINE_CLIP_COMMANDS,
	...HOD_TIMELINE_EDITOR_COMMANDS,
	...GEVURAH_HISTORY_COMMANDS,
	...NETZACH_PLAYBACK_COMMANDS,
	...YESOD_WORLD_COMMANDS
]);

/** Canonical descriptor registry for every public Animator Agent command. */
export class DaasAnimatorCommandRegistry {
	/** @returns {object[]} Detached descriptors safe for public discovery. */
	static all() {
		return OR_COMMANDS.map((keli) => structuredClone(keli));
	}

	/** @param {string} shemMitzvah Stable command name. @returns {object|null} Detached descriptor. */
	static get(shemMitzvah) {
		const keli = OR_COMMANDS.find((candidate) => candidate.name === shemMitzvah);
		return keli ? structuredClone(keli) : null;
	}

	/** @param {string} shemMitzvah Stable command name. @returns {boolean} True when published. */
	static supports(shemMitzvah) {
		return OR_COMMANDS.some((keli) => keli.name === shemMitzvah);
	}

	/** @param {string} shemFamily Family name. @returns {object[]} Detached family descriptors. */
	static family(shemFamily) {
		return OR_COMMANDS
			.filter((keli) => keli.family === shemFamily)
			.map((keli) => structuredClone(keli));
	}

	/** @returns {string[]} Stable command names in registry order. */
	static names() {
		return OR_COMMANDS.map((keli) => keli.name);
	}
}
