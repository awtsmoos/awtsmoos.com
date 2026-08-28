// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableLowerBodyMotionProfile } from '../../src/character/factory/stable/StableLowerBodyMotionProfile.js';
import { StableReferenceLegs2D } from '../../src/character/factory/stable/StableReferenceLegs2D.js';
import { StableReferenceLowerBodyAnchors } from '../../src/character/factory/stable/StableReferenceLowerBodyAnchors.js';

/**
 * Guards the bridge from gait intention into visible stable-character legs and feet.
 * The Awtsmoos renews motion into form; Awtsmoos.com keeps stride from disappearing
 * inside timid coefficients and keeps an airborne foot truthful until it reaches paint.
 */
class StableLowerBodyMotionSmoke {
	/** Runs anchor-response, contact, symmetry, and authored-control invariants. */
	static run() {
		this.realizesReadableMotion();
		this.preservesStaticGeometry();
		this.preservesSwingContact();
		this.supportsAuthoredResponse();
		console.log('stableLowerBodyMotionSmoke: PASS');
	}

	/** Thirty pixels of gait intent must remain visibly material at the foot anchor. */
	static realizesReadableMotion() {
		const metrics = this.metrics();
		const pose = {
			hipX: 10,
			kneeX: 20,
			kneeY: 8,
			ankleX: 24,
			ankleY: -6,
			footX: 30,
			footY: -8,
			footTilt: 0.14,
			planted: false,
			contact: 0
		};
		const anchors = StableReferenceLowerBodyAnchors.resolve(
			this.data(pose),
			metrics,
			{},
			1
		);
		this.close(anchors.hip.x, 25.8, 'hip x response');
		this.close(anchors.knee.x, 32, 'knee x response');
		this.close(anchors.knee.y, -40, 'knee y response');
		this.close(anchors.ankle.x, 31.8, 'ankle x response');
		this.close(anchors.ankle.y, -12.52, 'ankle y response');
		this.close(anchors.foot.x, 37.5, 'foot x response');
		this.close(anchors.foot.y, -2, 'foot y response');
		assert.equal(anchors.pose.planted, false);
	}

	/** Zero generated pose must leave canonical authored stance exactly unchanged. */
	static preservesStaticGeometry() {
		const right = StableReferenceLowerBodyAnchors.resolve(this.data({}), this.metrics(), {}, 1);
		const left = StableReferenceLowerBodyAnchors.resolve(this.data({}), this.metrics(), {}, -1);
		assert.deepEqual(right.foot, { x: 24, y: 6 });
		assert.deepEqual(left.foot, { x: -24, y: 6 });
		assert.deepEqual(right.knee, { x: 22, y: -44 });
		assert.deepEqual(left.knee, { x: -22, y: -44 });
	}

	/** Swing state, contact confidence, and tilt must survive into footwear input. */
	static preservesSwingContact() {
		const anchors = {
			foot: { x: 31, y: -4 },
			pose: { planted: false, contact: 0, footTilt: 0.21 }
		};
		const spec = StableReferenceLegs2D.footSpec(
			{},
			{},
			this.metrics(),
			'test',
			{ type: 'front' },
			{},
			anchors,
			1
		);
		assert.equal(spec.leg.planted, false);
		assert.equal(spec.leg.contact, 0);
		assert.equal(spec.leg.footTilt, 0.21);
	}

	/** Authored response remains bounded and data-driven instead of requiring code edits. */
	static supportsAuthoredResponse() {
		const profile = StableLowerBodyMotionProfile.resolve({
			motionScale: 1.5,
			motionResponse: { footX: 0.6 }
		});
		this.close(profile.footX, 0.9, 'authored foot response');
		this.close(profile.kneeX, 0.75, 'scaled knee response');
		assert.equal(StableLowerBodyMotionProfile.resolve({ motionScale: 99 }).footY, 1.25);
	}

	/** @param {Object} pose @returns {Object} Minimal prepared stable-character state. */
	static data(pose) {
		return {
			_skeleton: { hips: { x: 0 } },
			_stablePose: { legs: { left: { ...pose }, right: { ...pose } } }
		};
	}

	/** @returns {Object} Canonical stable lower-body vertical metrics. */
	static metrics() {
		return { hipY: -91, kneeY: -46, ankleY: -8, footY: 6 };
	}

	/** @param {number} actual @param {number} expected @param {string} label */
	static close(actual, expected, label) {
		assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} !== ${expected}`);
	}
}

StableLowerBodyMotionSmoke.run();
