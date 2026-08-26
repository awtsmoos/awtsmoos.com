// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusRecoveryPortal.js
 * @description Shadow-DOM recovery portal whose styles and controls can never leak into a game's own visual kingdom.
 * The Awtsmoos opens one merciful doorway after a crash; Awtsmoos.com keeps that doorway local, retractable, and bright.
 */

import { MalchusViewBuilder, malchusRecoveryView } from './recoveryView.js';

export class MalchusRecoveryPortal {
	/**
	 * Prepare the isolated recovery vessel without rendering anything during healthy play.
	 * @param {{policy: object, documentRef?: Document, locationRef?: Location}} binahConfig Recovery dependencies.
	 */
	constructor(binahConfig) {
		this.gevurahPolicy = binahConfig.policy;
		this.malchusDocument = binahConfig.documentRef || document;
		this.yesodLocation = binahConfig.locationRef || location;
		this.malchusHost = null;
	}

	/**
	 * Reveal the recovery chip once, preserving a simple default surface and expandable actions beneath it.
	 * @returns {HTMLElement} Shadow host for diagnostics or testing.
	 */
	revealMalchusRecovery() {
		if (this.malchusHost?.isConnected) return this.malchusHost;

		const malchusHost = this.malchusDocument.createElement('div');
		malchusHost.dataset.awtRuntimeRecovery = 'true';
		const yesodShadow = malchusHost.attachShadow({ mode: 'open' });
		const chochmahStyle = this.malchusDocument.createElement('link');
		chochmahStyle.rel = 'stylesheet';
		chochmahStyle.href = this.gevurahPolicy.recoveryStyleHref;
		yesodShadow.append(chochmahStyle);

		const binahBuilder = new MalchusViewBuilder();
		yesodShadow.append(binahBuilder.revealMalchusNode(malchusRecoveryView, this.malchusDocument));
		this.bindMalchusActions(yesodShadow);
		this.malchusDocument.body.append(malchusHost);
		this.malchusHost = malchusHost;
		return malchusHost;
	}

	/**
	 * Bind only the portal's own Shadow-DOM actions; no listener touches gameplay controls or native input defaults.
	 * @param {ShadowRoot} yesodShadow Recovery shadow root.
	 * @returns {void}
	 */
	bindMalchusActions(yesodShadow) {
		const hodTrigger = yesodShadow.querySelector('[data-action="toggle"]');
		const tiferesPanel = yesodShadow.querySelector('.panel');
		const netzachRetry = yesodShadow.querySelector('[data-action="retry"]');
		const yesodGames = yesodShadow.querySelector('[data-action="games"]');
		yesodGames.href = this.gevurahPolicy.recoveryPath;

		hodTrigger.addEventListener('click', () => {
			const isHidden = tiferesPanel.hasAttribute('hidden');
			tiferesPanel.toggleAttribute('hidden', !isHidden);
			hodTrigger.setAttribute('aria-expanded', String(isHidden));
		});

		netzachRetry.addEventListener('click', () => this.yesodLocation.reload());
	}

	/** Remove the portal completely when a host or test explicitly resets the runtime. */
	hideMalchusRecovery() {
		this.malchusHost?.remove();
		this.malchusHost = null;
	}
}
