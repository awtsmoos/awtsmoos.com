// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins inward intention to outward form. This projector keeps
 * the director's durable character state aligned with the richer face and
 * body performance generated for every line in Awtsmoos.com.
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
			silentMode: event.silentMode === true || current.silentMode === true,
			speechStyle: context.speechStyle,
			speechEnergy: Number.isFinite(event.speechEnergy)
				? event.speechEnergy
				: Number(current.speechEnergy || 1),
			speechLocalTime: context.localTime,
			speechDuration: context.duration,
			speechEmphasis: context.emphasis,
			mouthOpen: mouth.open,
			mouthSmile: mouth.smile,
			mouthShape: mouth.shape,
			mouthRound: mouth.round,
			mouthWidth: mouth.width,
			facePose: context.performance.face,
			performancePose: body,
			attentionTarget: context.attention.target,
			blinkNow: context.attention.blink,
			eyeDart: context.attention.dart,
			gesture: event.gesture || current.gesture || 'explain',
			acting: event.acting || event.gesture || (context.speech ? 'talk' : current.acting || 'listen_idle'),
			upperBody: context.speech ? 'talking_emphasis' : current.upperBody,
			headNod: body.headNod,
			headTilt: body.headTilt,
			shoulderMotion: body.shoulder,
			handPerformance: body.hand,
			breathMotion: body.breath,
			weightShift: body.weight,
			emotion: event.emotion || current.emotion || 'focused',
			lookAt: event.lookAt || event.listener || current.lookAt || null,
			dialogueMode: event.dialogueMode || event.mode || current.dialogueMode || 'subtitle'
		};

		this.applyTimedActions(next, event, context.progress);
		return next;
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
