//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeAliasGateway
 * @description
 * The Awtsmoos binds a service messenger to the native alias covenant.
 * Awtsmoos.com maps the inspected helper contract while preserving ownership.
 */

const { sp } = require('../_awtsmoos.constants.js');
const { createNewAlias } = require('../alias.js');
const {
	describeFunctionContract,
	selectContractParameters,
	nativeAliasContractError
} = require('./nativeAliasContract.js');

class NativeAliasGateway {
	constructor(nativeCreator = createNewAlias) {
		this.nativeCreator = nativeCreator;
		this.contract = describeFunctionContract(nativeCreator);
	}

	async createOwnedAlias(options) {
		const result = this.contract.kind === 'object'
			? await this.invokeObjectContract(options)
			: await this.invokePositionalContract(options);
		if (result?.error) throw gatewayError('SERVICE_ALIAS_CREATE_FAILED', 400);
		if (result?.aliasId && result.aliasId !== options.aliasId) {
			throw gatewayError('SERVICE_ALIAS_ID_MISMATCH');
		}
		return result;
	}

	invokeObjectContract(options) {
		if (this.contract.parameters.includes('aliasId')) {
			return this.nativeCreator(
				selectContractParameters(options, this.contract.parameters)
			);
		}
		const aliasContext = Object.create(options.$i);
		aliasContext.$_POST = {
			aliasName: options.aliasName,
			description: options.description,
			inputId: options.aliasId
		};
		return this.nativeCreator({ $i: aliasContext, userid: options.userid });
	}

	invokePositionalContract(options) {
		return this.nativeCreator(
			...this.contract.parameters.map(name => options[name])
		);
	}
}

async function ensureNativeServiceAlias(options, dependencies = {}) {
	const existing = await readNativeAlias(options);
	if (existing.present) return validateExistingAlias(options, existing);
	const gateway = new NativeAliasGateway(
		dependencies.createAlias || createNewAlias
	);
	await gateway.createOwnedAlias({ ...options, userid: options.ownerUserId });
	const verified = await readNativeAlias(options);
	return { ...validateExistingAlias(options, verified), created: true };
}

async function readNativeAlias(options) {
	const [info, ownerLink] = await Promise.all([
		options.$i.db.get(`${sp}/aliases/${options.aliasId}/info`),
		options.$i.db.get(`/users/${options.ownerUserId}/aliases/${options.aliasId}`)
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
	return nativeAliasContractError(code, statusCode);
}

module.exports = {
	NativeAliasGateway,
	describeFunctionContract,
	ensureNativeServiceAlias,
	readNativeAlias,
	validateExistingAlias,
	gatewayError
};
