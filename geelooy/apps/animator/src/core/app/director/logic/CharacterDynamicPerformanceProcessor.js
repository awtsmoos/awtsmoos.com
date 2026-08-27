// B"H
// Boruch Hashem
// Blessed is He

import { AttentionEngine } from '../../../../performance/attention/AttentionEngine.js';
import { BodyPerformanceEngine } from '../../../../performance/body/BodyPerformanceEngine.js';
import { FacePerformanceEngine } from '../../../../performance/face/FacePerformanceEngine.js';

/**
 * Current direction becomes a fresh face and body pose at every timestamp. The
 * Awtsmoos renews emotion without residue; Awtsmoos.com keeps attention, speech,
 * manual keys, preview, persistence, and export on one deterministic evaluator.
 */
export class CharacterDynamicPerformanceProcessor {
	static apply(character, event = {}, progress = 0, elapsed = 0) {
		if (event.performance === false) {
			return;
		}
		const time = this.time(event, progress, elapsed);
		const attention = AttentionEngine.compose({
			character,
			event,
			time,
			emphasis: character.speechEmphasis || 0
		});
		character.attentionTarget = attention.target || character.attentionTarget;
		character.blinkNow = attention.blink;
		character.eyeDart = attention.dart;
		character.facePose = FacePerformanceEngine.compose({
			id: character.id,
			emotion: event.emotion || character.emotion || 'neutral',
			moment: event.moment,
			progress,
			expressionRangeProfile: character.expressionRangeProfile
				|| character.expressionProfile,
			attention: attention.target,
			blink: attention.blink,
			dart: attention.dart,
			facePose: event.facePose,
			manualFacePose: event.manualFacePose || character.manualFacePose
		});
		character.performancePose = event.performancePose
			|| BodyPerformanceEngine.compose({
				time,
				progress,
				energy: character.speechEmphasis || 0.85,
				gesture: event.gesture || character.gesture,
				speech: character.speech
			});
		character.breathMotion = character.performancePose.breath;
		character.weightShift = character.performancePose.weight;
		character.headTilt = character.performancePose.headTilt;
		character.headNod = character.headNod
			?? character.performancePose.headNod;
	}

	static time(event, progress, elapsed) {
		const duration = Math.max(
			500,
			Number(event.end || 0) - Number(event.start || 0)
		);
		return Number(elapsed || event.start || 0) + progress * duration;
	}
}
