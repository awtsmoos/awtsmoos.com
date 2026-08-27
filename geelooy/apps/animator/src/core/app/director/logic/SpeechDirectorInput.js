// B"H
// Boruch Hashem
// Blessed is He

import { AttentionEngine } from '../../../../performance/attention/AttentionEngine.js';
import { SpeechPerformanceEngine } from '../../../../performance/SpeechPerformanceEngine.js';
import { StableSpeechActivity } from '../../../../performance/speech/lipsync/StableSpeechActivity.js';

/**
 * Speech combines current direction with articulation without inheriting silence.
 * The Awtsmoos renews each word; Awtsmoos.com preserves emotion, range, cues,
 * attention, manual keys, preview, persistence, and export in one truthful input.
 */
export class SpeechDirectorInput {
	static compose(current, event = {}, timelineProgress = 0) {
		const speech = StableSpeechActivity.normalize(
			event.speech ?? event.text ?? current.speech
		);
		const duration = Math.max(
			500,
			Number(event.end || 0) - Number(event.start || 0)
		);
		const progress = this.clamp(timelineProgress);
		const localTime = Number(
			event.speechLocalTime ?? duration * progress
		);
		const speechStyle = event.speechStyle
			|| event.delivery
			|| current.speechStyle
			|| 'normal';
		const energySource = current.speechEnergy
			|| event.speechEnergy
			|| 1;
		const emphasis = this.emphasis(progress, speech, energySource);
		const attention = AttentionEngine.compose({
			character: current,
			event,
			time: localTime,
			emphasis
		});
		const lipSyncCues = event.lipSyncCues
			|| event.phonemeCues
			|| current.lipSyncCues
			|| current.phonemeCues;
		const talking = StableSpeechActivity.active({
			speech,
			talking: event.talking,
			silentMode: event.silentMode === true
				|| current.silentMode === true,
			lipSyncCues,
			phonemeCues: event.phonemeCues || current.phonemeCues,
			manualMouth: event.manualMouth || current.manualMouth
		});
		const rangeProfile = current.expressionRangeProfile
			|| current.expressionProfile
			|| 'universal';
		const performance = SpeechPerformanceEngine.compose({
			id: current.id || event.id || event.actor || event.speaker,
			speech,
			progress,
			time: localTime,
			duration,
			energy: emphasis,
			emotion: event.emotion || current.emotion || 'neutral',
			moment: event.moment || current.moment || null,
			profile: rangeProfile,
			expressionRangeProfile: rangeProfile,
			attention: attention.target,
			blink: attention.blink,
			dart: attention.dart,
			gesture: event.gesture || current.gesture,
			speechStyle,
			talking,
			silentMode: event.silentMode === true
				|| current.silentMode === true,
			audioEnvelope: event.audioEnvelope ?? current.audioEnvelope,
			lipSyncCues,
			phonemeCues: event.phonemeCues || current.phonemeCues,
			manualMouth: event.manualMouth || current.manualMouth,
			facePose: event.facePose,
			manualFacePose: event.manualFacePose || current.manualFacePose
		});
		return {
			attention,
			duration,
			emphasis,
			localTime,
			lipSyncCues,
			performance,
			progress,
			speech,
			speechStyle,
			talking
		};
	}

	static emphasis(progress, speech = '', energy = 1) {
		const wordWeight = Math.min(
			1.35,
			Math.max(0.78, String(speech).length / 42)
		);
		return wordWeight
			* Number(energy || 1)
			* (0.78 + 0.22 * Math.sin(progress * Math.PI));
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
