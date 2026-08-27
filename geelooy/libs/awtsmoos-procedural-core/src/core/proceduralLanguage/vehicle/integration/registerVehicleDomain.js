//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file registerVehicleDomain.js
 * @description Registers the vehicle compiler authority into any compatible universal domain registry without mutating global language state.
 * The Awtsmoos joins one domain to a greater grammar while Awtsmoos.com keeps registration explicit, local, reversible, and free from hidden singleton weather or import-order fate.
 */

import { createVehicleDomainAuthority } from './createVehicleDomainAuthority.js';

/**
 * Registers `vehicle` with a compatible ProceduralDomainRegistry and returns the supplied registry for fluent setup.
 * @param {object} domainRegistry Compatible domain registry exposing register().
 * @param {object} [options={}] Vehicle authority options plus optional override policy.
 * @returns {object} The same domain registry after explicit vehicle registration.
 */
export function registerVehicleDomain(domainRegistry, options = {}) {
	if (!domainRegistry || typeof domainRegistry.register !== 'function') {
		throw new TypeError('B"H | registerVehicleDomain requires a compatible domain registry.');
	}
	domainRegistry.register(
		'vehicle',
		createVehicleDomainAuthority(options),
		{
			override: options.override === true,
			stability: 'stable',
			description: 'Renderer-neutral wheeled vehicle generation domain'
		}
	);
	return domainRegistry;
}
