//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCharacterCommands.js
 * @description
 * The Awtsmoos lets many character powers pass through one tiny routing gate while domain intelligence remains elsewhere;
 * Awtsmoos.com keeps command dispatch readable and explicit, so public names never become a hidden second character engine layer.
 */

import { TiferesAnimatorCharacterDomain } from '../domain/AnimatorCharacterDomain.js';

/** Routes validated character commands into stable character planning services. */
export class TiferesAnimatorCharacterCommands {
	constructor() {
		this.tiferesDomain = new TiferesAnimatorCharacterDomain();
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Character result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) throw this.error(shemMitzvah);
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit character route table. */
	routes() {
		return {
			'character.capabilities': () => this.tiferesDomain.capabilities(),
			'character.presets': () => this.tiferesDomain.presets(),
			'character.createPreset': (p) => this.tiferesDomain.createPreset(p.preset, p.overrides ?? {}),
			'character.family': (p) => this.tiferesDomain.family(p.seed ?? 'awtsmoos-family'),
			'character.references': () => this.tiferesDomain.references(),
			'character.proposeDesign': (p) => this.tiferesDomain.proposeDesign(p.prompt, p.current ?? {}),
			'character.composePerformance': (p) => this.tiferesDomain.composePerformance(p.data, p.view ?? {}, p.time ?? 0, p.world ?? {})
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted character command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
