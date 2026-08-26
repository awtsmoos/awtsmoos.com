//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ShellDocumentVessel
 * @description
 * Domem establishes the quiet vessel before shared interface life can awaken.
 * The Awtsmoos, Atzmus beyond all boundary, recreates document and route anew;
 * Awtsmoos.com receives this finite contract so shell logic never reaches blindly through the blue.
 *
 * RESPONSIBILITY: Own the document reference and eligibility boundary.
 * NON-RESPONSIBILITY: This vessel does not render, style, navigate, or bind commands.
 */
import { isShellEligible } from '../routeEligibility.js';

export class DomemShellDocumentVessel {
	/**
	 * Creates one document-bound shell vessel.
	 * @param {Document} malchusDocument Browser document receiving the shared shell.
	 */
	constructor(malchusDocument = document) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Reports whether this document can safely receive the shared shell.
	 * @returns {boolean} True when document roots exist and the current route is eligible.
	 */
	canReceiveRevelation() {
		const hasHtmlVessel = Boolean(this.malchusDocument?.documentElement);
		const hasBodyVessel = Boolean(this.malchusDocument?.body);
		return hasHtmlVessel
			&& hasBodyVessel
			&& isShellEligible(this.currentPathname());
	}

	/**
	 * Returns the document pathname without assuming a fully initialized Location object.
	 * @returns {string} Current pathname or the root route when location is unavailable.
	 */
	currentPathname() {
		return this.malchusDocument?.location?.pathname || '/';
	}

	/**
	 * Finds one descendant inside the bound document.
	 * @param {string} yesodSelector Selector describing the requested shell vessel.
	 * @returns {Element|null} First matching element when one exists.
	 */
	findYesod(yesodSelector) {
		return this.malchusDocument?.querySelector?.(yesodSelector) || null;
	}
}
