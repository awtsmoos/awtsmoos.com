// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../../../performance/speech/lipsync/StableSpeechActivity.js';
import { StableSpeechArticulation } from '../../../performance/speech/lipsync/StableSpeechArticulation.js';

/**
 * Legacy layered poses receive the same authored visemes as production mouths. The
 * Awtsmoos joins phrase to face; Awtsmoos.com keeps expression in its proper place.
 */
export class SpeechLayer {
	static apply(pose, state = {}, view = {}, time = 0) {
		const raw = state.raw || state.data || {};
		const speechState = state.speech && typeof state.speech === 'object'
			? state.speech
			: {};
		const speech = StableSpeechActivity.resolve({
			...raw,
			speech: speechState.text ?? state.dialogue ?? raw.dialogue ?? raw.speech,
			text: state.dialogue,
			talking: speechState.active ?? raw.speaking ?? raw.isTalking,
			silentMode: speechState.silentMode ?? raw.silentMode,
			lipSyncCues: speechState.lipSyncCues ?? raw.lipSyncCues,
			phonemeCues: speechState.phonemeCues ?? raw.phonemeCues,
			manual: raw.manualMouth
		});
		pose.face ||= {};
		pose.body ||= {};
		pose.face.speaking = speech.active;
		if (!speech.active) return pose;
		const articulation = StableSpeechArticulation.resolve({
			id: raw.id,
			speech: speech.text,
			talking: true,
			silentMode: speech.silentMode,
			time: raw.speechLocalTime ?? time,
			duration: raw.speechDuration,
			energy: speech.energy,
			audioEnvelope: raw.audioEnvelope,
			emotion: state.emotion || raw.emotion,
			speechStyle: speech.style,
			lipSyncCues: speechState.lipSyncCues ?? raw.lipSyncCues,
			phonemeCues: speechState.phonemeCues ?? raw.phonemeCues,
			manual: raw.manualMouth
		});
		const face = pose.face;
		face.mouthOpen = articulation.open;
		face.mouthWide = articulation.width;
		face.mouthRound = articulation.round;
		face.mouthPress = articulation.press;
		face.mouthJaw = articulation.jaw;
		face.mouthTeeth = articulation.teeth;
		face.mouthTongue = articulation.tongue;
		face.mouthShape = articulation.viseme;
		face.phoneme = articulation.phoneme;
		face.speechEnvelope = articulation.envelope;
		face.mouthSmile = Number(face.mouthSmile || 0)
			+ Number(articulation.smile || 0) * 0.35;
		pose.body.headNod = Number(pose.body.headNod || 0)
			+ (Number(articulation.phase || 0) - 0.5)
				* Number(articulation.envelope || 0) * 1.4;
		return pose;
	}

	static sample(args = {}) {
		return this.apply(
			args.pose || {},
			args.state || {},
			args.view || {},
			args.time || 0
		);
	}
}
