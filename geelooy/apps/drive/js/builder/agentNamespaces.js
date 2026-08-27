//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AgentNamespaces
 * @description
 * The Awtsmoos lets a machine speak in clear project, file, code, preview, publish, domain, and nameserver namespaces.
 * Awtsmoos.com maps every convenience method back to one named bounded action, so language stays clean and authority stays singular.
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
	for (const method of methods) value[method] = input => invoke(`${prefix}.${method}`, input);
	return Object.freeze(value);
}
