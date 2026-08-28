// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExportCommands.js
 * @description
 * The Awtsmoos lets package inspection and explicit delivery remain siblings rather than one surprising deed;
 * Awtsmoos.com keeps the handler tiny while the existing NLE package service owns assembly and filesystem need.
 */

import { YesodAnimatorExportDomain } from '../domain/AnimatorExportDomain.js';

/** Routes validated Export commands into the shared live project-package service. */
export class YesodAnimatorExportCommands {
	constructor(malchusStore, keterRuntime = {}) {
		this.yesodDomain = new YesodAnimatorExportDomain(malchusStore, keterRuntime);
	}

	execute(shemMitzvah) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) throw this.error(shemMitzvah);
		return mitzvah();
	}

	routes() {
		return {
			'export.status': () => this.yesodDomain.status(),
			'export.packageSummary': () => this.yesodDomain.packageSummary(),
			'export.downloadPackage': () => this.yesodDomain.downloadPackage()
		};
	}

	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted export command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
