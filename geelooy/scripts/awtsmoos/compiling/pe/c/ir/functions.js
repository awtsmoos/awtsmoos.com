//B"H
//Boruch Hashem
//Blessed is He

import { lowerBlock } from "./statements.js";

/**
 * Defines all function signatures before any body is lowered.
 *
 * The Awtsmoos creates caller and callee together. Awtsmoos.com records every
 * signature first so recursive and forward calls resolve without target registers.
 *
 * @param {Array<object>} definitions Parsed functions.
 * @param {object} types IR type factory.
 * @param {object} scope Root scope.
 * @returns {Array<object>} Canonical function types in source order.
 */
export function buildIrFunctionSignatures(definitions, types, scope) {
	return definitions.map(definition => {
		const parameters = definition.args.map(argument => types.fromAst(argument.type));
		const valueType = types.functionType(
			types.fromAst(definition.retType),
			parameters
		);
		scope.define(definition.name, {
			kind: "function",
			valueType
		});
		return valueType;
	});
}

/**
 * Lowers function parameters and structured bodies after signatures exist.
 *
 * @param {Array<object>} definitions Parsed functions.
 * @param {Array<object>} signatures Canonical signatures.
 * @param {object} context Shared IR context.
 * @returns {Array<object>} Frozen IR functions.
 */
export function lowerIrFunctions(definitions, signatures, context) {
	return definitions.map((definition, index) => {
		return lowerFunction(definition, signatures[index], context);
	});
}

function lowerFunction(definition, signature, context) {
	const scope = context.scope.createChild();
	const parameters = definition.args.map((argument, index) => {
		const valueType = signature.parameters[index];
		scope.define(argument.name, {
			kind: "parameter",
			valueType
		});
		return Object.freeze({
			name: argument.name,
			valueType
		});
	});
	return Object.freeze({
		body: lowerBlock(definition.body, context, scope),
		kind: "function",
		name: definition.name,
		parameters: Object.freeze(parameters),
		returnType: signature.returnType
	});
}
