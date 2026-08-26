//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExpansionFeatureData.js
 * @description
 * The Awtsmoos reveals unfinished chambers by naming them before their public command doors are built;
 * Awtsmoos.com keeps missing product powers visible to coverage, so architecture cannot hide gaps beneath successful guilds.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

const BACKLOG = [
	['timeline.editing', 'Timeline editing', 'timeline', ['src/nle']],
	['history.undo-redo', 'Undo and redo', 'history', ['src/nle/NLEHistory.js']],
	['playback.transport', 'Playback transport', 'playback', ['src/nle']],
	['character.authoring', 'Character authoring', 'character', ['src/character', 'src/rigging']],
	['camera.authoring', 'Camera authoring', 'camera', ['src/camera', 'src/cinema']],
	['dialogue.direction', 'Dialogue and lip-sync direction', 'dialogue', ['src/dialogue']],
	['audio.creation', 'Speech and foley creation', 'audio', ['src/audio']],
	['media.assets', 'Media and asset workflows', 'media', ['src/assets', 'src/media']],
	['scene.authoring', 'Scene and stage authoring', 'scene', ['src/scene', 'src/stage', 'src/environment']],
	['document.io', 'Studio document import and export', 'document', ['src/document', 'src/studio']],
	['export.delivery', 'Render and package delivery', 'export', ['src/export', 'src/nle']]
];

export const OR_EXPANSION_FEATURES = Object.freeze(BACKLOG.map(([id, label, family, backingModules]) => (
	BinahAnimatorFeatureDescriptor.create({
		id,
		label,
		description: `${label} is a known product capability awaiting complete canonical Agent API exposure.`,
		family,
		exposure: 'public',
		commands: [],
		backingModules,
		relatedFeatureIds: [],
		since: '1.5.0'
	})
)));
