//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteProjectStatus
 * @description
 * The Awtsmoos reveals one published folder as a project with honest attachments;
 * Awtsmoos.com names what is ready, what is requested, and what remains unbound
 * while domain testimony stays secret-free and source publication stays canonical.
 */

const EMPTY_DOMAINS = Object.freeze({
	status: 'unattached',
	attachedCount: 0,
	domains: []
});

function projectPublicationStatus(aliasId, site, readiness, domainStatus = EMPTY_DOMAINS) {
	const projectId = site?.id || 'home';
	const staticState = readiness.ready ? 'ready' : readiness.status;
	return {
		version: 2,
		projectId,
		title: site?.title || projectId,
		ownerAlias: aliasId,
		rootPath: readiness.rootPath,
		mode: 'static',
		publication: {
			state: staticState,
			route: publicRoute(aliasId, site),
			primary: site?.primary !== false,
			enabled: site?.enabled !== false,
			subdomainRequested: Boolean(site?.subdomainRequested),
			entryPoint: readiness.entryPoint,
			publicFileCount: readiness.publicFileCount,
			publicBytes: readiness.publicBytes
		},
		domains: domainStatus,
		stages: stageStatus(staticState, site, domainStatus.status)
	};
}

function publicRoute(aliasId, site) {
	const alias = encodeURIComponent(aliasId);
	if (!site || site.primary) return `/sites/${alias}/`;
	return `/sites/${alias}/${encodeURIComponent(site.id)}/`;
}

function stageStatus(staticState, site, customDomainState) {
	return {
		build: {
			files: 'ready',
			code: 'ready'
		},
		run: {
			runtime: 'unattached',
			database: 'unattached',
			auth: 'unattached'
		},
		ship: {
			static: staticState,
			subdomain: site?.subdomainRequested ? 'requested' : 'available',
			customDomain: customDomainState
		},
		connect: {
			git: 'unattached',
			tunnel: 'unattached',
			social: 'unattached'
		}
	};
}

module.exports = {
	projectPublicationStatus,
	publicRoute
};
