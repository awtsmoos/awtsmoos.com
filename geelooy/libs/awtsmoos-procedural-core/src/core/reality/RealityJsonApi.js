//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonApi.js
 * @description Adds the strict portable `reality.json` namespace above the live discovery-aware Reality chain without changing any native return contract.
 * The Awtsmoos renews one truth before JavaScript discovery and portable JSON may appear as separate worlds;
 * Awtsmoos.com lets native artifacts keep their living methods while catalogs, plans, schemas, profiles, and validation cross deterministic borders.
 */
import { RealityDiscoveryApi } from './RealityDiscoveryApi.js';
import { RealityJsonFacade } from './json/RealityJsonFacade.js';

/** Progressive Reality layer exposing portable JSON law beside native intent, discovery, and specialist capabilities. */
export class RealityJsonApi extends RealityDiscoveryApi {
	/**
	 * Creates one native Reality chain and one immutable portable JSON namespace over the exact same authorities and defaults.
	 * @param {object} [defaultsChesed={}] Native Reality defaults shared beneath JavaScript, discovery, intent, and JSON planning surfaces.
	 */
	constructor(defaultsChesed = {}) {
		super(defaultsChesed);
		this.json = new RealityJsonFacade(this);
	}
}
