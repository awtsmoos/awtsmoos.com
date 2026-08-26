//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaybackCommandSchemas.js
 * @description
 * The Awtsmoos recreates every instant while transport commands let authored time flow, rest, and seek with measured intent;
 * Awtsmoos.com marks runtime transport as a side effect and binds play/pause to the real Director rather than counterfeit state.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

function playbackCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'playback',
		features: ['playback.transport'],
		mutation: false,
		mutationScope: keliInput.mutationScope ?? 'runtime',
		since: '1.5.0',
		payloadSchema: S.object(),
		resultSchema: S.object(),
		...keliInput
	});
}

export const NETZACH_PLAYBACK_COMMANDS = Object.freeze([
	playbackCommand({
		name: 'playback.state',
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		description: 'Inspect real Director transport state when installed, with a store fallback for isolated contexts.',
		example: { command: 'playback.state', payload: {} }
	}),
	playbackCommand({
		name: 'playback.seek',
		idempotent: true,
		risk: 'transient',
		payloadSchema: S.object({ time: S.number({ minimum: 0 }) }, { required: ['time'] }),
		description: 'Seek both the NLE playhead and live Animator Director to one absolute time.',
		example: { command: 'playback.seek', payload: { time: 2200 } }
	}),
	playbackCommand({
		name: 'playback.play',
		idempotent: false,
		risk: 'transient',
		environment: { animatorRuntime: true },
		description: 'Start or resume the active sequence through the live Animator Director.',
		example: { command: 'playback.play', payload: {} }
	}),
	playbackCommand({
		name: 'playback.pause',
		idempotent: true,
		risk: 'transient',
		environment: { animatorRuntime: true },
		description: 'Pause the live Animator Director while preserving its elapsed position.',
		example: { command: 'playback.pause', payload: {} }
	})
]);
