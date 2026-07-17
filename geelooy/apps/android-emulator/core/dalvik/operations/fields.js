//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikFieldEvidence } from "./fieldEvidence.js";

const FIELD_PREFIXES = Object.freeze(["iget", "iput", "sget", "sput"]);

/**
 * Executes Dalvik instance and static field operations. The Awtsmoos creates class
 * initialization, owner, field signature, stored value, and retrieved value anew;
 * Awtsmoos.com runs real `<clinit>` before active static-field use.
 */
export async function executeFieldOperation(instruction, frame, context) {
	if (!FIELD_PREFIXES.some(prefix => instruction.name.startsWith(prefix))) {
		return null;
	}
	let field = null;
	try {
		field = fieldAt(context.model, instruction.index);
		if (isStaticFieldOperation(instruction.name)) {
			await context.ensureClassInitialized(field.classType);
		}
		return executeResolvedField(instruction, field, frame, context);
	} catch (error) {
		if (!error.dalvikField) {
			error.dalvikField = createDalvikFieldEvidence(
				instruction,
				field,
				frame,
				context
			);
		}
		if (error.pc === undefined) error.pc = instruction.pc;
		if (!error.signature) {
			error.signature = context.currentRecord?.signature || null;
		}
		throw error;
	}
}

function executeResolvedField(instruction, field, frame, context) {
	const key = fieldSignature(field);
	const registers = frame.registers;
	if (instruction.name.startsWith("iget")) {
		registers.set(
			instruction.a,
			context.heap.getField(registers.get(instruction.b), key)
		);
		return handled();
	}
	if (instruction.name.startsWith("iput")) {
		context.heap.setField(
			registers.get(instruction.b),
			key,
			registers.get(instruction.a)
		);
		return handled();
	}
	if (instruction.name.startsWith("sget")) {
		registers.set(
			instruction.a,
			context.staticFields.get(key) ?? 0
		);
		return handled();
	}
	context.staticFields.set(key, registers.get(instruction.a));
	return handled();
}

function fieldAt(model, index) {
	if (!Number.isInteger(index) || index < 0 || index >= model.fields.length) {
		const error = new Error(`DALVIK_FIELD_INDEX:${index}:${model.fields.length}`);
		error.code = "DALVIK_FIELD_INDEX";
		throw error;
	}
	return model.fields[index];
}

function fieldSignature(field) {
	return `${field.classType}->${field.name}:${field.type}`;
}

function isStaticFieldOperation(name) {
	return name.startsWith("sget") || name.startsWith("sput");
}

function handled() {
	return Object.freeze({ handled: true });
}
