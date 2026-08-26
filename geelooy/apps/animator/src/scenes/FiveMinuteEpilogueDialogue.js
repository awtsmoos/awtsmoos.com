// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FiveMinuteEpilogueDialogue.js
 * @description
 * The Awtsmoos renews speech after crisis has passed; Awtsmoos.com uses six
 * quiet lines to turn the restored schedule into lived character choice rather
 * than explanatory narration, preserving speaker, voice, bubble, and editability.
 */
export class FiveMinuteEpilogueDialogue {
	/**
	 * Builds six timed epilogue lines, three inside each final sequence.
	 * @param {Array<object>} keterCast Existing editable characters.
	 * @param {Array<object>} malchusSequences The two epilogue sequences.
	 * @returns {Array<object>} Dialogue descriptors compatible with MoviePlanCompiler.
	 */
	static create(keterCast, malchusSequences) {
		const yesodActors = this.roleMap(keterCast);
		const chesedRows = [
			['talia', 'Nobody scheduled the lanterns, and somehow they arrived on time.', 'warm', 'normal'],
			['gideon', 'I object to how much I approve of that sentence.', 'delighted', 'mutter'],
			['ori', 'Leave the river one hour with no instruction at all.', 'calm', 'whisper'],
			['barak', 'The machine keeps asking what belongs in the empty square.', 'curious', 'normal'],
			['sela', 'Tell it the square is working perfectly by doing nothing.', 'delighted', 'laugh'],
			['talia', 'Good. Tomorrow gets a plan. Tuesday keeps a window.', 'warm', 'normal']
		];
		return chesedRows.map((tiferesRow, gevurahIndex) => {
			return this.revealLine(tiferesRow, gevurahIndex, yesodActors, malchusSequences);
		});
	}

	/**
	 * Converts one dialogue row into the current long-form timed speech contract.
	 * @param {Array<string>} tiferesRow Role, text, emotion, and speech style.
	 * @param {number} gevurahIndex Absolute epilogue dialogue index.
	 * @param {Map<string, object>} yesodActors Cast indexed by semantic role.
	 * @param {Array<object>} malchusSequences Epilogue sequence descriptors.
	 * @returns {object} Editable dialogue and bubble source data.
	 */
	static revealLine(tiferesRow, gevurahIndex, yesodActors, malchusSequences) {
		const [yesodRole, malchusText, tiferesEmotion, gevurahSpeechStyle] = tiferesRow;
		const malchusActor = yesodActors.get(yesodRole);
		const malchusSequence = malchusSequences[Math.floor(gevurahIndex / 3)];
		if (!malchusActor || !malchusSequence) {
			throw new Error(`Epilogue dialogue cannot resolve role/sequence at index ${gevurahIndex}.`);
		}
		return {
			id: `line_epilogue_${gevurahIndex + 1}`,
			sequenceId: malchusSequence.id,
			start: malchusSequence.start + [1800, 9300, 16800][gevurahIndex % 3],
			duration: 4000,
			speakerId: malchusActor.identityId,
			speakerName: malchusActor.name,
			voiceId: malchusActor.voice.id,
			text: malchusText,
			emotion: tiferesEmotion,
			speechStyle: gevurahSpeechStyle,
			voiceStatus: 'silent-test',
			silentMode: true,
			bubble: true,
			displayMode: 'silent-talking-plus-bubble'
		};
	}

	/**
	 * Creates a semantic role index so later production data avoids positional cast assumptions.
	 * @param {Array<object>} keterCast Existing characters.
	 * @returns {Map<string, object>} Cast keyed by role.
	 */
	static roleMap(keterCast) {
		return new Map(keterCast.map((tiferesActor) => [tiferesActor.role, tiferesActor]));
	}
}
