//B"H
//Boruch Hashem
//Blessed is He

/**
 * Minimal AArch64 simulator for the exact instruction vocabulary the portable
 * C ARM64 backend emits. The Awtsmoos creates registers, flags, stack memory,
 * and global storage anew; Awtsmoos.com uses this only to verify backend
 * output — it never assembles or links anything.
 *
 * Supported: MOV/MOVZ/MOVK/MOVN, ADD/SUB/MUL/SDIV/MSUB/NEG/AND/ORR/EOR,
 * LSL/LSR/ASR (immediate), CMP, B/B.cc, BL/RET, LDR/STR/LDUR/STUR/LDP/STP
 * (X = 64-bit, W = 32-bit), LDRB/STRB/LDRH/STRH/LDRSB/LDRSH/LDRSW and the
 * LDUR/STUR unscaled narrow forms, FMOV between W/X and S/D (bit-preserving),
 * ADR, SVC #0 (halts; X0 is the exit value).
 *
 * Memory offsets in the assembly text are byte offsets and are used verbatim.
 * Every data line carries exactly 8 bytes, so data labels address cumulative
 * 8-byte slots from DATA_BASE.
 */

const MASK64 = (1n << 64n) - 1n;
const DATA_BASE = 0x10000;
const STACK_TOP = 0x1000000;
const DEFAULT_STEP_LIMIT = 20000000;

const BRANCH_CONDITIONS = Object.freeze({
	EQ: flags => flags.Z,
	NE: flags => !flags.Z,
	LT: flags => flags.N !== flags.V,
	LE: flags => flags.Z || flags.N !== flags.V,
	GT: flags => !flags.Z && flags.N === flags.V,
	GE: flags => flags.N === flags.V
});

export function simulateArm64Assembly(assembly, options = {}) {
	const program = parseProgram(String(assembly));
	const state = createState(program);
	const stepLimit = Number(options.stepLimit || DEFAULT_STEP_LIMIT);
	let steps = 0;
	while (true) {
		if (steps >= stepLimit) {
			throw new Error(`arm64_simulation_step_limit:${stepLimit}`);
		}
		steps += 1;
		const instruction = program.instructions[state.pc];
		if (!instruction) {
			throw new Error(`arm64_simulation_pc_out_of_range:${state.pc}`);
		}
		const outcome = execute(instruction, state, program);
		if (outcome?.halted) {
			return Object.freeze({
				exitCode8: Number(state.registers[0] & 0xffn),
				steps,
				x0: state.registers[0]
			});
		}
	}
}

function parseProgram(assembly) {
	const instructions = [];
	const codeLabels = new Map();
	const dataEntries = [];
	let section = null;
	let pendingDataLabel = null;
	for (const rawLine of assembly.split("\n")) {
		const line = rawLine.split(";")[0].trim();
		if (!line) continue;
		if (line === ".data") {
			section = "data";
			continue;
		}
		if (line === ".code") {
			section = "code";
			continue;
		}
		const label = line.match(/^([A-Za-z_.$][A-Za-z0-9_.$-]*):$/);
		if (label) {
			if (section === "data") pendingDataLabel = label[1];
			else codeLabels.set(label[1], instructions.length);
			continue;
		}
		if (section === "data") {
			dataEntries.push(parseDataLine(pendingDataLabel, line));
			pendingDataLabel = null;
			continue;
		}
		instructions.push(parseInstruction(line));
	}
	const dataAddresses = new Map();
	dataEntries.forEach((entry, index) => {
		dataAddresses.set(entry.name, DATA_BASE + index * 8);
	});
	return { codeLabels, dataAddresses, dataEntries, instructions };
}

function parseDataLine(label, line) {
	const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*): (.+)$/);
	if (!match || (label && label !== match[1])) {
		throw new Error(`arm64_simulation_bad_data_line:${line}`);
	}
	const value = match[2].trim();
	if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
		return { kind: "reference", name: match[1], target: value };
	}
	const bytes = value.split(",").map(part => {
		const byte = Number(part.trim());
		if (!Number.isInteger(byte) || byte < -128 || byte > 255) {
			throw new Error(`arm64_simulation_bad_data_byte:${line}`);
		}
		return byte & 0xff;
	});
	if (bytes.length !== 8) {
		throw new Error(`arm64_simulation_bad_data_length:${line}`);
	}
	return { bytes, kind: "bytes", name: match[1] };
}

