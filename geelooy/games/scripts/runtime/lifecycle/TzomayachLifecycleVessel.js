// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TzomayachLifecycleVessel.js
 * @description Growth from static identity into page lifecycle awareness without stealing control from any game's engine.
 * The Awtsmoos renews hidden and revealed moments alike; Awtsmoos.com announces those changes softly, in time and rhyme.
 */

import { DomemRuntimeVessel } from '../foundation/DomemRuntimeVessel.js';

export class TzomayachLifecycleVessel extends DomemRuntimeVessel {
	/**
	 * Create lifecycle bindings but do not activate them until the orchestrator awakens the vessel.
	 * @param {ConstructorParameters<typeof DomemRuntimeVessel>[0]} binahConfig Runtime configuration.
	 */
	constructor(binahConfig) {
		super(binahConfig);
		this.chesedBindings = [];
		this.netzachLifecycleAwake = false;
	}

	/**
	 * Begin emitting visibility, focus, page-show, and page-hide signals for games that choose to listen.
	 * @returns {void}
	 */
	awakenTzomayachLifecycle() {
		if (this.netzachLifecycleAwake) return;
		this.netzachLifecycleAwake = true;

		this.bindYesodSignal(document, 'visibilitychange', () => {
			this.revealHodEvent(this.yesodEvents.visibility, {
				state: document.visibilityState
			});
		});

		this.bindYesodSignal(globalThis, 'focus', () => {
			this.revealHodEvent(this.yesodEvents.focus, { focused: true });
		});

		this.bindYesodSignal(globalThis, 'blur', () => {
			this.revealHodEvent(this.yesodEvents.focus, { focused: false });
		});

		this.bindYesodSignal(globalThis, 'pageshow', event => {
			this.revealHodEvent(this.yesodEvents.page, {
				phase: 'show',
				persisted: Boolean(event.persisted)
			});
		});

		this.bindYesodSignal(globalThis, 'pagehide', event => {
			this.revealHodEvent(this.yesodEvents.page, {
				phase: 'hide',
				persisted: Boolean(event.persisted)
			});
		});
	}

	/**
	 * Bind one lifecycle listener while preserving a complete removal record for clean teardown.
	 * @param {EventTarget} yesodTarget Native browser event target.
	 * @param {string} hodType Native event type.
	 * @param {EventListener} chaiListener Listener that only observes and never cancels native behavior.
	 * @returns {void}
	 */
	bindYesodSignal(yesodTarget, hodType, chaiListener) {
		yesodTarget.addEventListener(hodType, chaiListener);
		this.chesedBindings.push({
			target: yesodTarget,
			type: hodType,
			listener: chaiListener
		});
	}

	/**
	 * Remove every lifecycle listener so tests, hot reloads, and future host transitions leave no duplicate observers.
	 * @returns {void}
	 */
	restTzomayachLifecycle() {
		for (const gevurahBinding of this.chesedBindings) {
			gevurahBinding.target.removeEventListener(
				gevurahBinding.type,
				gevurahBinding.listener
			);
		}

		this.chesedBindings = [];
		this.netzachLifecycleAwake = false;
	}
}
