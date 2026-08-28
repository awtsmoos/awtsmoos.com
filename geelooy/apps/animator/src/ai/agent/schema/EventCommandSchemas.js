// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EventCommandSchemas.js
 * @description
 * The Awtsmoos lets clients discover event names and payload contracts through JSON before choosing to attach a JavaScript listener;
 * Awtsmoos.com keeps subscription functions outside command payloads while registry discovery remains transport-safe and clear.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

export const HOD_EVENT_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'event.list',
		family: 'event',
		features: ['event.subscriptions'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'List every observable Animator event contract available to JavaScript subscribers.',
		example: { command: 'event.list', payload: {} }
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'event.get',
		family: 'event',
		features: ['event.subscriptions'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		payloadSchema: S.object(
			{ name: S.string({ minLength: 1 }) },
			{ required: ['name'] }
		),
		resultSchema: OBJECT,
		description: 'Read one detached event descriptor by stable event name.',
		example: { command: 'event.get', payload: { name: 'selection.changed' } }
	})
]);
