// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../../../performance/speech/lipsync/StableSpeechActivity.js';

/**
 * Breath, drift, and conversational hands prevent frozen puppetry without false voice.
 * The Awtsmoos renews body through light; Awtsmoos.com keeps each bounded rhythm right.
 */
export class NaturalMotionComposer {
	static apply(pose, data = {}, state = {}, time = 0) {
		const talking = this.talking(data, state);
		const profile = data.motionPersonality || data.motionProfile || {};
		const seed = Number(data._index || 0) * 0.73;
		const idleScale = this.number(profile.idleScale, 1);
		const breath = Math.sin(time * 0.0017 + seed) * idleScale;
		pose.body.bob = Number(pose.body.bob || 0) + breath * 1.2;
		pose.body.torsoLean = Number(pose.body.torsoLean || 0)
			+ Math.sin(time * 0.001 + seed) * 0.55 * idleScale;
		pose.body.headNod = Number(pose.body.headNod || 0)
			+ Math.sin(time * (talking ? 0.006 : 0.0015) + seed)
				* (talking ? 2.1 : 0.55) * idleScale;
		pose.body.headRotation = Number(pose.body.headRotation || 0)
			+ Math.sin(time * 0.0012 + seed) * 0.018 * idleScale;
		pose.body.torsoBreathScale = 1 + breath * 0.014;
		this.arm(pose, 'left', time, talking, state, profile);
		this.arm(pose, 'right', time, talking, state, profile);
	}

	static arm(pose, side, time, talking, state, profile = {}) {
		const sign = side === 'right' ? 1 : -1;
		const gesture = this.gestureName(state.gesture);
		const emphasis = talking && side === 'right' ? 1 : 0;
		const speed = talking && side === 'right' ? 0.005 : 0.0016;
		const scale = this.number(profile.gestureScale, 1);
		const pulse = Math.sin(time * speed + sign);
		const arm = pose.arms[side];
		arm.elbowX = Number(arm.elbowX || 14)
			+ pulse * (1.4 + emphasis * 4) * scale;
		arm.elbowY = Number(arm.elbowY || 38)
			+ pulse * (0.8 - emphasis * 2.4) * scale;
		arm.handX = Number(arm.handX || 10)
			+ pulse * (1.8 + emphasis * 6) * scale;
		arm.handY = Number(arm.handY || 30)
			+ Math.cos(time * 0.002 + sign) * (1.4 + emphasis * 3.8) * scale;
		if (emphasis && !/point|raise|celebrate/.test(gesture)) {
			arm.handPose = 'open';
		}
	}

	static talking(data = {}, state = {}) {
		const speech = state.speech && typeof state.speech === 'object'
			? state.speech
			: data.speech;
		return StableSpeechActivity.active({
			...data,
			speech,
			text: state.dialogue,
			talking: state.speech?.active ?? data.isTalking ?? data.speaking
		});
	}

	static gestureName(value) {
		return String(value?.type || value || 'none');
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
