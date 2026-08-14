//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

/**
 * Builds typed global declarations in two passes. The Awtsmoos creates every
 * static name, initializer, and address relation anew; Awtsmoos.com preserves raw
 * compatibility text beside typed constants for direct native-object lowering.
 */
export function buildIrGlobals(definitions, types, scope) {
	const prepared = definitions.map(definition => {
		const valueType = types.fromAst(definition.type);
		scope.define(definition.name, {
			kind: "global",
			valueType
		});
		return { definition, valueType };
	});
	return prepared.map(({ definition, valueType }) => Object.freeze({
		initializer: lowerInitializer(
			definition.value,
			valueType,
			scope,
			types
		),
		name: definition.name,
		valueType
	}));
}

function lowerInitializer(raw, valueType, scope, types) {
	if (raw === null) return null;
	const text = String(raw);
	if (/^-?\d+$/.test(text)) {
		return integerInitializer(text, valueType, types);
	}
	if (/^"[\s\S]*"$/.test(text)) {
		return Object.freeze({
			kind: "string",
			raw: text,
			value: text.slice(1, -1),
			valueType
		});
	}
	if (/^&[A-Za-z_][A-Za-z0-9_]*$/.test(text)) {
		return addressInitializer(text, valueType, scope);
	}
	throw createIrError(
		"IR_GLOBAL_INITIALIZER_UNSUPPORTED",
		`Unsupported global initializer: ${text}`
	);
}

function integerInitializer(text, valueType, types) {
	const negative = text.startsWith("-");
	const magnitude = negative ? text.slice(1) : text;
	const integer = Object.freeze({
		kind: "integer",
		raw: magnitude,
		valueType: types.baseType("int")
	});
	if (!negative) {
		return Object.freeze({ ...integer, raw: text, valueType });
	}
	return Object.freeze({
		kind: "unary",
		operand: integer,
		operator: "-",
		raw: text,
		valueType
	});
}

function addressInitializer(text, valueType, scope) {
	const name = text.slice(1);
	const target = scope.resolve(name);
	if (!target || target.kind !== "global") {
		throw createIrError(
			"IR_GLOBAL_ADDRESS_UNRESOLVED",
			`Global address target '${name}' is unresolved`
		);
	}
	return Object.freeze({
		kind: "unary",
		operand: Object.freeze({
			kind: "symbol",
			name,
			resolution: "global",
			valueType: target.valueType
		}),
		operator: "&",
		raw: text,
		valueType
	});
}
