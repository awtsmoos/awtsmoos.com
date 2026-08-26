//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TimelineClipCommandSchemas.js
 * @description
 * The Awtsmoos divides authored time into clips whose identities may move, split, echo, or return to silence;
 * Awtsmoos.com declares each lifecycle deed with explicit document/editor scope so automation stays powerful without violence.
 */

import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';
import { BinahTimelineSchemaFactory as F } from './TimelineSchemaFactory.js';

export const NETZACH_TIMELINE_CLIP_COMMANDS = Object.freeze([
	F.command({
		name: 'timeline.addClip',
		mutation: true,
		mutationScope: 'document',
		idempotent: false,
		risk: 'mutation',
		payloadSchema: S.object({ clip: F.object() }, { required: ['clip'] }),
		description: 'Add and select one normalized clip through the canonical NLE command path.',
		example: { command: 'timeline.addClip', payload: { clip: { trackId: 'track_action', start: 0, duration: 1200 } } }
	}),
	F.command({
		name: 'timeline.moveClip', mutation: true, mutationScope: 'document', idempotent: true, risk: 'mutation',
		payloadSchema: F.idPayload({ start: S.number({ minimum: 0 }), trackId: S.string() }, ['id', 'start']),
		description: 'Move one clip to an absolute start and optional destination track.',
		example: { command: 'timeline.moveClip', payload: { id: 'clip_1', start: 1800 } }
	}),
	F.command({
		name: 'timeline.trimClip', mutation: true, mutationScope: 'document', idempotent: true, risk: 'mutation',
		payloadSchema: F.idPayload({ duration: S.number({ minimum: 100 }) }, ['id', 'duration']),
		description: 'Trim one clip while preserving the NLE minimum editable duration.',
		example: { command: 'timeline.trimClip', payload: { id: 'clip_1', duration: 900 } }
	}),
	F.command({
		name: 'timeline.splitClip', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		payloadSchema: F.idPayload({ time: S.number({ minimum: 0 }) }),
		description: 'Split one clip at the requested absolute time or current playhead.',
		example: { command: 'timeline.splitClip', payload: { id: 'clip_1', time: 600 } }
	}),
	F.command({
		name: 'timeline.duplicateClip', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		payloadSchema: F.idPayload({ offset: S.number({ minimum: 0 }) }),
		description: 'Duplicate one clip with a fresh identity and optional offset.',
		example: { command: 'timeline.duplicateClip', payload: { id: 'clip_1', offset: 100 } }
	}),
	F.command({
		name: 'timeline.deleteClip', mutation: true, mutationScope: 'document', idempotent: true, risk: 'mutation',
		payloadSchema: F.idPayload(),
		description: 'Delete one clip without moving neighboring material.',
		example: { command: 'timeline.deleteClip', payload: { id: 'clip_1' } }
	}),
	F.command({
		name: 'timeline.rippleDelete', mutation: true, mutationScope: 'document', idempotent: true, risk: 'mutation',
		payloadSchema: F.idPayload(),
		description: 'Delete one clip and close its gap on the same track.',
		example: { command: 'timeline.rippleDelete', payload: { id: 'clip_1' } }
	}),
	F.command({
		name: 'timeline.copyClip', mutation: false, mutationScope: 'editor', idempotent: true, risk: 'transient',
		payloadSchema: F.idPayload(),
		description: 'Copy one detached clip into the Agent timeline clipboard.',
		example: { command: 'timeline.copyClip', payload: { id: 'clip_1' } }
	}),
	F.command({
		name: 'timeline.pasteClip', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		payloadSchema: S.object({ overrides: F.object() }),
		description: 'Paste the Agent clipboard as a fresh NLE clip with optional overrides.',
		example: { command: 'timeline.pasteClip', payload: { overrides: { start: 2400 } } }
	})
]);
