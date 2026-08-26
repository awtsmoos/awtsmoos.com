//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AudioCreationCommandSchemas.js
 * @description
 * The Awtsmoos lets voice and impact enter audible time through explicit runtime gates rather than hidden browser assumptions;
 * Awtsmoos.com declares speech and real footstep synthesis separately so agents can inspect requirements before sound begins.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function creationCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'audio',
		features: ['audio.creation'],
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const HOD_AUDIO_CREATION_COMMANDS = Object.freeze([
	creationCommand({
		name: 'audio.capabilities',
		features: ['audio.creation', 'audio.analysis'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: OBJECT,
		description: 'Inspect real speech, foley, duration, waveform, and unsupported wind capability.',
		example: {
			command: 'audio.capabilities',
			payload: {}
		}
	}),
	creationCommand({
		name: 'audio.voices',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		environment: {
			browser: true,
			speechSynthesis: true
		},
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'List JSON-safe browser speech voices.',
		example: {
			command: 'audio.voices',
			payload: {}
		}
	}),
	creationCommand({
		name: 'audio.speak',
		mutation: false,
		mutationScope: 'runtime',
		idempotent: false,
		risk: 'transient',
		environment: {
			browser: true,
			speechSynthesis: true
		},
		payloadSchema: S.object(
			{
				text: S.string({ minLength: 1 }),
				options: OBJECT
			},
			{ required: ['text'] }
		),
		description: 'Speak text through browser synthesis with optional voice, pitch, rate, and volume.',
		example: {
			command: 'audio.speak',
			payload: {
				text: 'The doorway is opening.',
				options: { rate: 1 }
			}
		}
	}),
	creationCommand({
		name: 'audio.foleyStep',
		mutation: false,
		mutationScope: 'runtime',
		idempotent: false,
		risk: 'transient',
		environment: {
			browser: true,
			audioContext: true
		},
		payloadSchema: S.object({
			intensity: S.number({ minimum: 0, maximum: 2 }),
			soundX: S.number(),
			cameraX: S.number(),
			zoom: S.number({ minimum: 0.01 })
		}),
		description: 'Synthesize one real spatial footstep thud through the existing FoleySynth.',
		example: {
			command: 'audio.foleyStep',
			payload: {
				intensity: 0.8,
				soundX: -2,
				cameraX: 0,
				zoom: 1
			}
		}
	})
]);
