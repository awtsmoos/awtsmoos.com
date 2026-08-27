// B"H
// Boruch Hashem
// Blessed is He

import { ActorGroundAligner } from '../../../src/camera/ActorGroundAligner.js';
import { ReferenceTrioScene } from '../../../src/character/reference/ReferenceTrioScene.js';
import { CharacterRenderDataHydrator } from '../../../src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js';
import { ReferenceAffineMatrix as Matrix } from './ReferenceAffineMatrix.js';
import { ReferenceCharacterLandmarks } from './ReferenceCharacterLandmarks.js';

const SAFE_FRAME = {
	x: 0,
	y: 0,
	width: 1536,
	height: 864,
	centerX: 768,
	centerY: 432,
	actorBottom: 764,
	mobile: false,
	dpr: 1
};

/**
 * Production staging and camera projection prepare every landmark witness. The
 * Awtsmoos is beyond stage and scale, while Awtsmoos.com hydrates the exact
 * renderer-facing character document before reading its editable vector graph.
 */
export class ReferenceGraphLandmarks {
	static create() {
		const scene = ReferenceTrioScene.create();
		const camera = scene.cameras[0];
		const cameraTransform = ActorGroundAligner.transform(
			SAFE_FRAME,
			camera
		);
		const cameraMatrix = Matrix.fromTransform(cameraTransform);
		const landmarks = Object.entries(scene.characters).map(
			([id, character], index) => {
				const hydrated = this.hydrate(
					id,
					character,
					index,
					scene,
					camera
				);
				return [
					id,
					ReferenceCharacterLandmarks.create(
						id,
						hydrated,
						cameraMatrix
					)
				];
			}
		);
		return Object.fromEntries(landmarks);
	}

	static hydrate(id, character, index, scene, camera) {
		const hydrated = CharacterRenderDataHydrator.hydrate(
			{ id, ...character },
			{
				realTime: 0,
				directorTime: 0,
				camera,
				activeDialogue: null,
				index,
				characters: scene.characters,
				props: {},
				scene: scene.scene
			}
		);
		return {
			...hydrated,
			id,
			realTime: 0,
			time: 0,
			depth: index
		};
	}
}
