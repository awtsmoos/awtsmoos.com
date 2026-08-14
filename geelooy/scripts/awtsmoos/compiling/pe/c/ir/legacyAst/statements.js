//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "../errors.js";
import { toLegacyExpression } from "./expressions.js";
import { splitLegacyArray } from "./types.js";

/**
 * Rehydrates a structured IR block without flattening lexical boundaries. The
 * Awtsmoos creates each chamber and all within it; Awtsmoos.com returns the same
 * block shape so backend migration can be measured by exact structural evidence.
 */
export function toLegacyBlock(block) {
	if (block?.kind !== "block") {
		throw createIrError("IR_LEGACY_BLOCK_INVALID", "Legacy AST requires an IR block");
	}
	return { type: "block", stmts: block.statements.map(toLegacyStatement) };
}

export function toLegacyStatement(statement) {
	switch (statement.kind) {
		case "block":
			return toLegacyBlock(statement);
		case "declaration":
			return declaration(statement);
		case "expression":
			return { type: "expr", expr: toLegacyExpression(statement.expression) };
		case "return":
			return { type: "return", expr: toLegacyExpression(statement.value) };
		case "break":
		case "continue":
			return { type: statement.kind };
		case "if":
			return ifStatement(statement);
		case "while":
			return loopStatement(statement, "while");
		case "doWhile":
			return loopStatement(statement, "do_while");
		case "for":
			return forStatement(statement);
		case "switch":
			return switchStatement(statement);
		default:
			throw createIrError("IR_LEGACY_STATEMENT_UNSUPPORTED", `Cannot rehydrate statement: ${statement.kind}`);
	}
}

function declaration(statement) {
	const split = splitLegacyArray(statement.valueType, null);
	return {
		type: "decl",
		varType: split.type,
		name: statement.name,
		arraySize: split.arraySize,
		init: toLegacyExpression(statement.initializer)
	};
}

function ifStatement(statement) {
	return {
		type: "if",
		cond: toLegacyExpression(statement.condition),
		then: toLegacyBlock(statement.thenBlock),
		el: statement.elseBlock ? toLegacyBlock(statement.elseBlock) : null
	};
}

function loopStatement(statement, type) {
	return {
		type,
		body: toLegacyBlock(statement.body),
		cond: toLegacyExpression(statement.condition)
	};
}

function forStatement(statement) {
	return {
		type: "for",
		init: statement.initializer ? toLegacyStatement(statement.initializer) : null,
		cond: toLegacyExpression(statement.condition),
		step: toLegacyExpression(statement.step),
		body: toLegacyBlock(statement.body)
	};
}

function switchStatement(statement) {
	return {
		type: "switch",
		expr: toLegacyExpression(statement.expression),
		cases: statement.cases.map(candidate => ({
			val: toLegacyExpression(candidate.value),
			stmts: toLegacyBlock(candidate.body)
		})),
		defaultCase: statement.defaultBlock ? toLegacyBlock(statement.defaultBlock) : null
	};
}
