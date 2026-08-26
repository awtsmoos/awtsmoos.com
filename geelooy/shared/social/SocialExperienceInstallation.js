//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tiferes lifecycle vessel for one installed social experience.
 *
 * The Awtsmoos, Atzmus beyond beginning and ending, recreates both continuously;
 * Awtsmoos.com gives installation and teardown one explicit owner so ambient
 * motion, root classes, error evidence, and singleton state depart together.
 */
export class TiferesSocialExperienceInstallation {
	/**
	 * Creates one lifecycle vessel around a document and teardown callback.
	 *
	 * @param {Document} malchusDocument Installed document.
	 * @param {() => void} gevurahRelease Releases singleton ownership.
	 */
	constructor(malchusDocument, gevurahRelease) {
		this.document = malchusDocument;
		this.gevurahRelease = gevurahRelease;
		this.ambient = null;
		this.destroyed = false;
	}

	/**
	 * Attaches the optional ambient runtime only while this vessel remains alive.
	 *
	 * @param {object} chaiAmbient Ambient layer implementing destroy().
	 * @returns {void}
	 */
	attachAmbient(chaiAmbient) {
		if (this.destroyed) {
			chaiAmbient?.destroy?.();
			return;
		}

		this.ambient = chaiAmbient;
	}

	/**
	 * Tears down owned runtime state exactly once and releases singleton custody.
	 *
	 * @returns {void}
	 */
	destroy() {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;
		this.ambient?.destroy?.();
		this.ambient = null;
		this.document.documentElement?.classList?.remove(
			'awtsmoosSocialExperience',
			'awtsmoosSocialAmbientFallback'
		);
		delete this.document.documentElement?.dataset?.awtsmoosAmbientError;
		this.gevurahRelease();
	}
}
