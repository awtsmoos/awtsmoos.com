//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeAliasContract
 * @description
 * The Awtsmoos lets Awtsmoos.com inspect the native alias helper without guessing;
 * only declared and recognized parameters may cross this guarded adapter boundary.
 */

const SUPPORTED_PARAMETERS = new Set([
	'$i',
	'aliasId',
	'aliasName',
	'description',
	'userid'
]);

function describeFunctionContract(nativeCreator) {
	const parameters = extractParameters(nativeCreator);
	const kind = parameters.object ? 'object' : 'positional';
	for (const name of parameters.names) {
		if (!SUPPORTED_PARAMETERS.has(name)) {
			throw nativeAliasContractError('NATIVE_ALIAS_CONTRACT_UNSUPPORTED');
		}
	}
	return { kind, parameters: parameters.names };
}

function extractParameters(nativeCreator) {
	const source = Function.prototype.toString.call(nativeCreator)
		.replace(/\/\*[\s\S]*?\*\//g, '');
	const match = source.match(/^[\s\S]*?\(([^)]*)\)/);
	if (!match) {
		throw nativeAliasContractError('NATIVE_ALIAS_CONTRACT_UNSUPPORTED');
	}
	const raw = match[1].trim();
	const object = raw.startsWith('{') && raw.endsWith('}');
	const body = object ? raw.slice(1, -1) : raw;
	const names = body
		.split(',')
		.map(part => part.trim().split(/[=:]/)[0].trim())
		.filter(Boolean);
	return { object, names };
}

function selectContractParameters(options, names) {
	return Object.fromEntries(names.map(name => [name, options[name]]));
}

function nativeAliasContractError(code, statusCode = 409) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	SUPPORTED_PARAMETERS,
	describeFunctionContract,
	extractParameters,
	selectContractParameters,
	nativeAliasContractError
};
