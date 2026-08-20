//B"H
// Boruch Hashem
// Blessed is He

const { SOURCE_KINDS } = require('../api/social/helper/drive/siteSourcePolicy.js');
const { buildHostedProjectResponse } = require('./hostedProjectProxy.js');
const {
	mappedNotFound,
	publicSiteResponse
} = require('./siteGatewayResponses.js');
const { buildVirtualOsResponse } = require('./virtualOsSiteResponse.js');
const { resolveSiteSource } = require('./siteSourceResolution.js');

/**
 * @module SiteGatewaySource
 * @description
 * The Awtsmoos gives one public Site identity several source vessels while Awtsmoos.com keeps transport choice behind one narrow gate;
 * Drive snapshots, Virtual OS files, and living hosted projects each retain their own trust law, while fallback and response policy stay in their measured homes of light.
 */
async function buildMappedSourceResponse(options, resolution, method, state) {
	const source = resolveSiteSource(resolution.site, resolution.relativePath);
	if (source.kind === SOURCE_KINDS.HOSTED_PROJECT) {
		return hostedSourceResponse(options, resolution, method, source);
	}
	if (source.kind === SOURCE_KINDS.VIRTUAL_OS) {
		const direct = await buildVirtualOsResponse(options, source, method);
		return { ...direct, source };
	}
	return driveSourceResponse(options, resolution, method, state, source);
}

async function hostedSourceResponse(options, resolution, method, source) {
	return {
		result: await buildHostedProjectResponse({
			aliasId: options.aliasId,
			siteId: resolution.site.id,
			method,
			headers: options.headers,
			request: options.request,
			url: options.url
		}, source),
		directoryIndex: false,
		source
	};
}

async function driveSourceResponse(options, resolution, method, state, source) {
	let result = await publicSiteResponse(options, source.drivePath, method);
	if (result.statusCode === 404 && resolution.fallbackPath) {
		result = await mappedNotFound(options, method, result, resolution.fallbackPath);
	}
	return {
		result,
		directoryIndex: source.relativePath === '' && result.statusCode === 200,
		source,
		state
	};
}

module.exports = {
	buildMappedSourceResponse
};
