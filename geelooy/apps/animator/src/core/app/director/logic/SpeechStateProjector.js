// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins inward intention to outward form. Awtsmoos.com keeps durable
 * character state aligned with rich coarticulated lips, tongue, teeth, jaw, face,
 * body, attention, cue timing, persistence, and export.
 */
export class SpeechStateProjector {
	static character(current, event, context) {
		const mouth = context.performance.face.mouth || {};
		const body = context.performance.body || {};
		const next = {
			...current,
			position: { ...(current.position || {}) },
			speech: context.speech,
			isTalking: Boolean(context.speech),
			silentMode: event.silentMode === true
				|| current.silentMode === true,
			speechStyle: context.speechStyle,
			speechEnergy: Number.isFinite(event.speechEnergy)
				? event.speechEnergy
				: Number(current.speechEnergy || 1),
			speechLocalTime: context.localTime,
			speechDuration: context.duration,
			speechEmphasis: context.emphasis,
			lipSyncCues: context.lipSyncCues || current.lipSyncCues,
			phonemeCues: event.phonemeCues || current.phonemeCues,
			audioEnvelope: event.audioEnvelope ?? current.audioEnvelope,
			mouthPerformance: { ...mouth },
			...this.mouthFields(mouth),
			facePose: context.performance.face,
			performancePose: body,
			attentionTarget: context.attention.target,
			blinkNow: context.attention.blink,
			eyeDart: context.attention.dart,
			gesture: event.gesture || current.gesture || 'explain',
			acting: event.acting
				|| event.gesture
				|| (context.speech ? 'talk' : current.acting || 'listen_idle'),
			upperBody: context.speech
				? 'talking_emphasis'
				: current.upperBody,
			headNod: body.headNod,
			headTilt: body.headTilt,
			shoulderMotion: body.shoulder,
			handPerformance: body.hand,
			breathMotion: body.breath,
			weightShift: body.weight,
			emotion: event.emotion || current.emotion || 'focused',
			lookAt: event.lookAt
				|| event.listener
				|| current.lookAt
				|| null,
			dialogueMode: event.dialogueMode
				|| event.mode
				|| current.dialogueMode
				|| 'subtitle'
		};

		this.applyTimedActions(next, event, context.progress);
		return next;
	}

	static mouthFields(mouth) {
		return {
			mouthOpen: mouth.open,
			mouthJaw: mouth.jaw,
			mouthSmile: mouth.smile,
			mouthShape: mouth.shape,
			mouthViseme: mouth.viseme,
			mouthPhoneme: mouth.phoneme,
			mouthRound: mouth.round,
			mouthWidth: mouth.width,
			mouthPress: mouth.press,
			mouthTeeth: mouth.teeth,
			mouthTongue: mouth.tongue,
			mouthTongueTip: mouth.tongueTip,
			mouthBite: mouth.bite,
			mouthClosure: mouth.closure,
			mouthRelease: mouth.release,
			mouthCueIndex: mouth.cueIndex,
			mouthCueCount: mouth.cueCount
		};
	}

	static dialogue(characterId, next, event, progress) {
		return {
			id: characterId,
			speakerId: characterId,
			listenerId: event.lookAt || event.listener || null,
			text: next.speech,
			mode: next.dialogueMode,
			silentMode: next.silentMode,
			speechStyle: next.speechStyle,
			start: event.start || 0,
			end: event.end || 0,
			progress
		};
	}

	static applyTimedActions(next, event = {}, progress = 0) {
		if (!Array.isArray(event.actions)) {
			return;
		}
		for (const action of event.actions) {
			if (progress < Number(action.at || 0) || !action.key) {
				continue;
			}
			if (action.key === 'acting') {
				next.gesture = action.value;
			} else {
				next[action.key] = action.value;
			}
		}
	}
}
