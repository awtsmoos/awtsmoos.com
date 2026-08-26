//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CharacterCommandSchemas.js
 * @description
 * The Awtsmoos lets identity, family, design, and acting become explicit data contracts before any scene must change;
 * Awtsmoos.com keeps every character command pure in this wave, so creative exploration remains safe, typed, and arranged.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function characterCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'character',
		mutation: false,
		mutationScope: 'none',
		risk: 'read',
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const TIFERES_CHARACTER_COMMANDS = Object.freeze([
	characterCommand({
		name: 'character.capabilities', features: ['character.authoring', 'character.performance'], idempotent: true,
		payloadSchema: OBJECT, description: 'Discover detached character design and performance-planning capabilities.',
		example: { command: 'character.capabilities', payload: {} }
	}),
	characterCommand({
		name: 'character.presets', features: ['character.authoring'], idempotent: true,
		payloadSchema: OBJECT, description: 'List complete built-in human preset specifications.',
		example: { command: 'character.presets', payload: {} }
	}),
	characterCommand({
		name: 'character.createPreset', features: ['character.authoring'], idempotent: true,
		payloadSchema: S.object({ preset: S.string({ minLength: 1 }), overrides: OBJECT }, { required: ['preset'] }),
		description: 'Build one detached human specification from a named preset plus overrides.',
		example: { command: 'character.createPreset', payload: { preset: 'speaker', overrides: {} } }
	}),
	characterCommand({
		name: 'character.family', features: ['character.authoring'], idempotent: true,
		payloadSchema: S.object({ seed: S.string() }), description: 'Generate a deterministic original character family with stable perspective views.',
		example: { command: 'character.family', payload: { seed: 'episode-7-family' } }
	}),
	characterCommand({
		name: 'character.references', features: ['character.authoring'], idempotent: true,
		payloadSchema: OBJECT, description: 'List canonical reference characters with detached character and design data.',
		example: { command: 'character.references', payload: {} }
	}),
	characterCommand({
		name: 'character.proposeDesign', features: ['character.authoring'], idempotent: false,
		payloadSchema: S.object({ prompt: S.string({ minLength: 1 }), current: OBJECT }, { required: ['prompt'] }),
		description: 'Produce a validated character design proposal using a connected provider or deterministic local fallback.',
		example: { command: 'character.proposeDesign', payload: { prompt: 'A gentle inventor with a long coat.', current: {} } }
	}),
	characterCommand({
		name: 'character.composePerformance', features: ['character.performance'], idempotent: true,
		payloadSchema: S.object({ data: OBJECT, view: OBJECT, time: S.number({ minimum: 0 }), world: OBJECT }, { required: ['data'] }),
		description: 'Compose layered renderer-facing body, face, gaze, gesture, locomotion, and speech pose data.',
		example: { command: 'character.composePerformance', payload: { data: { emotion: 'curious', gesture: 'explain' }, time: 0 } }
	})
]);
