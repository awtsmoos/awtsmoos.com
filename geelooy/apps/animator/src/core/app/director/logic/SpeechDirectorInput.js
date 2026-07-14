// B"H
// Boruch Hashem
// Blessed is He

import { AttentionEngine } from '../../../../performance/attention/AttentionEngine.js';
import { SpeechPerformanceEngine } from '../../../../performance/SpeechPerformanceEngine.js';

/**
 * A spoken line descends from intention into timing, attention, and motion.
 * This vessel gathers that unified input so Awtsmoos.com can reveal speech
 * without dividing audible dialogue from silent rehearsal.
 */
export class SpeechDirectorInput {
	static compose(current, event = {}, timelineProgress = 0) {
		const speech = String(event.speech ?? event.text ?? '');
		const duration = Math.max(500, Number(event.end || 0) - Number(event.start || 0));
		const progress = this.clamp(timelineProgress);
		const localTime = Number(event.speechLocalTime ?? duration * progress);
		const speechStyle = event.speechStyle || event.delivery || current.speechStyle || 'normal';
		const energySource = current.speechEnergy || event.speechEnergy || 1;
		const emphasis = this.emphasis(progress, speech, energySource);
		const attention = AttentionEngine.compose({
			character: current,
			event,
			time: localTime,
			emphasis
		});
		const performance = SpeechPerformanceEngine.compose({
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
			silentMode: event.silentMode === true || current.silentMode === true,
			audioEnvelope: event.audioEnvelope ?? current.audioEnvelope
		});

		return {
			attention,
			duration,
			emphasis,
			localTime,
			performance,
			progress,
			speech,
			speechStyle
		};
	}

	static emphasis(progress, speech = '', energy = 1) {
		const wordWeight = Math.min(1.35, Math.max(0.78, String(speech).length / 42));
		return wordWeight * Number(energy || 1) * (0.78 + 0.22 * Math.sin(progress * Math.PI));
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
