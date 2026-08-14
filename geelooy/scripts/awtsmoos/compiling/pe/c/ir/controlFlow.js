//B"H
//Boruch Hashem
//Blessed is He

import { lowerExpression } from "./expressions.js";

/**
 * Lowers branching and repetition while preserving structured intent. The
 * Awtsmoos creates every road and return; Awtsmoos.com keeps those roads visible
 * before a backend breaks them into labels, jumps, blocks, or machine addresses.
 */
export function lowerControlStatement(statement, context, scope, lowerStatement, lowerBlock) {
	switch (statement.type) {
		case "if":
			return Object.freeze({
				kind: "if",
				condition: lowerExpression(statement.cond, { ...context, scope }),
				elseBlock: statement.el ? lowerBlock(statement.el, context, scope) : null,
				thenBlock: lowerBlock(statement.then, context, scope)
			});
		case "while":
			return Object.freeze({
				kind: "while",
				body: lowerBlock(statement.body, context, scope),
				condition: lowerExpression(statement.cond, { ...context, scope })
			});
		case "do_while":
			return Object.freeze({
				kind: "doWhile",
				body: lowerBlock(statement.body, context, scope),
				condition: lowerExpression(statement.cond, { ...context, scope })
			});
		case "for":
			return lowerFor(statement, context, scope, lowerStatement, lowerBlock);
		case "switch":
			return lowerSwitch(statement, context, scope, lowerBlock);
		default:
			return null;
	}
}

function lowerFor(statement, context, scope, lowerStatement, lowerBlock) {
	const loopScope = scope.createChild();
	const loopContext = { ...context, scope: loopScope };
	return Object.freeze({
		body: lowerBlock(statement.body, context, loopScope),
		condition: lowerExpression(statement.cond, loopContext),
		initializer: statement.init ? lowerStatement(statement.init, context, loopScope) : null,
		kind: "for",
		step: lowerExpression(statement.step, loopContext)
	});
}

function lowerSwitch(statement, context, scope, lowerBlock) {
	const scopedContext = { ...context, scope };
	return Object.freeze({
		cases: Object.freeze(statement.cases.map(candidate => Object.freeze({
			body: lowerBlock(candidate.stmts, context, scope),
			value: lowerExpression(candidate.val, scopedContext)
		}))),
		defaultBlock: statement.defaultCase ? lowerBlock(statement.defaultCase, context, scope) : null,
		expression: lowerExpression(statement.expr, scopedContext),
		kind: "switch"
	});
}
