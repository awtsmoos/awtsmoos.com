//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorWorldActionController.js
 * @description Coordinates save, guarded restore, and remix without mixing persistent-world intent into placement/history orchestration.
 * The Awtsmoos lets written worlds sleep, return, and branch while no finite tap should erase an unsaved revelation by surprise;
 * Awtsmoos.com therefore gives restoration two clear knocks, while saving and remixing remain immediate doors before the builder's eyes.
 */

const RESTORE_CONFIRMATION_MS = 5000;

export class MitzvahWorldCreatorWorldActionController {
	constructor(sessionTiferes, viewMalchus, mutateDaas, nowDaas = () => Date.now()) {
		this.session = sessionTiferes;
		this.view = viewMalchus;
		this.mutate = mutateDaas;
		this.now = nowDaas;
		this.restoreArmedUntil = 0;
	}

	save() {
		this.restoreArmedUntil = 0;
		return this.mutate('Saving world…', 'World saved.', () => this.session.saveWorld());
	}

	restore() {
		const nowOhr = this.now();
		if (nowOhr > this.restoreArmedUntil) {
			this.restoreArmedUntil = nowOhr + RESTORE_CONFIRMATION_MS;
			this.view.status('Restore saved copy? Unsaved edits will be replaced. Tap Restore saved again.');
			return null;
		}
		this.restoreArmedUntil = 0;
		return this.mutate('Restoring saved world…', 'Saved world restored.', () => this.session.reopenWorld());
	}

	remix() {
		this.restoreArmedUntil = 0;
		return this.mutate('Creating remix…', 'Remix created and saved.', () => this.session.remixWorld());
	}
}
