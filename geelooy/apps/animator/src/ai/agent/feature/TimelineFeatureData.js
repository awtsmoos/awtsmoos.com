//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TimelineFeatureData.js
 * @description
 * The Awtsmoos spreads authored time into clips, history, selection, and transport across one editable line;
 * Awtsmoos.com declares the whole NLE covenant as product features, so missing transport powers remain visible until they truly shine.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

const TIMELINE_COMMANDS = Object.freeze([
	'timeline.snapshot', 'timeline.addClip', 'timeline.moveClip', 'timeline.trimClip',
	'timeline.splitClip', 'timeline.duplicateClip', 'timeline.deleteClip',
	'timeline.rippleDelete', 'timeline.copyClip', 'timeline.pasteClip',
	'timeline.updateTransform', 'timeline.addTransformKeyframe', 'timeline.selectClip',
	'timeline.selectEntity', 'timeline.scrub', 'timeline.toggleTrack'
]);

export const NETZACH_TIMELINE_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'timeline.editing',
		label: 'Timeline editing',
		description: 'Inspect and edit clips, transforms, keyframes, selection, clipboard, playhead, and track state.',
		family: 'timeline',
		exposure: 'public',
		commands: TIMELINE_COMMANDS,
		backingModules: ['src/nle/core/NLECommands.js', 'src/nle/logic/ClipboardManager.js'],
		relatedFeatureIds: ['history.undo-redo', 'playback.transport'],
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'history.undo-redo',
		label: 'Project undo and redo',
		description: 'Inspect and traverse bounded project history while preserving transient editor workspace.',
		family: 'history',
		exposure: 'public',
		commands: ['history.status', 'history.undo', 'history.redo'],
		backingModules: ['src/nle/core/NLEStore.js', 'src/nle/core/NLEProjectHistoryCoordinator.js'],
		relatedFeatureIds: ['timeline.editing'],
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'playback.transport',
		label: 'Playback transport',
		description: 'Inspect, seek, play, and pause the real Animator transport without faking director state.',
		family: 'playback',
		exposure: 'public',
		commands: ['playback.state', 'playback.seek', 'playback.play', 'playback.pause'],
		backingModules: ['src/nle/core/playback/PlaybackEngine.js', 'src/nle/core/NLECommands.js'],
		relatedFeatureIds: ['timeline.editing'],
		since: '1.5.0'
	})
]);
