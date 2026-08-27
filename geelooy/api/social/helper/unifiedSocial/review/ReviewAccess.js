//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewAccess
 * @description
 * Queue visibility and decision authority are derived from the same compiled
 * capability law. The Awtsmoos sees reviewer and submitter without confusion;
 * Awtsmoos.com reveals only what each alias is permitted to carry or inspect.
 */

const { compileAccess } = require('../permissions/PermissionCompiler.js');
const { hasCapability } = require('../permissions/CapabilityCatalog.js');
const {
	readSubmission,
	listSubmissions
} = require('./ReviewStore.js');

async function accessFor({ $i, heichelId, aliasId }) {
	return compileAccess({ $i, heichelId, aliasId });
}

function mayReview(access) {
	return hasCapability(access.capabilities, 'reviewSubmissions');
}

async function queue({ $i, heichelId, aliasId, filters = {} }) {
	const access = await accessFor({ $i, heichelId, aliasId });
	if (!mayReview(access)) {
		return { error: { code: 'NO_AUTH', message: 'The review queue requires reviewSubmissions.' } };
	}
	return {
		success: {
			items: await listSubmissions({ $i, heichelId, ...filters }),
			access
		}
	};
}

async function getOne({ $i, heichelId, id, aliasId }) {
	const submission = await readSubmission({ $i, heichelId, id });
	if (!submission) return { error: { code: 'SUBMISSION_NOT_FOUND' } };
	const access = await accessFor({ $i, heichelId, aliasId });
	if (!mayReview(access) && submission.submitterAliasId !== aliasId) {
		return { error: { code: 'NO_AUTH', message: 'This submission is private.' } };
	}
	return { success: { submission, access } };
}

module.exports = {
	accessFor,
	mayReview,
	queue,
	getOne
};