function parseInstruction(line) {
	const space = line.indexOf(" ");
	const mnemonic = space === -1 ? line : line.slice(0, space);
	const rest = space === -1 ? "" : line.slice(space + 1).trim();
	const operands = [];
	let buffer = "";
	let depth = 0;
	for (let index = 0; index < rest.length; index += 1) {
		const character = rest[index];
		if (character === "[") depth += 1;
		if (character === "]") depth -= 1;
		if (character === "," && depth === 0
			&& !(/\]$/.test(buffer.trim()) && /^\s*#/.test(rest.slice(index + 1)))) {
			operands.push(buffer.trim());
			buffer = "";
		} else {
			buffer += character;
		}
	}
	if (buffer.trim()) operands.push(buffer.trim());
	return { line, mnemonic, operands };
}

function createState(program) {
	const registers = new Array(31).fill(0n);
	const vectors = new Array(32).fill(0n);
	const memory = new Map();
	for (const entry of program.dataEntries) {
		const address = program.dataAddresses.get(entry.name);
		const bytes = entry.kind === "bytes"
			? entry.bytes
			: toLeBytes(program.dataAddresses.get(entry.target));
		if (bytes === undefined) {
			throw new Error(`arm64_simulation_unresolved_data:${entry.name}`);
		}
		bytes.forEach((byte, index) => memory.set(address + index, byte));
	}
	return {
		flags: { C: false, N: false, V: false, Z: false },
		memory,
		pc: program.codeLabels.get("start") ?? 0,
		registers,
		sp: BigInt(STACK_TOP),
		vectors
	};
}

function toLeBytes(value) {
	const bytes = [];
	let remaining = BigInt(value);
	for (let index = 0; index < 8; index += 1) {
		bytes.push(Number(remaining & 0xffn));
		remaining >>= 8n;
	}
	return bytes;
}

function parseRegisterOperand(name) {
	if (name === "SP") return { kind: "sp" };
	if (name === "FP") return { index: 29, kind: "x" };
	if (name === "LR") return { index: 30, kind: "x" };
	let match = name.match(/^X([0-9]|1[0-9]|2[0-9]|30)$/);
	if (match) return { index: Number(match[1]), kind: "x" };
	match = name.match(/^W([0-9]|1[0-9]|2[0-9]|30)$/);
	if (match) return { index: Number(match[1]), kind: "w" };
	match = name.match(/^S([0-9]|1[0-9]|2[0-9]|30|31)$/);
	if (match) return { index: Number(match[1]), kind: "s" };
	match = name.match(/^D([0-9]|1[0-9]|2[0-9]|30|31)$/);
	if (match) return { index: Number(match[1]), kind: "d" };
	throw new Error(`arm64_simulation_bad_register:${name}`);
}

function registerIndex(name) {
	const parsed = parseRegisterOperand(name);
	if (parsed.kind === "sp") return "sp";
	if (parsed.kind === "x") return parsed.index;
	throw new Error(`arm64_simulation_bad_register:${name}`);
}

function readRegister(state, name) {
	const parsed = parseRegisterOperand(name);
	if (parsed.kind === "sp") return state.sp;
	if (parsed.kind === "w") return state.registers[parsed.index] & 0xffffffffn;
	return state.registers[parsed.index];
}

function writeRegister(state, name, value) {
	const parsed = parseRegisterOperand(name);
	const masked = BigInt(value) & MASK64;
	if (parsed.kind === "sp") {
		state.sp = masked;
		return;
	}
	// A W write zeroes the upper half of the X register, like hardware.
	state.registers[parsed.index] = parsed.kind === "w" ? masked & 0xffffffffn : masked;
}

