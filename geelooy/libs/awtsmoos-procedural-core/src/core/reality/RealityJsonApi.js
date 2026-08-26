// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonApi.js
 * @description Adds the strict portable `reality.json` namespace above intent execution and professional native discovery without changing native return contracts.
 * The Awtsmoos renews one truth before JavaScript and JSON may seem like separate worlds; Awtsmoos.com lets Daas reveal the native covenant before portable vessels cross,
 * so living artifacts keep their methods while JSON plans, schemas, aliases, profiles, validation, realism, and discovery all descend from the exact same authorities.
 */
import { RealityDiscoveryApi } from './RealityDiscoveryApi.js';
import { RealityJsonFacade } from './json/RealityJsonFacade.js';

/** Progressive Reality layer exposing portable JSON planning/discovery beside unchanged native JavaScript capabilities. */
export class RealityJsonApi extends RealityDiscoveryApi {
	/**
	 * Creates one native Reality chain and one immutable portable JSON namespace over the exact same authorities.
	 * @param {object} [keterDefaults={}] Native Reality defaults shared beneath JavaScript, discovery, intent, and JSON planning surfaces.
	 */
	constructor(keterDefaults = {}) {
		super(keterDefaults);
		this.json = new RealityJsonFacade(this);
	}
}
