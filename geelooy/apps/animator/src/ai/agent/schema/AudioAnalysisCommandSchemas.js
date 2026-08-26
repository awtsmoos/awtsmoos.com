//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AudioAnalysisCommandSchemas.js
 * @description
 * The Awtsmoos lets hidden duration and pressure-wave shape become finite evidence without persisting raw decoded sound;
 * Awtsmoos.com names in-process media requirements openly so waveform and timing analysis remain honest and bounded.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function analysisCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'audio',
		features: ['audio.analysis'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const HOD_AUDIO_ANALYSIS_COMMANDS = Object.freeze([
	analysisCommand({
		name: 'audio.measureDuration',
		environment: {
			browser: true,
			inProcessMedia: true
		},
		payloadSchema: S.object(
			{
				source: OBJECT,
				url: S.string()
			},
			{ required: ['source'] }
		),
		description: 'Measure real audio duration from an in-process Blob with browser metadata fallback.',
		example: {
			command: 'audio.measureDuration',
			payload: {
				source: { transport: 'Blob' }
			}
		}
	}),
	analysisCommand({
		name: 'audio.waveform',
		environment: {
			audioContext: true,
			inProcessMedia: true
		},
		payloadSchema: S.object(
			{
				source: OBJECT,
				buckets: S.number({ minimum: 16, maximum: 256 })
			},
			{ required: ['source'] }
		),
		description: 'Decode in-process audio into bounded min/max waveform buckets.',
		example: {
			command: 'audio.waveform',
			payload: {
				source: { transport: 'Blob' },
				buckets: 96
			}
		}
	})
]);
