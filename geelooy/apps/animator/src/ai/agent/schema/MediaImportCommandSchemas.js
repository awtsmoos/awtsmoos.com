//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MediaImportCommandSchemas.js
 * @description
 * The Awtsmoos lets chosen footage cross into persistent project memory through one shared live NLE service and no rival store;
 * Awtsmoos.com marks media mutation and in-process transport plainly so an agent knows exactly which side effects it asks for.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

export const YESOD_MEDIA_IMPORT_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'media.importVideo',
		family: 'media',
		features: ['media.assets'],
		mutation: true,
		mutationScope: 'media',
		idempotent: false,
		risk: 'mutation',
		environment: {
			browser: true,
			animatorRuntime: true,
			inProcessMedia: true
		},
		since: '1.5.0',
		payloadSchema: S.object(
			{ source: OBJECT },
			{ required: ['source'] }
		),
		resultSchema: OBJECT,
		description: 'Persist and manifest an in-process video through the shared NLE VideoImportService.',
		example: {
			command: 'media.importVideo',
			payload: {
				source: { transport: 'File' }
			}
		}
	})
]);
