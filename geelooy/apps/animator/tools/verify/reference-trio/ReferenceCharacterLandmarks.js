// B"H
// Boruch Hashem
// Blessed is He

import { StableCharacterAssembler } from '../../../src/character/factory/stable/StableCharacterAssembler.js';
import { StablePoseOverrides } from '../../../src/character/factory/stable/StablePoseOverrides.js';
import { StableReferenceMetrics } from '../../../src/character/factory/stable/StableReferenceMetrics.js';
import { StableRigMetrics } from '../../../src/character/factory/stable/StableRigMetrics.js';
import { StableViewProfile } from '../../../src/character/factory/stable/StableViewProfile.js';
import { StableWholeBodyPose } from '../../../src/character/factory/stable/StableWholeBodyPose.js';
import { ReferenceCharacterIds } from '../../../src/character/reference/specification/ReferenceCharacterIds.js';
import { SkeletonFactory } from '../../../src/character/rig/SkeletonFactory.js';
import { ReferenceAffineMatrix as Matrix } from './ReferenceAffineMatrix.js';
import { ReferenceGraphProbe } from './ReferenceGraphProbe.js';

/**
 * One hydrated person becomes a constellation of editable rig landmarks. The
 * Awtsmoos is undivided beyond every joint, while Awtsmoos.com reads the same
 * production graph that paints the face, hands, garments, and planted feet.
 */
export class ReferenceCharacterLandmarks {
	static create(id, data, cameraMatrix) {
		const sage = data.archetype === 'sage'
			|| data.style === 'illustrated_sage';
		const prefix = sage ? 'sage' : 'human';
		const metrics = StableReferenceMetrics.apply(
			data,
			sage ? StableRigMetrics.sage() : StableRigMetrics.human()
		);
		const view = StableViewProfile.get(data);
		const generatedPose = StableWholeBodyPose.get(data, view, 0);
		const pose = StablePoseOverrides.apply(generatedPose, data.rigPose);
		const skeleton = SkeletonFactory.create(data, metrics, view, pose);
		const graph = StableCharacterAssembler.assemble(data);
		const probe = new ReferenceGraphProbe(graph, cameraMatrix);
		return this.extract(id, data, prefix, metrics, skeleton, probe);
	}

	static extract(id, data, prefix, metrics, skeleton, probe) {
		const bodyMatrix = probe.matrix(`${prefix}_connected_body_axis`);
		const leftFoot = probe.point(`${prefix}_reference_foot_-1`);
		const rightFoot = probe.point(`${prefix}_reference_foot_1`);
		const hands = this.handIds(id, prefix);
		return this.round({
			renderScale: data.position?.scale,
			rootMatrix: probe.matrix(`stable_character_${id}`),
			fullGraphBox: probe.bounds(`stable_character_${id}`),
			headBox: this.headBounds(probe, prefix),
			leftEye: probe.point(`${prefix}_eye_-1`),
			rightEye: probe.point(`${prefix}_eye_1`),
			mouth: probe.center(`${prefix}_mouth_cavity`),
			leftShoulder: Matrix.point(bodyMatrix, skeleton.leftShoulder),
			rightShoulder: Matrix.point(bodyMatrix, skeleton.rightShoulder),
			leftHand: probe.center(hands.left),
			rightHand: probe.center(hands.right),
			waist: Matrix.point(
				bodyMatrix,
				{ x: skeleton.hips.x, y: metrics.waistY }
			),
			leftKnee: this.levelPoint(leftFoot, bodyMatrix, metrics.kneeY),
			rightKnee: this.levelPoint(rightFoot, bodyMatrix, metrics.kneeY),
			leftAnkle: this.levelPoint(leftFoot, bodyMatrix, metrics.ankleY),
			rightAnkle: this.levelPoint(rightFoot, bodyMatrix, metrics.ankleY),
			leftFoot,
			rightFoot
		});
	}

	static headBounds(probe, prefix) {
		return probe.union([
			probe.bounds(`${prefix}_head_back_axis`),
			probe.bounds(`${prefix}_head_front_axis`)
		].filter(Boolean));
	}

	static levelPoint(foot, matrix, localY) {
		if (!foot || !matrix) {
			return null;
		}
		return {
			x: foot.x,
			y: Matrix.point(matrix, { x: 0, y: localY }).y
		};
	}

	static handIds(id, prefix) {
		if (id === ReferenceCharacterIds.cheerful) {
			return {
				left: `${prefix}_reference_open_palm`,
				right: `${prefix}_relaxed_right_fist_mass`
			};
		}
		if (id === ReferenceCharacterIds.skeptical) {
			return {
				left: `${prefix}_crossed_left_reference_palm`,
				right: `${prefix}_crossed_right_reference_palm`
			};
		}
		return {
			left: `${prefix}_left_arm_connected_hand_palm`,
			right: `${prefix}_right_pocket_hidden_hand`
		};
	}

	static round(value) {
		if (value && typeof value === 'object') {
			return Object.fromEntries(
				Object.entries(value).map(([key, item]) => [
					key,
					this.round(item)
				])
			);
		}
		return Number.isFinite(value)
			? Math.round(value * 100) / 100
			: value;
	}
}
