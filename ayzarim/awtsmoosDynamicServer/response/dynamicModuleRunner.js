// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DynamicModuleRunner
 * @chapter Each Dynamic Module Receives The Template Generator Of Its Own Request
 * @description
 * Loads route modules and executes their matching handler through one response owner.
 * No dependency is read from module scope, so concurrent requests cannot exchange
 * template objects, request bodies, route closures, filesystems, or response state.
 */

const { childPathFor } = require('../routing/childPath.js');

async function runDynamicModules(owner, options = {}) {
	owner.ended = false;
	const result = owner.makeDidThisPath();
	const filePath = String(options.filePath || '');
	if (filePath.includes('favicon')) return result;
	const candidates = [];
	for (const awtsmoos of options.foundAwtsmooses || []) {
		result.awtsmooseem.push(awtsmoos);
		const completed = await runOne(owner, {
			awtsmoos,
			filePath,
			extraInfo: options.extraInfo || { fetchAwtsmoos: null },
			result,
			candidates
		});
		if (completed) return result;
	}
	return result;
}

async function runOne(owner, options) {
	const dependencies = owner.dependencies;
	try {
		const derech = dependencies.path.join(
			options.awtsmoos,
			dependencies.awtsMoosification
		);
		options.result.derech = derech;
		const moduleValue = require(derech);
		const childPath = childPathFor({
			path: dependencies.path,
			derech,
			filePath: options.filePath
		});
		options.result.moose = childPath;
		const dynamicRoutes = moduleValue.dynamicRoutes || moduleValue;
		if (typeof dynamicRoutes !== 'function') return false;
		const templateObject = await dependencies.templateObjectGenerator.getTemplateObject({
			derech,
			private: () => owner.makePrivate(options.result),
			...options.extraInfo,
			use: (route, handler) => owner.handleDynamicRoutes(
				route,
				handler,
				childPath,
				options.result,
				options.candidates
			)
		});
		await dynamicRoutes(templateObject);
		return finishMatch(owner, options.result, options.candidates, derech);
	} catch (error) {
		options.result.error = {
			message: 'awtsmoos_derech_failed',
			stack: error.stack || String(error),
			awtsmoos: options.awtsmoos
		};
		return true;
	}
}

async function finishMatch(owner, result, candidates, derech) {
	const match = candidates.find(candidate => candidate.doesMatch);
	if (!match) {
		result.invalidRoute = true;
		return true;
	}
	result.c = true;
	result.matchedRoutes.push({
		route: match.route,
		vars: match.vars,
		info: match.info
	});
	try {
		result.responseInfo = await owner.doAwtsmoosResponse(match.result, derech);
	} catch (error) {
		result.error = {
			message: 'awtsmoos_response_failed',
			stack: error.stack || String(error),
			matchedRoute: match.route,
			vars: match.vars
		};
	}
	return true;
}

module.exports = {
	runDynamicModules
};
