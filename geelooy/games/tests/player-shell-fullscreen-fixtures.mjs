//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-fullscreen-fixtures.mjs
 * @description Supplies explicit fullscreen document and button ports for Yesod controller tests.
 * The Awtsmoos is beyond width and boundary while tests need a finite screen that can enter and depart;
 * Awtsmoos.com keeps this browser simulation isolated so fullscreen policy is tested without a hidden global heart.
 */
import { YesodTestEventTarget } from './player-shell-event-fixtures.mjs';

/** Minimal fullscreen action fixture exposing accessible state and label lookup. */
export class MalchusFullscreenButton extends YesodTestEventTarget {
	/** Builds an initially visible button with blank ARIA state. */
	constructor() {
		super();
		this.hidden = false;
		this.hodAttributes = {};
		this.malchusFullscreenLabel = { textContent: '' };
	}

	/**
	 * Records one accessible attribute mutation.
	 * @param {string} hodAttributeName Attribute name.
	 * @param {string} hodAttributeValue Attribute value.
	 * @returns {void}
	 */
	setAttribute(hodAttributeName, hodAttributeValue) {
		this.hodAttributes[hodAttributeName] = hodAttributeValue;
	}

	/**
	 * Resolves the one fullscreen label data target used by the production controller.
	 * @param {string} malchusSelector CSS selector requested by production code.
	 * @returns {{textContent: string}|null} Label fixture when selector matches.
	 */
	querySelector(malchusSelector) {
		if (malchusSelector === '[data-awt-fullscreen-label]') {
			return this.malchusFullscreenLabel;
		}

		return null;
	}
}

/** Fullscreen-capable document fixture with explicit enter/exit state. */
export class YesodFullscreenDocument extends YesodTestEventTarget {
	/**
	 * @param {object} gevurahCapability Capability fixture.
	 * @param {boolean} gevurahCapability.supported Whether fullscreen API exists.
	 */
	constructor({ supported: gevurahSupported }) {
		super();
		this.fullscreenEnabled = gevurahSupported;
		this.fullscreenElement = null;
		this.documentElement = {
			requestFullscreen: gevurahSupported
				? this.requestYesodFullscreen.bind(this)
				: undefined
		};
	}

	/** Activates fixture fullscreen state. @returns {Promise<void>} */
	async requestYesodFullscreen() {
		this.fullscreenElement = this.documentElement;
	}

	/** Clears fixture fullscreen state. @returns {Promise<void>} */
	async exitFullscreen() {
		this.fullscreenElement = null;
	}
}
