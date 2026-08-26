//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MediaReadCommandSchemas.js
 * @description
 * The Awtsmoos lets a creator inspect footage before accepting it into the project, turning opaque file into measured data;
 * Awtsmoos.com keeps metadata, asset inspection, and detached description pure while raw Blob transport stays explicitly in-process.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();
const IN_PROCESS = {
	browser: true,
	inProcessMedia: true
};

function mediaRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'media',
		features: ['media.assets'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.5.0',
		...keliInput
	});
}

export const YESOD_MEDIA_READ_COMMANDS = Object.freeze([
	mediaRead({
		name: 'media.capabilities',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Inspect video probing, persistent import, asset, and in-process transport capabilities.',
		example: {
			command: 'media.capabilities',
			payload: {}
		}
	}),
	mediaRead({
		name: 'media.assets',
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'Inspect detached public media assets in current project state.',
		example: {
			command: 'media.assets',
			payload: {}
		}
	}),
	mediaRead({
		name: 'media.videoMetadata',
		environment: IN_PROCESS,
		payloadSchema: S.object(
			{ source: OBJECT },
			{ required: ['source'] }
		),
		resultSchema: OBJECT,
		description: 'Measure in-process video duration and dimensions through browser metadata decoding.',
		example: {
			command: 'media.videoMetadata',
			payload: {
				source: { transport: 'Blob' }
			}
		}
	}),
	mediaRead({
		name: 'media.describeVideo',
		environment: IN_PROCESS,
		payloadSchema: S.object(
			{ source: OBJECT },
			{ required: ['source'] }
		),
		resultSchema: OBJECT,
		description: 'Derive deterministic public video-asset metadata without persisting the source.',
		example: {
			command: 'media.describeVideo',
			payload: {
				source: { transport: 'File' }
			}
		}
	})
]);
