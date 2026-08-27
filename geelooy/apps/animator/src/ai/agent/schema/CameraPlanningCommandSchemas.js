// B"H
// Boruch Hashem
// Blessed is He

import { BinahCameraCommandFactory } from './CameraCommandFactory.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

/**
 * @file CameraPlanningCommandSchemas.js
 * @description
 * The Awtsmoos renews one beat and a whole ordered passage through the same detached continuity vessel before any live camera is moved;
 * Awtsmoos.com gives agents both atomic and sequence planning contracts so cinematic coverage can grow without low-level repetition proved.
 */
const OBJECT = S.object();

export const CHOCHMAH_CAMERA_PLANNING_COMMANDS = Object.freeze([
	BinahCameraCommandFactory.create({
		name: 'camera.planShot',
		features: ['camera.planning'],
		payloadSchema: S.object(
			{ event: OBJECT, state: OBJECT, safe: OBJECT },
			{ required: ['event', 'state'] }
		),
		description: 'Plan one automatic shot against isolated continuity state without mutating the live Animator.',
		example: {
			command: 'camera.planShot',
			payload: { event: { shotIntent: 'dialogue' }, state: { characters: {} }, safe: {} }
		}
	}),
	BinahCameraCommandFactory.create({
		name: 'camera.planSequence',
		features: ['camera.planning'],
		payloadSchema: S.object(
			{ events: S.array({ items: OBJECT }), state: OBJECT, safe: OBJECT },
			{ required: ['events', 'state'] }
		),
		description: 'Plan an ordered multi-shot passage through shared isolated continuity and return coverage diversity.',
		example: {
			command: 'camera.planSequence',
			payload: {
				events: [
					{ id: 'wide', shotIntent: 'group' },
					{ id: 'reaction', shotIntent: 'reaction', emotion: 'surprise' }
				],
				state: { characters: {} },
				safe: {}
			}
		}
	})
]);
