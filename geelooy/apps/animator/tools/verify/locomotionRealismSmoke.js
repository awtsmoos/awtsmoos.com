// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CharacterTravelProcessor } from '../../src/core/app/director/logic/CharacterTravelProcessor.js';
import { FootPlantSolver } from '../../src/character/performance/gait/FootPlantSolver.js';
import { GaitClock } from '../../src/character/performance/gait/GaitClock.js';
import { GaitTravelCalibration } from '../../src/character/performance/gait/GaitTravelCalibration.js';
import { WalkPhaseResolver } from '../../src/character/performance/gait/WalkPhaseResolver.js';
import { LocomotionMotionCatalog } from '../../src/character/performance/locomotion/LocomotionMotionCatalog.js';

/**
 * Regression proof for measured gait. The Awtsmoos renews both road and sole;
 * Awtsmoos.com measures their agreement so believable contact is a testable goal.
 */
class LocomotionRealismSmoke {
	/** Runs the complete realism contract and throws on the first broken invariant. */
	static run() {
		this.travelPublishesDistance();
		this.distanceDrivesCadence();
		this.plantedFootHoldsWorldSpace();
		this.cycleSeamIsContinuous();
		this.contactHasWeightAndLift();
		this.legacyProjectsKeepCadenceFallback();
		console.log('locomotionRealismSmoke: PASS');
	}

	/** Director travel publishes physical journey measures used by performance. */
	static travelPublishesDistance() {
		const character = { position: { x: 0, y: 0 } };
		const event = {
			pos: { from: { x: 0, y: 0 }, to: { x: 120, y: 50 } },
			locomotion: 'walk',
			start: 0,
			end: 1000
		};
		CharacterTravelProcessor.apply(character, event, 0.25);
		assert.equal(character._travelDistance, 130);
		assert.equal(character._travelDistanceCovered, 32.5);
		assert.equal(character.position.x, 30);
		assert.equal(character.position.y, 12.5);
	}

	/** World distance and stride jointly determine visible cycle count. */
	static distanceDrivesCadence() {
		const motion = LocomotionMotionCatalog.resolve('walk', { motionMode: 'worldTravel' });
		const cycleDistance = GaitTravelCalibration.cycleDistance(motion);
		const data = {
			motionMode: 'worldTravel',
			_travelDistance: cycleDistance * 1.5,
			_travelProgress: 0.5,
			_index: 0
		};
		const clock = GaitClock.sample(0, { locomotion: { type: 'walk' } }, data, motion);
		this.close(clock.cycles, 1.5, 'measured cycle count');
		this.close(clock.phase, 0.75, 'measured gait phase');
		assert.equal(clock.measured, true);
	}

	/** Linear stance retreat exactly cancels calibrated body travel. */
	static plantedFootHoldsWorldSpace() {
		const motion = LocomotionMotionCatalog.resolve('walk', { motionMode: 'worldTravel' });
		const cycleDistance = GaitTravelCalibration.cycleDistance(motion);
		const firstPhase = motion.stanceRatio * 0.22;
		const secondPhase = motion.stanceRatio * 0.58;
		const first = FootPlantSolver.solve(WalkPhaseResolver.resolve(firstPhase, motion), -1, 1, motion.stride);
		const second = FootPlantSolver.solve(WalkPhaseResolver.resolve(secondPhase, motion), -1, 1, motion.stride);
		const firstWorld = (cycleDistance * firstPhase) + first.localTravel;
		const secondWorld = (cycleDistance * secondPhase) + second.localTravel;
		this.close(firstWorld, secondWorld, 'planted-foot world drift');
	}

	/** Swing ends where the next stance begins instead of teleporting across the seam. */
	static cycleSeamIsContinuous() {
		const motion = LocomotionMotionCatalog.resolve('walk', { motionMode: 'worldTravel' });
		const beforeWrap = WalkPhaseResolver.resolve(0.9999, motion);
		const afterWrap = WalkPhaseResolver.resolve(0, motion);
		assert.ok(Math.abs(beforeWrap.forward - afterWrap.forward) < 0.001);
	}

	/** Contact confidence and airborne lift expose useful physical state. */
	static contactHasWeightAndLift() {
		const motion = LocomotionMotionCatalog.resolve('walk', { motionMode: 'worldTravel' });
		const stance = WalkPhaseResolver.resolve(motion.stanceRatio * 0.5, motion);
		const swing = WalkPhaseResolver.resolve(motion.stanceRatio + ((1 - motion.stanceRatio) * 0.5), motion);
		assert.equal(stance.planted, true);
		assert.equal(stance.contact, 1);
		assert.equal(swing.planted, false);
		assert.equal(swing.contact, 0);
		assert.ok(swing.lift < 0);
	}

	/** Old projects without measured distance retain the prior normalized cadence. */
	static legacyProjectsKeepCadenceFallback() {
		const motion = LocomotionMotionCatalog.resolve('walk', { motionMode: 'worldTravel' });
		const clock = GaitClock.sample(0, { locomotion: { type: 'walk' } }, {
			motionMode: 'worldTravel',
			_travelProgress: 1
		}, motion);
		this.close(clock.cycles, 1.6, 'legacy fallback cycles');
		assert.equal(clock.measured, false);
	}

	/** @param {number} actual @param {number} expected @param {string} label */
	static close(actual, expected, label) {
		assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} !== ${expected}`);
	}
}

LocomotionRealismSmoke.run();
