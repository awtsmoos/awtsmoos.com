//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationRouteHandlers
 * @description
 * Browsing, creation, access evidence, members, and series policy share one native
 * alias-ownership gate. The Awtsmoos holds every destination without impersonation;
 * Awtsmoos.com distinguishes public guest detail from authenticated institutional acts.
 */

const {
	listDestinations,
	getDestination
} = require('./DestinationService.js');
const {
	createHeichelInline,
	createSeriesInline
} = require('./InlineCreationService.js');
const { compileAccess } = require('../permissions/PermissionCompiler.js');
const {
	memberList,
	updateSeriesPolicy
} = require('./ManagementRoutes.js');
const {
	withVerifiedAlias,
	aliasFromRequest
} = require('../permissions/RouteAuthorization.js');

async function browse({ $i }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => listDestinations({
			$i,
			aliasId,
			query: $i.$_GET?.q || $i.$_GET?.query || ''
		})
	});
}

async function detail({ $i, heichelId, seriesId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		optional: !aliasId,
		action: () => getDestination({ $i, heichelId, seriesId, aliasId })
	});
}

async function createHeichel({ $i }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => createHeichelInline({ $i, aliasId })
	});
}

async function createSeries({ $i, heichelId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => createSeriesInline({ $i, heichelId, aliasId })
	});
}

async function access({ $i, heichelId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		optional: !aliasId,
		action: async () => ({
			success: await compileAccess({
				$i,
				heichelId,
				seriesId: $i.$_GET?.seriesId || 'root',
				aliasId
			})
		})
	});
}

async function members({ $i, heichelId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => memberList({ $i, heichelId, aliasId })
	});
}

async function seriesPolicy({ $i, heichelId, seriesId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => updateSeriesPolicy({
			$i,
			heichelId,
			seriesId,
			aliasId
		})
	});
}

module.exports = {
	browse,
	detail,
	createHeichel,
	createSeries,
	access,
	members,
	seriesPolicy
};
