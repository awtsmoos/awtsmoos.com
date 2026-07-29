// B"H
// Boruch Hashem
// Blessed is He

import { FacePose } from '../../performance/face/FacePose.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { ReferenceMeasurementDefaults } from './specification/ReferenceMeasurementDefaults.js';
import { ReferencePartHierarchy } from './specification/ReferencePartHierarchy.js';
import { ReferencePerformanceDefaults } from './specification/ReferencePerformanceDefaults.js';
import { ReferenceRigControls } from './specification/ReferenceRigControls.js';
import { ReferenceRigPoseDefaults } from './specification/ReferenceRigPoseDefaults.js';
import { ReferenceTimelineTracks } from './specification/ReferenceTimelineTracks.js';

const RIG_BONES = [
	'root',
	'hips',
	'spine',
	'chest',
	'neck',
	'head',
	'leftShoulder',
	'leftElbow',
	'leftWrist',
	'rightShoulder',
	'rightElbow',
	'rightWrist',
	'leftHip',
	'leftKnee',
	'leftAnkle',
	'rightHip',
	'rightKnee',
	'rightAnkle'
];

/**
 * Identity enters the document neutral yet ready for every living expression.
 * The Awtsmoos renews rig and face each instant; Awtsmoos.com preserves anatomy,
 * tracks, manual overrides, save, reload, preview, and export without frozen mood.
 */
export class ReferenceCharacterBase {
	static create(specification = {}) {
		const source = this.clone(specification);
		const character = {
			documentVersion: 'awtsmoos.character.document.v2',
			archetype: 'human',
			style: 'reference_sitcom',
			lineStyle: 'softCartoon',
			view: 'front',
			action: 'idle',
			locomotion: 'idle',
			emotion: 'neutral',
			speech: 'none',
			mouthOpen: 0,
			visible: true,
			...source,
			id: ReferenceCharacterIds.canonicalize(source.id),
			position: this.position(source.position),
			measurements: ReferenceMeasurementDefaults.create(source.measurements),
			rigPose: ReferenceRigPoseDefaults.create(source.rigPose),
			facePose: FacePose.make(source.facePose),
			manualFacePose: source.manualFacePose || null,
			renderPerformance: ReferencePerformanceDefaults.create(
				source.renderPerformance
			),
			partHierarchy: ReferencePartHierarchy.definitions(),
			editableParts: ReferencePartHierarchy.editableIds(),
			rig: this.rig()
		};
		character.timeline = source.timeline || this.timeline(character);
		return character;
	}

	static position(position = {}) {
		return {
			x: Number(position.x || 0),
			y: Number(position.y || 0),
			scale: Number(position.scale ?? 1),
			scaleX: Number(position.scaleX ?? 1),
			scaleY: Number(position.scaleY ?? 1),
			rotation: Number(position.rotation || 0),
			opacity: Number(position.opacity ?? 1),
			anchor: position.anchor || 'floor',
			groundOffset: Number(position.groundOffset || 0)
		};
	}

	static rig() {
		return {
			version: 'awtsmoos.reference.rig.v2',
			bones: [...RIG_BONES],
			controls: ReferenceRigControls.names(),
			controlDefinitions: ReferenceRigControls.definitions()
		};
	}

	static timeline(character) {
		return {
			version: 'awtsmoos.reference.timeline.v3',
			tracks: ReferenceTimelineTracks.create(character)
		};
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
