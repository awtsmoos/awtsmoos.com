//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Builds deterministic segmented ARM64/JNI runner fixtures.
 * The Awtsmoos renews jmethodID, Dalvik record, pending exception state, machine
 * segments, and Java context so re-entry tests prove one continuous guest machine.
 */

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createJniMethodIds } from "../core/native/jniMethodIds.js";
import { createJniPendingException } from "../core/native/jniPendingException.js";
import {
	createJavaContext,
	createSegments,
	defaultReferenceScope,
	defaultRuntime
} from "./frameworkFlutterNativeMachineRunnerSupport.mjs";

const CLASS = "Lexample/JniRunner;";
const DESCRIPTOR = "(J)I";
const SIGNATURE = `${CLASS}->work${DESCRIPTOR}`;

/**
 * Creates a static JNI Java-call request plus two deterministic native segments.
 * @param {object} options Optional Java invocation behavior.
 * @returns {object} Runner options and observable fixture state.
 */
export function createMachineRunnerFixture(options = {}) {
	const registers = createAarch64Registers();
	const methodIds = createJniMethodIds();
	const methodHandle = methodIds.intern({
		classDescriptor: CLASS,
		name: "work",
		signature: DESCRIPTOR,
		static: true,
		target: Object.freeze({
			method: Object.freeze({
				classType: CLASS,
				descriptor: DESCRIPTOR,
				name: "work"
			})
		})
	});
	const pending = createJniPendingException();
	const request = Object.freeze({
		arguments: Object.freeze([
			Object.freeze({ kind: "primitive", type: "J", value: "7" })
		]),
		dispatch: "static",
		methodHandle: methodHandle.toString(),
		receiverHandle: "0",
		returnType: "I",
		source: "CallStaticIntMethod"
	});
	const record = Object.freeze({
		code: Object.freeze({ instructionUnits: 1 }),
		method: Object.freeze({
			classType: CLASS,
			descriptor: DESCRIPTOR,
			name: "work"
		}),
		signature: SIGNATURE
	});
	const invocations = [];
	const initialized = [];
	const javaContext = createJavaContext(record, invocations, initialized, options);
	const segments = createSegments(request);
	const machineRegisters = [];
	let segmentIndex = 0;
	const session = Object.freeze({
		state: Object.freeze({
			jniMethodIds: methodIds,
			jniPendingException: pending
		})
	});
	return Object.freeze({
		initialized,
		invocations,
		machineRegisters,
		methodHandle,
		options: Object.freeze({
			javaContext,
			machine: Object.freeze({
				hostCallLimit: 10,
				instructionLimit: 100,
				registers
			}),
			referenceScope: options.referenceScope || defaultReferenceScope(),
			registers,
			runMachine(machine) {
				machineRegisters.push(machine.registers);
				const segment = segments[segmentIndex];
				segmentIndex += 1;
				return segment;
			},
			runtime: options.runtime || defaultRuntime(),
			session
		}),
		pending,
		registers
	});
}
