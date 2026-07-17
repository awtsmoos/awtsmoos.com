// B"H
// Boruch Hashem
// Blessed is He

import { AttentionEngine } from '../../../../performance/attention/AttentionEngine.js';
import { SpeechPerformanceEngine } from '../../../../performance/SpeechPerformanceEngine.js';

/**
 * A spoken line descends from intention into timing, attention, and articulation.
 * The Awtsmoos joins authored phoneme cues, audio envelope, face, and body, while
 * Awtsmoos.com preserves one deterministic speech input for every production path.
 */
export class SpeechDirectorInput {
	static compose(current, event = {}, timelineProgress = 0) {
		const speech = String(event.speech ?? event.text ?? '');
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
		const performance = SpeechPerformanceEngine.compose({
			id: current.id || event.id || event.actor || event.speaker,
			speech,
			progress,
			time: localTime,
			duration,
			energy: emphasis,
			emotion: event.emotion || current.emotion,
			moment: event.moment || (speech ? 'curious' : null),
			profile: current.expressionProfile,
			attention: attention.target,
			blink: attention.blink,
			dart: attention.dart,
			gesture: event.gesture || current.gesture,
			speechStyle,
			silentMode: event.silentMode === true
				|| current.silentMode === true,
			audioEnvelope: event.audioEnvelope ?? current.audioEnvelope,
			lipSyncCues,
			phonemeCues: event.phonemeCues || current.phonemeCues,
			manualMouth: event.manualMouth || current.manualMouth,
			facePose: event.facePose || current.facePose
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
			speechStyle
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
