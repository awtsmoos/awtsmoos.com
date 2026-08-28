// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDocumentCommands.js
 * @description
 * The Awtsmoos lets one canonical Studio document pass through read, proof, parse, serialization, and deliberate install;
 * Awtsmoos.com keeps this handler thin so document truth remains inside the codec rather than growing another parallel will.
 */

import { BinahAnimatorDocumentDomain } from '../domain/AnimatorDocumentDomain.js';

/** Routes validated Studio-document commands into the canonical codec-backed domain. */
export class BinahAnimatorDocumentCommands {
	constructor(malchusStore) {
		this.binahDomain = new BinahAnimatorDocumentDomain(malchusStore);
	}

	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) throw this.error(shemMitzvah);
		return mitzvah(keilim);
	}

	routes() {
		return {
			'document.current': () => this.binahDomain.current(),
			'document.validate': (p) => this.binahDomain.validate(p.document),
			'document.parse': (p) => this.binahDomain.parse(p.text),
			'document.serialize': (p) => this.binahDomain.serialize(p.document ?? null),
			'document.install': (p) => this.binahDomain.install(p.document)
		};
	}

	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted document command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
