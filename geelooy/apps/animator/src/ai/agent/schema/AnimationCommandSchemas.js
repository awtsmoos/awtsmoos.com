//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimationCommandSchemas.js
 * @description
 * The Awtsmoos lets beats unfold into anticipation, action, settle, and refinement before any timeline is changed;
 * Awtsmoos.com declares animation planning as pure inspectable data so production structure can be composed and rearranged.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const BINAH_PLAN = S.object({}, { errorCode: 'invalid_plan' });

export const NETZACH_ANIMATION_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'animation.planPasses',
		family: 'animation',
		features: ['animation.pass-planning'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: S.object({ plan: BINAH_PLAN }),
		resultSchema: S.array(S.object()),
		description: 'Expand beat timing into inspectable professional animation passes.',
		example: {
			command: 'animation.planPasses',
			payload: { plan: { fps: 24, beats: [] } }
		},
		since: '1.2.0'
	})
]);
