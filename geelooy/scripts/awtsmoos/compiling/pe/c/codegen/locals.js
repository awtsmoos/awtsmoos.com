// B"H
// Boruch Hashem
// Blessed is He

import { SAVED_REGISTER_BYTES } from "./frame.js";

/**
 * @file Allocates one deterministic Win64 local frame before statement emission.
 * @description
 * The Awtsmoos knows every local before the first body instruction. Awtsmoos.com
 * accounts for saved registers, nested statements, arrays, and Win64 alignment once.
 */
export function createFunctionLocals(func, context) {
	const locals = new Map();
	for (let index = 0; index < func.args.length; index++) {
		locals.set(func.args[index].name, {
			type: "arg",
			offset: 16 + index * 8,
			reg: ["RCX", "RDX", "R8", "R9"][index],
			varType: func.args[index].type
		});
	}
	const allocation = { offset: 0 };
	scanBlock(func.body, locals, allocation, context);
	for (const local of locals.values()) {
		if (local.type === "local") {
			local.offset -= SAVED_REGISTER_BYTES;
		}
	}
	return { locals, stackSize: alignStack(allocation.offset) };
}

function scanBlock(block, locals, allocation, context) {
	for (const statement of block?.stmts || []) {
		scanStatement(statement, locals, allocation, context);
	}
}

function scanStatement(statement, locals, allocation, context) {
	if (!statement) return;
	if (statement.type === "decl") allocateLocal(statement, locals, allocation, context);
	if (statement.type === "block") scanBlock(statement, locals, allocation, context);
	if (statement.type === "if") {
		scanStatement(statement.then, locals, allocation, context);
		scanStatement(statement.el, locals, allocation, context);
	}
	if (["while", "do_while"].includes(statement.type)) {
		scanStatement(statement.body, locals, allocation, context);
	}
	if (statement.type === "for") {
		scanStatement(statement.init, locals, allocation, context);
		scanStatement(statement.body, locals, allocation, context);
	}
	if (statement.type === "switch") {
		for (const entry of statement.cases || []) scanStatement(entry.stmts, locals, allocation, context);
		scanStatement(statement.defaultCase, locals, allocation, context);
	}
}

function allocateLocal(statement, locals, allocation, context) {
	let size = typeSize(statement.varType, context.structLayouts);
	if (statement.arraySize) size *= statement.arraySize;
	allocation.offset += size;
	while (allocation.offset % 8 !== 0) allocation.offset += 1;
	locals.set(statement.name, {
		type: "local",
		offset: -allocation.offset,
		varType: statement.varType,
		isArray: statement.arraySize > 0,
		size
	});
}

function typeSize(type, layouts) {
	if (type.ptr > 0) return 8;
	if (type.base === "char") return 1;
	if (type.base === "int") return 8;
	return layouts.get(type.base)?.size || 8;
}

function alignStack(size) {
	const remainder = size % 16;
	return size + ((8 - remainder + 16) % 16);
}
