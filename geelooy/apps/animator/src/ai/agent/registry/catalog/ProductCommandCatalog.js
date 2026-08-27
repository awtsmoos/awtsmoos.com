// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProductCommandCatalog.js
 * @description
 * The Awtsmoos gathers the mature production families into one catalog while universal platform commands remain free to grow elsewhere;
 * Awtsmoos.com keeps product editing law modular so new schema/render powers do not bury character, camera, timeline, and media care.
 */

import { NETZACH_ANIMATION_COMMANDS } from '../../schema/AnimationCommandSchemas.js';
import { HOD_AUDIO_COMMANDS } from '../../schema/AudioCommandSchemas.js';
import { CHOCHMAH_CAMERA_COMMANDS } from '../../schema/CameraCommandSchemas.js';
import { TIFERES_CHARACTER_COMMANDS } from '../../schema/CharacterCommandSchemas.js';
import { MALCHUS_DIALOGUE_DIRECTION_COMMANDS } from '../../schema/DialogueDirectionCommandSchemas.js';
import { YESOD_DIALOGUE_RECORDING_COMMANDS } from '../../schema/DialogueRecordingCommandSchemas.js';
import { BINAH_DOCUMENT_COMMANDS } from '../../schema/DocumentCommandSchemas.js';
import { YESOD_EXPORT_COMMANDS } from '../../schema/ExportCommandSchemas.js';
import { GEVURAH_HISTORY_COMMANDS } from '../../schema/HistoryCommandSchemas.js';
import { YESOD_MEDIA_COMMANDS } from '../../schema/MediaCommandSchemas.js';
import { NETZACH_PLAYBACK_COMMANDS } from '../../schema/PlaybackCommandSchemas.js';
import { TIFERES_PERFORMANCE_COMMANDS } from '../../schema/PerformanceCommandSchemas.js';
import { MALCHUS_PROJECT_COMMANDS } from '../../schema/ProjectCommandSchemas.js';
import { MALCHUS_SCENE_COMMANDS } from '../../schema/SceneCommandSchemas.js';
import { KETER_SYSTEM_COMMANDS } from '../../schema/SystemCommandSchemas.js';
import { NETZACH_TIMELINE_CLIP_COMMANDS } from '../../schema/TimelineClipCommandSchemas.js';
import { HOD_TIMELINE_EDITOR_COMMANDS } from '../../schema/TimelineEditorCommandSchemas.js';
import { YESOD_WORLD_COMMANDS } from '../../schema/WorldCommandSchemas.js';

/** Stable production command descriptors predating universal schema/render families. */
export const OR_PRODUCT_COMMANDS = Object.freeze([
	...KETER_SYSTEM_COMMANDS,
	...MALCHUS_PROJECT_COMMANDS,
	...TIFERES_PERFORMANCE_COMMANDS,
	...TIFERES_CHARACTER_COMMANDS,
	...CHOCHMAH_CAMERA_COMMANDS,
	...MALCHUS_DIALOGUE_DIRECTION_COMMANDS,
	...YESOD_DIALOGUE_RECORDING_COMMANDS,
	...HOD_AUDIO_COMMANDS,
	...YESOD_MEDIA_COMMANDS,
	...MALCHUS_SCENE_COMMANDS,
	...BINAH_DOCUMENT_COMMANDS,
	...YESOD_EXPORT_COMMANDS,
	...NETZACH_ANIMATION_COMMANDS,
	...NETZACH_TIMELINE_CLIP_COMMANDS,
	...HOD_TIMELINE_EDITOR_COMMANDS,
	...GEVURAH_HISTORY_COMMANDS,
	...NETZACH_PLAYBACK_COMMANDS,
	...YESOD_WORLD_COMMANDS
]);
