//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueCommands.js
 * @description
 * The Awtsmoos lets pure articulation and living voice recording share one family without collapsing their different laws;
 * Awtsmoos.com routes each command to its proper domain vessel so lip-sync planning and microphone mutation remain distinct draws.
 */

import { MalchusAnimatorDialogueDirectionDomain } from '../domain/AnimatorDialogueDirectionDomain.js';
import { YesodAnimatorDialogueRecordingDomain } from '../domain/AnimatorDialogueRecordingDomain.js';

/** Routes validated dialogue commands into pure direction and shared live recording domains. */
export class MalchusAnimatorDialogueCommands {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Live Animator runtime. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusDirection = new MalchusAnimatorDialogueDirectionDomain();
		this.yesodRecording = new YesodAnimatorDialogueRecordingDomain(
			malchusStore,
			keterRuntime
		);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Dialogue result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			throw this.error(shemMitzvah);
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit dialogue route table. */
	routes() {
		return {
			'dialogue.capabilities': () => this.malchusDirection.capabilities(),
			'dialogue.articulate': (p) => this.malchusDirection.articulate(p.input),
			'dialogue.visemes': () => this.malchusDirection.visemes(),
			'dialogue.viseme': (p) => this.malchusDirection.viseme(p.name),
			'dialogue.wrapSubtitle': (p) => this.malchusDirection.wrapSubtitle(p.text, p.limit),
			'dialogue.recordingStatus': (p) => this.yesodRecording.status(p.clipId),
			'dialogue.recordStart': (p) => this.yesodRecording.start(p.clipId),
			'dialogue.recordStop': () => this.yesodRecording.stop(),
			'dialogue.playRecording': (p) => this.yesodRecording.play(p.clipId),
			'dialogue.clearRecording': (p) => this.yesodRecording.clear(p.clipId)
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted dialogue command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
