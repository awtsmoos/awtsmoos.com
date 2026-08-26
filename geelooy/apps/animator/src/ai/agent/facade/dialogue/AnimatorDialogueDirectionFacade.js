//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueDirectionFacade.js
 * @description
 * The Awtsmoos lets a creator ask for articulation, visemes, and subtitle rhythm through a compact semantic doorway;
 * Awtsmoos.com keeps every convenience method on canonical execute so pure dialogue direction never becomes a shadow API story.
 */

/** Ergonomic pure dialogue-direction namespace over canonical commands. */
export class MalchusAnimatorDialogueDirectionFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	capabilities() {
		return this.execute('dialogue.capabilities');
	}

	articulate(keliInput) {
		return this.execute('dialogue.articulate', { input: keliInput });
	}

	visemes() {
		return this.execute('dialogue.visemes');
	}

	viseme(shemViseme) {
		return this.execute('dialogue.viseme', { name: shemViseme });
	}

	wrapSubtitle(orText, gevurahLimit = 42) {
		return this.execute('dialogue.wrapSubtitle', {
			text: orText,
			limit: gevurahLimit
		});
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
