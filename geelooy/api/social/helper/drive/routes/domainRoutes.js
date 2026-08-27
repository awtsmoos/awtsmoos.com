//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRoutes
 * @description
 * The Awtsmoos places every custom-domain action behind the same alias Drive covenant;
 * Awtsmoos.com keeps routes thin so HTTP never becomes a second ownership engine.
 */

const { requireDriveActor } = require('../authorization.js');
const {
	createDomainClaim,
	deleteDomainClaim,
	getDomainClaim,
	listDomainClaims
} = require('../domainClaimService.js');
const {
	verifyDomainDelegation,
	verifyDomainOwnership
} = require('../domainVerificationService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/sites/:siteId/domains': (variables) => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST']);
		await authorize(
			variables.aliasId,
			method === 'GET' ? 'drive.read' : 'drive.write',
			$i,
			userid
		);
		if (method === 'GET') {
			return {
				domains: await listDomainClaims(optionsFor(variables, $i))
			};
		}
		return {
			domain: await createDomainClaim({
				...optionsFor(variables, $i),
				input: bodyFor($i)
			})
		};
	}),
	'/drive/:aliasId/sites/:siteId/domains/:hostname': (variables) => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'DELETE']);
		await authorize(
			variables.aliasId,
			method === 'GET' ? 'drive.read' : 'drive.write',
			$i,
			userid
		);
		const options = optionsFor(variables, $i);
		if (method === 'GET') {
			return {
				domain: await getDomainClaim(options)
			};
		}
		return {
			domain: await deleteDomainClaim(options)
		};
	}),
	'/drive/:aliasId/sites/:siteId/domains/:hostname/verify': (variables) => safeRoute(async () => {
		requireMethod($i, ['POST']);
		await authorize(variables.aliasId, 'drive.write', $i, userid);
		return {
			domain: await verifyDomainOwnership(optionsFor(variables, $i))
		};
	}),
	'/drive/:aliasId/sites/:siteId/domains/:hostname/verify-delegation': (variables) => safeRoute(async () => {
		requireMethod($i, ['POST']);
		await authorize(variables.aliasId, 'drive.write', $i, userid);
		return {
			domain: await verifyDomainDelegation(optionsFor(variables, $i))
		};
	})
});

function optionsFor(variables, $i) {
	return {
		aliasId: variables.aliasId,
		siteId: variables.siteId,
		hostname: variables.hostname,
		$i
	};
}

async function authorize(aliasId, requiredScope, $i, userid) {
	return requireDriveActor({
		aliasId,
		requiredScope,
		requestId: $i.request?.headers?.['x-request-id'] || null,
		$i,
		userid
	});
}
