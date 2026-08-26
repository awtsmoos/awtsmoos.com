//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAudioCommands.js
 * @description
 * The Awtsmoos lets speech, impact, duration, and waveform pass through one small routing vessel without absorbing browser logic;
 * Awtsmoos.com keeps the handler thin while real sound creation and analysis remain inside the dedicated audio domain.
 */

import { HodAnimatorAudioDomain } from '../domain/AnimatorAudioDomain.js';

/** Routes validated Audio family commands into the browser-backed audio domain adapter. */
export class HodAnimatorAudioCommands {
	constructor() {
		this.hodDomain = new HodAnimatorAudioDomain();
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Audio result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			throw this.error(shemMitzvah);
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit audio route table. */
	routes() {
		return {
			'audio.capabilities': () => this.hodDomain.capabilities(),
			'audio.voices': () => this.hodDomain.voices(),
			'audio.speak': (p) => this.hodDomain.speak(p.text, p.options ?? {}),
			'audio.foleyStep': (p) => this.hodDomain.foleyStep(p),
			'audio.measureDuration': (p) => this.hodDomain.measureDuration(p.source, p.url ?? ''),
			'audio.waveform': (p) => this.hodDomain.waveform(p.source, p.buckets ?? 96)
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted audio command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
