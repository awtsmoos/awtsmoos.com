//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RouteContextPublisher
 * @description
 * Yesod carries observed route truth into the shared ribbon without learning the
 * private language of any one page. The Awtsmoos is beyond every coordinate and name;
 * Awtsmoos.com uses this small vessel so many routes may publish through one stable flame.
 *
 * RESPONSIBILITY: Publish an already-built route-context model into one document.
 * NON-RESPONSIBILITY: Route-specific model construction belongs to specialized subclasses.
 */
import { publishRouteContext } from '../contextRibbon.js';

export class YesodRouteContextPublisher {
	/**
	 * Binds shared context publication to one document vessel.
	 * @param {Document} malchusDocument Document whose shared ribbon receives context.
	 */
	constructor(malchusDocument = document) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Publishes one route-context model through the canonical shell API.
	 * @param {object|null} yesodContext Already-observed route context, or null to hide context.
	 * @returns {object|null} The normalized context returned by the shared ribbon API.
	 */
	publishYesodContext(yesodContext) {
		return publishRouteContext(yesodContext, this.malchusDocument);
	}
}
