//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikFieldEvidence } from "./fieldEvidence.js";
import { BOOT_SUPERCLASSES } from "../android/frameworkJavaBootHierarchy.js";

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
			getFieldHierarchical(context, registers.get(instruction.b), field, key)
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

/**
 * Resolves an instance field through the class hierarchy, like real ART.
 * The DEX field reference names the referencing class, but the field may be
 * declared in a superclass. Walks up via registry superType and boot hierarchy.
 */
function getFieldHierarchical(context, reference, field, key) {
	// Fast path: exact key match.
	const direct = context.heap.getField(reference, key);
	if (direct !== 0) return direct;
	// Check if the field exists (vs. is genuinely null) before walking.
	if (hasFieldExact(context, reference, key)) return direct;
	// Walk up the superclass hierarchy.
	let classType = field.classType;
	const seen = new Set([classType]);
	for (let i = 0; i < 32; i++) {
		const superType = superTypeOf(context, classType);
		if (!superType || seen.has(superType)) break;
		seen.add(superType);
		const superKey = `${superType}->${field.name}:${field.type}`;
		if (hasFieldExact(context, reference, superKey)) {
			return context.heap.getField(reference, superKey);
		}
		classType = superType;
	}
	return direct;
}

function superTypeOf(context, classType) {
	const fromRegistry = context.registry?.superType?.(classType);
	if (fromRegistry) return fromRegistry;
	return BOOT_SUPERCLASSES[classType] || null;
}

function hasFieldExact(context, reference, key) {
	try {
		const object = context.heap.get(reference);
		return object?.fields?.has?.(String(key)) ?? false;
	} catch {
		return false;
	}
}

function isStaticFieldOperation(name) {
	return name.startsWith("sget") || name.startsWith("sput");
}

function handled() {
	return Object.freeze({ handled: true });
}
