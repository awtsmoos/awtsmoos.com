//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRoutes
 * @description
 * The Awtsmoos opens bounded doors for ownership, verification, and deploy-aware
 * routing without opening the server itself. Awtsmoos.com reuses Drive actor scopes,
 * while each request remains held inside its own closure instead of mutable global refs.
 * Thus Chesed may open the doorway, Gevurah may guard it, and Tiferes may return truth.
 */

const { requireDriveActor } = require('../authorization.js');
const { activateDomainRoute, deactivateDomainRoute } = require('../domainActivationService.js');
const { domainInfrastructure } = require('../domainInfrastructure.js');
const {
	deleteDomainClaim,
	getDomainClaim,
	listDomainClaims,
	putDomainClaim,
	verifyDomainClaim
} = require('../domainClaimService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

/**
 * Builds domain routes around the exact request context that invoked them.
 * @param {object} options Route factory options.
 * @param {object} options.$i Awtsmoos request context.
 * @param {string|null} options.userid Logged-in user identity when present.
 * @returns {object} Domain route handlers.
 */
module.exports = ({ $i, userid }) => {
	const authorize = (aliasId, requiredScope) => requireDriveActor({
		aliasId,
		requiredScope,
		userid,
		$i
	});
	const guarded = (variables, method, scope, action) => safeRoute(async () => {
		requireMethod($i, [method]);
		await authorize(variables.aliasId, scope);
		return action();
	});

	return {
		'/drive/:aliasId/domains': variables => guarded(variables, 'GET', 'drive.read', async () => ({
			domains: await listDomainClaims(variables.aliasId, $i)
		})),
		'/drive/:aliasId/hosting/infrastructure': variables => guarded(
			variables,
			'GET',
			'drive.read',
			async () => ({ infrastructure: domainInfrastructure($i) })
		),
		'/drive/:aliasId/domains/:hostname': variables => safeRoute(async () => {
			const method = requireMethod($i, ['GET', 'DELETE']);
			await authorize(variables.aliasId, method === 'GET' ? 'drive.read' : 'drive.write');
			if (method === 'DELETE') {
				return deleteDomainClaim(variables.aliasId, variables.hostname, $i);
			}
			return { domain: await getDomainClaim(variables.aliasId, variables.hostname, $i) };
		}),
		'/drive/:aliasId/sites/:siteId/domains/:hostname': variables => guarded(
			variables,
			'PUT',
			'drive.write',
			async () => ({
				domain: await putDomainClaim({
					aliasId: variables.aliasId,
					siteId: variables.siteId,
					hostname: variables.hostname,
					input: bodyFor($i),
					$i
				})
			})
		),
		'/drive/:aliasId/domains/:hostname/verify': variables => guarded(
			variables,
			'PUT',
			'drive.write',
			async () => verifyDomainClaim({
				aliasId: variables.aliasId,
				hostname: variables.hostname,
				resolver: $i.domainResolver,
				$i
			})
		),
		'/drive/:aliasId/domains/:hostname/activate': variables => guarded(
			variables,
			'PUT',
			'drive.write',
			async () => activateDomainRoute({ aliasId: variables.aliasId, hostname: variables.hostname, $i })
		),
		'/drive/:aliasId/domains/:hostname/deactivate': variables => guarded(
			variables,
			'PUT',
			'drive.write',
			async () => deactivateDomainRoute({ aliasId: variables.aliasId, hostname: variables.hostname, $i })
		)
	};
};
