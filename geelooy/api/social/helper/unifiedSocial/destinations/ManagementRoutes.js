//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationManagementRoutes
 * @description
 * Member evidence and series policy changes are isolated from ordinary browsing.
 * The Awtsmoos holds governance and discovery in one palace; Awtsmoos.com keeps
 * the stronger administrative gates explicit and independently testable.
 */

const {
	compileAccess,
	compileMemberList
} = require('../permissions/PermissionCompiler.js');
const { hasCapability } = require('../permissions/CapabilityCatalog.js');
const { writeSeriesPolicy } = require('../permissions/PolicyResolver.js');

function denied(capability) {
	return {
		error: {
			code: 'NO_AUTH',
			message: `This action requires ${capability}.`
		}
	};
}

async function memberList({ $i, heichelId, aliasId }) {
	const access = await compileAccess({ $i, heichelId, aliasId });
	if (!hasCapability(access.capabilities, 'manageMembers')) {
		return denied('manageMembers');
	}
	return {
		success: await compileMemberList({
			$i,
			heichelId
		})
	};
}

async function updateSeriesPolicy({ $i, heichelId, seriesId, aliasId }) {
	const access = await compileAccess({
		$i,
		heichelId,
		seriesId,
		aliasId
	});
	if (!hasCapability(access.capabilities, 'manageSettings')) {
		return denied('manageSettings');
	}
	return {
		success: await writeSeriesPolicy({
			$i,
			heichelId,
			seriesId,
			policy: $i.$_POST?.policy || $i.$_POST
		})
	};
}

module.exports = {
	denied,
	memberList,
	updateSeriesPolicy
};
