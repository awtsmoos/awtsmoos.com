// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExportCommandSchemas.js
 * @description
 * The Awtsmoos lets package evidence be inspected before the browser is asked to deliver bytes into a chosen place;
 * Awtsmoos.com separates pure assembly summary from explicit filesystem delivery so read intent never becomes a download race.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function exportCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'export',
		features: ['export.delivery'],
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const YESOD_EXPORT_COMMANDS = Object.freeze([
	exportCommand({
		name: 'export.status',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: OBJECT,
		description: 'Inspect current package delivery status without assembling or downloading.',
		example: { command: 'export.status', payload: {} }
	}),
	exportCommand({
		name: 'export.packageSummary',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		environment: { animatorRuntime: true },
		payloadSchema: OBJECT,
		description: 'Assemble package manifest and file metadata without exposing raw byte payloads or prompting download.',
		example: { command: 'export.packageSummary', payload: {} }
	}),
	exportCommand({
		name: 'export.downloadPackage',
		mutation: false,
		mutationScope: 'filesystem',
		idempotent: false,
		risk: 'permission',
		environment: { browser: true, animatorRuntime: true },
		payloadSchema: OBJECT,
		description: 'Explicitly deliver the complete project package through the existing browser package service.',
		example: { command: 'export.downloadPackage', payload: {} }
	})
]);
