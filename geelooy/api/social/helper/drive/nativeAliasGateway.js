//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeAliasGateway
 * @description
 * The Awtsmoos binds service work to the same identity tree as every human alias.
 * Awtsmoos.com refuses split ownership and invokes the native alias creator once.
 */

const { sp } = require('../_awtsmoos.constants.js');
const { createNewAlias } = require('../alias.js');

async function ensureNativeServiceAlias(options, dependencies = {}) {
	const existing = await readNativeAlias(options);
	if (existing.present) return validateExistingAlias(options, existing);
	const createAlias = dependencies.createAlias || createNewAlias;
	const aliasContext = Object.create(options.$i);
	aliasContext.$_POST = {
		aliasName: options.aliasName,
		description: options.description,
		inputId: options.aliasId
	};
	const result = await createAlias({ $i: aliasContext, userid: options.ownerUserId });
	if (result?.error) throw gatewayError('SERVICE_ALIAS_CREATE_FAILED', 400);
	if (result?.aliasId !== options.aliasId) {
		throw gatewayError('SERVICE_ALIAS_ID_MISMATCH');
	}
	const verified = await readNativeAlias(options);
	const alias = validateExistingAlias(options, verified);
	return { ...alias, created: true };
}

async function readNativeAlias(options) {
	const infoPath = `${sp}/aliases/${options.aliasId}/info`;
	const ownerPath = `/users/${options.ownerUserId}/aliases/${options.aliasId}`;
	const [info, ownerLink] = await Promise.all([
		options.$i.db.get(infoPath),
		options.$i.db.get(ownerPath)
	]);
	return { info, ownerLink, present: Boolean(info || ownerLink) };
}

function validateExistingAlias(options, existing) {
	if (!existing.info || !existing.ownerLink) {
		throw gatewayError('SERVICE_ALIAS_OWNERSHIP_INCONSISTENT');
	}
	if (String(existing.info.user) !== options.ownerUserId) {
		throw gatewayError('SERVICE_ALIAS_OWNED_BY_DIFFERENT_USER');
	}
	return {
		aliasId: options.aliasId,
		aliasName: existing.info.name,
		ownerUserId: options.ownerUserId,
		created: false
	};
}

function gatewayError(code, statusCode = 409) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	ensureNativeServiceAlias,
	readNativeAlias,
	validateExistingAlias,
	gatewayError
};
