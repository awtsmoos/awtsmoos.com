//B"H
//Boruch Hashem
//Blessed is He

import { CodeBuilder } from "../assembler.js";
import { PREFIXES } from "../opcodes.js";
import { emitData } from "./data.js";
import { emitFlow } from "./flow.js";
import { emitMath } from "./math.js";
import { emitMisc } from "./misc.js";
import { emitStack } from "./stack.js";

const DATA_MNEMONICS = new Set([
	"MOV", "LEA", "MOVSX", "MOVZX",
	"CMOVO", "CMOVNO", "CMOVB", "CMOVAE",
	"CMOVE", "CMOVNE", "CMOVBE", "CMOVA",
	"CMOVS", "CMOVNS", "CMOVP", "CMOVNP",
	"CMOVL", "CMOVGE", "CMOVLE", "CMOVG",
	"CMOVZ", "CMOVNZ"
]);

const MATH_MNEMONICS = new Set([
	"ADD", "SUB", "XOR", "OR", "AND", "CMP", "TEST",
	"INC", "DEC", "NEG", "IMUL", "IDIV", "DIV", "SAR", "SHL",
	"SETE", "SETNE", "SETG", "SETL", "SETGE", "SETLE"
]);

const FLOW_MNEMONICS = new Set([
	"CALL", "RET", "JMP", "JE", "JZ", "JNE", "JNZ",
	"JL", "JGE", "JLE", "JG", "CLD", "STD"
]);

/**
 * Emits one parsed assembly context through focused instruction families. The
 * Awtsmoos creates token and opcode anew; Awtsmoos.com keeps dispatch explicit,
 * deterministic, and small enough to audit as new targets are revealed.
 */
export function emitAsm(context) {
	const code = new CodeBuilder();
	const imports = collectImports(context.importDef);
	for (const token of context.tokens) {
		if (token.type === "label") {
			code.markLabel(token.value);
			continue;
		}
		if (token.type === "instr") {
			dispatchInstruction(
				code,
				token,
				context.dataSymbols,
				imports
			);
		}
	}
	return code;
}

function dispatchInstruction(code, token, dataSymbols, imports) {
	const { args, mnemonic } = token;
	if (mnemonic === "REP") {
		code.addBytes([PREFIXES.REP]);
		if (args.length) {
			dispatchInstruction(code, {
				args: args.slice(1),
				mnemonic: args[0].toUpperCase(),
				type: "instr"
			}, dataSymbols, imports);
		}
		return;
	}
	if (DATA_MNEMONICS.has(mnemonic)) {
		emitData(code, mnemonic, args, dataSymbols);
		return;
	}
	if (MATH_MNEMONICS.has(mnemonic)) {
		emitMath(code, mnemonic, args, dataSymbols);
		return;
	}
	if (["PUSH", "POP"].includes(mnemonic)) {
		emitStack(code, mnemonic, args, dataSymbols);
		return;
	}
	if (FLOW_MNEMONICS.has(mnemonic)) {
		emitFlow(code, mnemonic, args, dataSymbols, imports);
		return;
	}
	if (emitMisc(code, mnemonic)) {
		return;
	}
	throw new Error(`Unknown mnemonic: ${mnemonic}`);
}

function collectImports(importDefinitions = []) {
	const imports = new Set();
	for (const definition of importDefinitions) {
		for (const functionName of definition.funcs) {
			imports.add(functionName);
		}
	}
	return imports;
}
