//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DialogueRecordingCommandSchemas.js
 * @description
 * The Awtsmoos lets human voice cross permission, capture, persistence, retiming, playback, and clearing through declared gates;
 * Awtsmoos.com names every side effect honestly so microphone and document mutation never hide beneath innocent shapes.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const CLIP = S.object({ clipId: S.string({ minLength: 1 }) }, { required: ['clipId'] });
const RUNTIME = { browser: true, animatorRuntime: true };

function recordingCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'dialogue',
		features: ['dialogue.recording'],
		since: '1.5.0',
		resultSchema: S.object(),
		...keliInput
	});
}

export const YESOD_DIALOGUE_RECORDING_COMMANDS = Object.freeze([
	recordingCommand({
		name: 'dialogue.recordingStatus',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: CLIP,
		description: 'Inspect one dialogue clip recording binding and live telemetry.',
		example: { command: 'dialogue.recordingStatus', payload: { clipId: 'dialogue_1' } }
	}),
	recordingCommand({
		name: 'dialogue.recordStart',
		mutation: false,
		mutationScope: 'media',
		idempotent: false,
		risk: 'permission',
		environment: { ...RUNTIME, microphone: true },
		payloadSchema: CLIP,
		description: 'Request microphone access and begin a live voice take for one dialogue clip.',
		example: { command: 'dialogue.recordStart', payload: { clipId: 'dialogue_1' } }
	}),
	recordingCommand({
		name: 'dialogue.recordStop',
		mutation: true,
		mutationScope: 'document',
		idempotent: false,
		risk: 'mutation',
		environment: RUNTIME,
		payloadSchema: S.object(),
		description: 'Stop capture, persist the take, bind it to dialogue, and ripple-retime through existing NLE services.',
		example: { command: 'dialogue.recordStop', payload: {} }
	}),
	recordingCommand({
		name: 'dialogue.playRecording',
		mutation: false,
		mutationScope: 'runtime',
		idempotent: false,
		risk: 'transient',
		environment: RUNTIME,
		payloadSchema: CLIP,
		description: 'Play one persisted dialogue recording through the shared recording session.',
		example: { command: 'dialogue.playRecording', payload: { clipId: 'dialogue_1' } }
	}),
	recordingCommand({
		name: 'dialogue.clearRecording',
		mutation: true,
		mutationScope: 'document',
		idempotent: true,
		risk: 'mutation',
		environment: RUNTIME,
		payloadSchema: CLIP,
		description: 'Detach one recorded take using the existing undo-aware dialogue retiming path.',
		example: { command: 'dialogue.clearRecording', payload: { clipId: 'dialogue_1' } }
	})
]);
