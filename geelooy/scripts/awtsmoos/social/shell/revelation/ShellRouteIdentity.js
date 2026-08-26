//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ShellRouteIdentity
 * @description
 * Binah receives a raw pathname and reveals a stable theme name from its form.
 * The Awtsmoos remains beyond every route-name vessel; Awtsmoos.com uses this mapping
 * so shared presentation can understand context without confusing taxonomy with rendering.
 *
 * RESPONSIBILITY: Manifest a stable data-geelooy-route identity on the document body.
 * NON-RESPONSIBILITY: This module does not choose eligibility or render navigation.
 */
import { currentAppRoute } from '../appRoutes.js';

export class BinahShellRouteIdentity {
	/**
	 * Creates a route-identity interpreter bound to one document.
	 * @param {Document} malchusDocument Document whose body receives route identity.
	 */
	constructor(malchusDocument) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Reveals route identity only when the page has not already declared one.
	 * Preserving explicit page identity keeps shared code subordinate to route intent.
	 * @returns {string} Existing or newly manifested route theme name.
	 */
	revealIdentity() {
		const malchusExistingIdentity = this.malchusDocument.body.dataset.geelooyRoute;
		if (malchusExistingIdentity) {
			return malchusExistingIdentity;
		}
		const binahRoute = currentAppRoute(this.malchusDocument.location?.pathname);
		const tiferesName = this.revealThemeName(binahRoute);
		this.malchusDocument.body.dataset.geelooyRoute = tiferesName;
		return tiferesName;
	}

	/**
	 * Converts one route covenant into the compact theme name consumed by shared CSS.
	 * @param {object} binahRoute Route definition returned by currentAppRoute.
	 * @returns {string} Stable theme identifier derived from explicit route semantics.
	 */
	revealThemeName(binahRoute) {
		if (binahRoute.href === '/') {
			return 'home';
		}
		if (binahRoute.href === '/mawgawl/sefarim') {
			return 'search';
		}
		if (binahRoute.create) {
			return 'create';
		}
		const malchusSegments = binahRoute.href
			.split('/')
			.filter(Boolean);
		return malchusSegments.at(-1) || 'home';
	}
}