function parseImmediate(text) {
	const match = text.match(/^#(-?[0-9]+|0x[0-9a-fA-F]+)$/);
	if (!match) throw new Error(`arm64_simulation_bad_immediate:${text}`);
	return BigInt(match[1]);
}

function operandValue(state, operand) {
	return operand.startsWith("#") ? parseImmediate(operand) : readRegister(state, operand);
}

function parseMemoryOperand(text) {
	let match = text.match(/^\[([A-Za-z0-9]+), #(-?[0-9]+)\]!$/);
	if (match) return { base: match[1], offset: BigInt(match[2]), preIndexed: true };
	match = text.match(/^\[([A-Za-z0-9]+)\], #(-?[0-9]+)$/);
	if (match) return { base: match[1], offset: BigInt(match[2]), postIndexed: true };
	match = text.match(/^\[([A-Za-z0-9]+), #(-?[0-9]+)\]$/);
	if (match) return { base: match[1], offset: BigInt(match[2]) };
	match = text.match(/^\[([A-Za-z0-9]+)\]$/);
	if (match) return { base: match[1], offset: 0n };
	throw new Error(`arm64_simulation_bad_memory:${text}`);
}

function effectiveAddress(state, memoryOperand) {
	const base = readRegister(state, memoryOperand.base);
	if (memoryOperand.preIndexed) {
		const address = base + memoryOperand.offset;
		writeRegister(state, memoryOperand.base, address);
		return address;
	}
	if (memoryOperand.postIndexed) {
		writeRegister(state, memoryOperand.base, base + memoryOperand.offset);
		return base;
	}
	// Offsets in the assembly text are byte offsets; use them verbatim.
	return base + memoryOperand.offset;
}

function loadBytes(state, address, size) {
	let value = 0n;
	for (let index = size - 1; index >= 0; index -= 1) {
		value = (value << 8n) | BigInt(state.memory.get(Number(address) + index) || 0);
	}
	return value;
}

function storeBytes(state, address, size, value) {
	let remaining = BigInt(value) & MASK64;
	for (let index = 0; index < size; index += 1) {
		state.memory.set(Number(address) + index, Number(remaining & 0xffn));
		remaining >>= 8n;
	}
}

function toSigned(value) {
	const masked = BigInt(value) & MASK64;
	return masked >> 63n ? masked - (1n << 64n) : masked;
}

function signExtend(value, bits) {
	const masked = BigInt(value) & ((1n << BigInt(bits)) - 1n);
	return masked >> BigInt(bits - 1) ? masked | ~((1n << BigInt(bits)) - 1n) : masked;
}

function updateCompareFlags(state, a, b) {
	const difference = (BigInt(a) - BigInt(b)) & MASK64;
	const aNegative = (BigInt(a) >> 63n) & 1n;
	const bNegative = (BigInt(b) >> 63n) & 1n;
	const dNegative = (difference >> 63n) & 1n;
	state.flags.Z = difference === 0n;
	state.flags.N = dNegative === 1n;
	state.flags.C = BigInt(a) >= BigInt(b);
	state.flags.V = aNegative !== bNegative && dNegative !== aNegative;
}

function shiftAmount(operands) {
	if (operands.length < 3) throw new Error("arm64_simulation_shift_arity");
	return Number(parseImmediate(operands[2]));
}

function executeMemoryAccess(state, operands, size, signed) {
	const memory = parseMemoryOperand(operands[1]);
	const address = effectiveAddress(state, memory);
	const value = loadBytes(state, address, size);
	writeRegister(state, operands[0], signed ? signExtend(value, size * 8) : value);
}

function executeMemoryStore(state, operands, size) {
	const memory = parseMemoryOperand(operands[1]);
	storeBytes(state, effectiveAddress(state, memory), size, readRegister(state, operands[0]));
}

function execute(instruction, state, program) {
	const { mnemonic, operands } = instruction;
	switch (mnemonic) {
		case "MOV": {
			writeRegister(state, operands[0], operandValue(state, operands[1]));
			break;
		}
		case "MOVZ": {
			const shift = operands[2] ? Number(operands[2].match(/LSL #([0-9]+)/)[1]) : 0;
			writeRegister(state, operands[0], parseImmediate(operands[1]) << BigInt(shift));
			break;
		}
		case "MOVK": {
			const shift = Number(operands[2].match(/LSL #([0-9]+)/)[1]);
			const current = readRegister(state, operands[0]);
			const mask = ~(0xffffn << BigInt(shift)) & MASK64;
			writeRegister(state, operands[0], (current & mask) | (parseImmediate(operands[1]) << BigInt(shift)));
			break;
		}
		case "MOVN": {
			const shift = operands[2] ? Number(operands[2].match(/LSL #([0-9]+)/)[1]) : 0;
			writeRegister(state, operands[0], ~(parseImmediate(operands[1]) << BigInt(shift)));
			break;
		}
		case "ADD":
			writeRegister(state, operands[0], readRegister(state, operands[1]) + operandValue(state, operands[2]));
			break;
		case "SUB":
			writeRegister(state, operands[0], readRegister(state, operands[1]) - operandValue(state, operands[2]));
			break;
		case "MUL":
			writeRegister(state, operands[0], readRegister(state, operands[1]) * readRegister(state, operands[2]));
			break;
		case "SDIV": {
			const divisor = toSigned(readRegister(state, operands[2]));
			writeRegister(state, operands[0], divisor === 0n ? 0n : toSigned(readRegister(state, operands[1])) / divisor);
			break;
		}
		case "MSUB":
			writeRegister(
				state,
				operands[0],
				readRegister(state, operands[3]) - readRegister(state, operands[1]) * readRegister(state, operands[2])
			);
			break;
		case "NEG":
			writeRegister(state, operands[0], -readRegister(state, operands[1]));
			break;
		case "AND":
			writeRegister(state, operands[0], readRegister(state, operands[1]) & operandValue(state, operands[2]));
			break;
		case "ORR":
			writeRegister(state, operands[0], readRegister(state, operands[1]) | operandValue(state, operands[2]));
			break;
		case "EOR":
			writeRegister(state, operands[0], readRegister(state, operands[1]) ^ operandValue(state, operands[2]));
			break;
		case "LSL":
			writeRegister(state, operands[0], readRegister(state, operands[1]) << BigInt(shiftAmount(operands)));
			break;
		case "LSR":
			writeRegister(state, operands[0], readRegister(state, operands[1]) >> BigInt(shiftAmount(operands)));
			break;
		case "ASR":
			writeRegister(state, operands[0], toSigned(readRegister(state, operands[1])) >> BigInt(shiftAmount(operands)));
			break;
		case "CMP":
			updateCompareFlags(state, readRegister(state, operands[0]), operandValue(state, operands[1]));
			break;
		case "B": {
			state.pc = resolveLabel(program, operands[0]);
			return null;
		}
		case "BL": {
			state.registers[30] = BigInt(state.pc + 1);
			state.pc = resolveLabel(program, operands[0]);
			return null;
		}
		case "RET": {
			state.pc = Number(state.registers[30]);
			return null;
		}
		case "LDR":
		case "LDUR": {
			const width = parseRegisterOperand(operands[0]).kind === "w" ? 4 : 8;
			executeMemoryAccess(state, operands, width, false);
			break;
		}
		case "STR":
		case "STUR": {
			const width = parseRegisterOperand(operands[0]).kind === "w" ? 4 : 8;
			executeMemoryStore(state, operands, width);
			break;
		}
		case "LDRB":
		case "LDURB":
			executeMemoryAccess(state, operands, 1, false);
			break;
		case "STRB":
		case "STURB":
			executeMemoryStore(state, operands, 1);
			break;
		case "LDRH":
		case "LDURH":
			executeMemoryAccess(state, operands, 2, false);
			break;
		case "STRH":
		case "STURH":
			executeMemoryStore(state, operands, 2);
			break;
		case "LDRSB":
		case "LDURSB":
			executeMemoryAccess(state, operands, 1, true);
			break;
		case "LDRSH":
		case "LDURSH":
			executeMemoryAccess(state, operands, 2, true);
			break;
		case "LDRSW":
		case "LDURSW":
			executeMemoryAccess(state, operands, 4, true);
			break;
		case "LDP": {
			const memory = parseMemoryOperand(operands[2]);
			const address = effectiveAddress(state, memory);
			writeRegister(state, operands[0], loadBytes(state, address, 8));
			writeRegister(state, operands[1], loadBytes(state, address + 8n, 8));
			break;
		}
		case "STP": {
			const memory = parseMemoryOperand(operands[2]);
			const address = effectiveAddress(state, memory);
			storeBytes(state, address, 8, readRegister(state, operands[0]));
			storeBytes(state, address + 8n, 8, readRegister(state, operands[1]));
			break;
		}
		case "FMOV": {
			const dst = parseRegisterOperand(operands[0]);
			const src = parseRegisterOperand(operands[1]);
			if (dst.kind === "s" && src.kind === "w") {
				// Bit-preserving W -> S; the upper lanes clear, like hardware.
				state.vectors[dst.index] = readRegister(state, operands[1]) & 0xffffffffn;
			} else if (dst.kind === "w" && src.kind === "s") {
				writeRegister(state, operands[0], state.vectors[src.index] & 0xffffffffn);
			} else if (dst.kind === "d" && src.kind === "x") {
				state.vectors[dst.index] = readRegister(state, operands[1]) & 0xffffffffffffffffn;
			} else if (dst.kind === "x" && src.kind === "d") {
				writeRegister(state, operands[0], state.vectors[src.index] & 0xffffffffffffffffn);
			} else {
				throw new Error(`arm64_simulation_bad_fmov:${instruction.line}`);
			}
			break;
		}
		case "ADR": {
			const address = program.dataAddresses.get(operands[1]);
			if (address === undefined) throw new Error(`arm64_simulation_bad_adr:${operands[1]}`);
			writeRegister(state, operands[0], BigInt(address));
			break;
		}
		case "SVC": {
			if (operands[0] !== "#0") throw new Error(`arm64_simulation_bad_svc:${operands[0]}`);
			return { halted: true };
		}
		default: {
			if (mnemonic.startsWith("B.")) {
				const condition = BRANCH_CONDITIONS[mnemonic.slice(2)];
				if (!condition) throw new Error(`arm64_simulation_bad_branch:${mnemonic}`);
				if (condition(state.flags)) {
					state.pc = resolveLabel(program, operands[0]);
					return null;
				}
				break;
			}
			throw new Error(`arm64_simulation_unsupported:${instruction.line}`);
		}
	}
	state.pc += 1;
	return null;
}

function resolveLabel(program, name) {
	const index = program.codeLabels.get(name);
	if (index === undefined) throw new Error(`arm64_simulation_bad_label:${name}`);
	return index;
}
