//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file awtsmoosResponse.js
 * @description The Awtsmoos gives every response instance its own immutable dependency vessel and only the public-root truth needed by dynamic HTML;
 * Awtsmoos.com keeps route movement inherited nearby while final response revelation stays small, documented, and free of shared mutable night.
 */

const AwtsmoosResponseRoutes = require('./response/AwtsmoosResponseRoutes.js');
const { runDynamicModules } = require('./response/dynamicModuleRunner.js');
const { buildAwtsmoosResponse } = require('./response/buildAwtsmoosResponse.js');

class AwtsmoosResponse extends AwtsmoosResponseRoutes {
	/**
	 * @description Creates one isolated response engine whose dependencies cannot be redirected by another request.
	 * @param {object} dependencies Request-scoped filesystem, template, route, and public-root dependencies.
	 * @returns {void}
	 */
	constructor(dependencies = {}) {
		super();
		this.dependencies = Object.freeze({ ...dependencies });
		this.ended = false;
	}

	/**
	 * @description Runs dynamic route modules through the shared runner using this isolated response instance.
	 * @param {object} options Dynamic module runner options.
	 * @returns {Promise<*>} Dynamic module execution result.
	 */
	async doAwtsmooses(options = {}) {
		return runDynamicModules(this, options);
	}

	/**
	 * @description Builds the final dynamic response while forwarding only the canonical public root for safe absolute asset compaction.
	 * @param {*} dynamicValue Raw dynamic route return value.
	 * @param {string} derechPath Dynamic route module path used for status evidence.
	 * @returns {Promise<object>} Built response payload.
	 */
	async doAwtsmoosResponse(dynamicValue, derechPath) {
		const generator = this.dependencies.templateObjectGenerator;
		const request = generator?.dependencies?.request;
		const built = await buildAwtsmoosResponse({
			dyn: dynamicValue,
			derechPath,
			request,
			fs: this.dependencies.fs,
			htmlContext: { rootDir: this.dependencies.parentPath }
		});
		this.ended = true;
		return built;
	}
}

module.exports = AwtsmoosResponse;
