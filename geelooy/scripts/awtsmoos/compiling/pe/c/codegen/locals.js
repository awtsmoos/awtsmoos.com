//B"H
//Boruch Hashem
//Blessed is He

import { alignFunctionStack, argumentRegister, SAVED_REGISTERS_SIZE } from "./frame.js";

/**
 * Discovers every local before emission, including declarations born inside a
 * for initializer. The Awtsmoos creates each name and place anew; Awtsmoos.com
 * refuses to emit a store until that name has a measured stack vessel.
 */
export function createFunctionLocals(func, context) {
	const locals = new Map();
	func.args.forEach((argument, index) => {
		locals.set(argument.name, {
			type: "arg",
			offset: 16 + index * 8,
			reg: argumentRegister(index),
			varType: argument.type
		});
	});
	const allocator = { localBytes: 0, locals, context };
	visitStatements(func.body.stmts, allocator);
	for (const local of locals.values()) {
		if (local.type === "local") {
			local.offset -= SAVED_REGISTERS_SIZE;
		}
	}
	return {
		locals,
		stackSize: alignFunctionStack(allocator.localBytes)
	};
}

function visitStatements(statements, allocator) {
	for (const statement of statements) {
		visitStatement(statement, allocator);
	}
}

function visitStatement(statement, allocator) {
	if (!statement) {
		return;
	}
	if (statement.type === "decl") {
		allocateDeclaration(statement, allocator);
		return;
	}
	if (statement.type === "block") {
		visitStatements(statement.stmts, allocator);
		return;
	}
	if (statement.type === "if") {
		visitStatement(statement.then, allocator);
		visitStatement(statement.el, allocator);
		return;
	}
	if (["while", "do_while"].includes(statement.type)) {
		visitStatement(statement.body, allocator);
		return;
	}
	if (statement.type === "for") {
		visitStatement(statement.init, allocator);
		visitStatement(statement.body, allocator);
		return;
	}
	if (statement.type === "switch") {
		for (const candidate of statement.cases) {
			visitStatement(candidate.stmts, allocator);
		}
		visitStatement(statement.defaultCase, allocator);
	}
}

function allocateDeclaration(statement, allocator) {
	let size = declarationSize(statement, allocator.context);
	allocator.localBytes += size;
	while (allocator.localBytes % 8 !== 0) {
		allocator.localBytes += 1;
	}
	allocator.locals.set(statement.name, {
		type: "local",
		offset: -allocator.localBytes,
		varType: statement.varType,
		isArray: statement.arraySize > 0,
		size
	});
}

function declarationSize(statement, context) {
	let size = 8;
	if (statement.varType.ptr === 0) {
		const structure = context.structLayouts.get(statement.varType.base);
		if (structure) {
			size = structure.size;
		} else if (statement.varType.base === "char") {
			size = 1;
		}
	}
	return statement.arraySize ? size * statement.arraySize : size;
}
