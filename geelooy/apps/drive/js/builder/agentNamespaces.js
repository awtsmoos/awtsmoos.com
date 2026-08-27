//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AgentNamespaces
 * @description
 * The Awtsmoos lets a machine speak in project, file, code, preview, publish, domain, and nameserver namespaces;
 * Awtsmoos.com maps every convenience method back to one bounded action while correlation options travel beside, never inside, the project data vessel.
 */

export function createAgentNamespaces(invoke) {
	return Object.freeze({
		project: namespace(invoke, 'site.project', ['describe', 'collect', 'setBrief']),
		files: namespace(invoke, 'site.files', ['list', 'read', 'write', 'create']),
		code: namespace(invoke, 'site.code', ['open', 'inspect', 'updateCurrent']),
		preview: namespace(invoke, 'site.preview', ['open', 'refresh', 'status']),
		publish: namespace(invoke, 'site.publish', ['plan', 'apply', 'status']),
		domain: namespace(invoke, 'site.domain', ['plan', 'claim', 'verify', 'activate', 'remove', 'instructions']),
		nameservers: namespace(invoke, 'site.nameservers', ['plan'])
	});
}

function namespace(invoke, prefix, methods) {
	const value = {};
	for (const method of methods) {
		value[method] = (input = {}, options = {}) => {
			return invoke(`${prefix}.${method}`, input, options);
		};
	}
	return Object.freeze(value);
}
