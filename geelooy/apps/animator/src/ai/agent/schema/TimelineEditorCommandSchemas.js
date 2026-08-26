//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TimelineEditorCommandSchemas.js
 * @description
 * The Awtsmoos lets inspection, selection, transform, keyframe, playhead, and track state remain distinct forms of editor motion;
 * Awtsmoos.com declares which changes touch the document and which touch only the workspace, so agent power follows honest devotion.
 */

import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';
import { BinahTimelineSchemaFactory as F } from './TimelineSchemaFactory.js';

export const HOD_TIMELINE_EDITOR_COMMANDS = Object.freeze([
	F.command({
		name: 'timeline.snapshot', mutation: false, mutationScope: 'none', idempotent: true, risk: 'read',
		payloadSchema: F.object(),
		description: 'Inspect tracks, clips, keyframes, playhead, snap, and selection as detached timeline data.',
		example: { command: 'timeline.snapshot', payload: {} }
	}),
	F.command({
		name: 'timeline.updateTransform', mutation: true, mutationScope: 'document', idempotent: true, risk: 'mutation',
		payloadSchema: F.idPayload({ property: S.string({ minLength: 1 }), value: S.number() }, ['id', 'property', 'value']),
		description: 'Update one numeric transform property on a clip through NLE transform commands.',
		example: { command: 'timeline.updateTransform', payload: { id: 'clip_1', property: 'x', value: 120 } }
	}),
	F.command({
		name: 'timeline.addTransformKeyframe', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		payloadSchema: F.idPayload({ time: S.number({ minimum: 0 }) }),
		description: 'Capture the complete current clip transform as a timeline keyframe.',
		example: { command: 'timeline.addTransformKeyframe', payload: { id: 'clip_1', time: 900 } }
	}),
	F.command({
		name: 'timeline.selectClip', mutation: false, mutationScope: 'editor', idempotent: true, risk: 'transient',
		payloadSchema: S.object({ id: S.string() }),
		description: 'Select one clip, or clear clip selection when id is omitted.',
		example: { command: 'timeline.selectClip', payload: { id: 'clip_1' } }
	}),
	F.command({
		name: 'timeline.selectEntity', mutation: false, mutationScope: 'editor', idempotent: true, risk: 'transient',
		payloadSchema: S.object({ id: S.string() }),
		description: 'Select one scene entity, or clear entity selection when id is omitted.',
		example: { command: 'timeline.selectEntity', payload: { id: 'actor_1' } }
	}),
	F.command({
		name: 'timeline.scrub', mutation: false, mutationScope: 'runtime', idempotent: true, risk: 'transient',
		payloadSchema: S.object({ time: S.number({ minimum: 0 }) }, { required: ['time'] }),
		description: 'Move the NLE playhead without creating project-history noise.',
		example: { command: 'timeline.scrub', payload: { time: 1500 } }
	}),
	F.command({
		name: 'timeline.toggleTrack', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		payloadSchema: S.object({
			id: S.string({ minLength: 1 }),
			property: S.string({ enum: ['muted', 'locked'] })
		}, { required: ['id', 'property'] }),
		description: 'Toggle one track muted or locked state through the existing NLE command facade.',
		example: { command: 'timeline.toggleTrack', payload: { id: 'track_action', property: 'locked' } }
	})
]);
