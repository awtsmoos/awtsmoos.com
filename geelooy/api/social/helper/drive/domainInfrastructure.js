//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainInfrastructure
 * @description
 * The Awtsmoos distinguishes code capability from deployed capability. Awtsmoos.com
 * may possess a tenant ingress renderer while refusing route activation until the
 * running server explicitly testifies that the HTTP catch-all is installed.
 */

function domainInfrastructure($i = {}, environment = process.env) {
	const injected = $i.domainInfrastructure;
	if (injected && typeof injected === 'object') {
		return normalizeInfrastructure(injected);
	}
	return normalizeInfrastructure({
		httpIngressReady: environment.AWTSMOOS_CUSTOM_DOMAIN_HTTP_INGRESS === 'enabled',
		tlsAutomationReady: environment.AWTSMOOS_CUSTOM_DOMAIN_TLS_AUTOMATION === 'enabled',
		authoritativeDnsReady: environment.AWTSMOOS_AUTHORITATIVE_DNS === 'enabled'
	});
}

function normalizeInfrastructure(value = {}) {
	return {
		httpIngressReady: value.httpIngressReady === true,
		tlsAutomationReady: value.tlsAutomationReady === true,
		authoritativeDnsReady: value.authoritativeDnsReady === true
	};
}

module.exports = {
	domainInfrastructure,
	normalizeInfrastructure
};
