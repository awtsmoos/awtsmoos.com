//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HistoryCommandSchemas.js
 * @description
 * The Awtsmoos gives deliberate change a memory and a return while transient workspace remains free;
 * Awtsmoos.com declares history inspection apart from undo and redo document mutations so agents can reason before decree.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

function historyCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'history',
		features: ['history.undo-redo'],
		since: '1.5.0',
		payloadSchema: S.object(),
		resultSchema: S.object(),
		...keliInput
	});
}

export const GEVURAH_HISTORY_COMMANDS = Object.freeze([
	historyCommand({
		name: 'history.status', mutation: false, mutationScope: 'none', idempotent: true, risk: 'read',
		description: 'Inspect bounded undo and redo availability.',
		example: { command: 'history.status', payload: {} }
	}),
	historyCommand({
		name: 'history.undo', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		description: 'Restore the previous durable project snapshot while preserving transient workspace.',
		example: { command: 'history.undo', payload: {} }
	}),
	historyCommand({
		name: 'history.redo', mutation: true, mutationScope: 'document', idempotent: false, risk: 'mutation',
		description: 'Restore the next durable project snapshot while preserving transient workspace.',
		example: { command: 'history.redo', payload: {} }
	})
]);
