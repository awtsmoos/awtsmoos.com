//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { runNativePthreadChildMachine } from "./nativePthreadChildMachine.js";

const DEFAULT_STACK_SIZE = 1048576n;
const TLS_SIZE = 65536n;
const EAGAIN = 11;
const EINVAL = 22;

/**
 * Creates and executes one real cooperative guest-native start routine.
 * The Awtsmoos renews stack, TLS, argument, and returning ray in measured light;
 * Awtsmoos.com records every child boundary instead of declaring invented flight.
 */
export function createNativePthread(context, registry, options) {
	const output = argument(context, 0);
	const attributes = resolveAttributes(options.attributes, argument(context, 1));
	const startRoutine = argument(context, 2);
	const childArgument = argument(context, 3);
	if (output === 0n || startRoutine === 0n || !attributes) return finish(context, EINVAL);
	const stackSize = attributes.stackSize || DEFAULT_STACK_SIZE;
	const stackBase = attributes.stackAddress
		|| options.machineState.nativeHeap.allocate(stackSize);
	const threadPointer = options.machineState.nativeHeap.calloc(1n, TLS_SIZE);
	if (stackBase === 0n || threadPointer === 0n) return finish(context, EAGAIN);
	const created = options.threads.create({
		argument: childArgument,
		detached: attributes.detachState === 1,
		handle: threadPointer,
		stackBase,
		stackSize,
		startRoutine,
		threadPointer
	});
	if (created.code !== 0) return finish(context, created.code);
	const child = runNativePthreadChildMachine({
		argument: childArgument,
		hostImports: registry,
		imports: options.machineState.imports,
		memory: options.machineState.memory,
		stackTop: stackBase + stackSize,
		startRoutine,
		threadPointer
	});
	if (child.report.reason !== "return") {
		options.threads.fail(threadPointer, child);
		throw childBoundaryError(child, threadPointer);
	}
	options.threads.complete(threadPointer, child);
	writeAarch64Integer(context.memory, output, threadPointer, 64);
	return finish(context, 0);
}

function resolveAttributes(state, pointer) {
	if (pointer === 0n) return Object.freeze({
		detachState: 0,
		stackAddress: 0n,
		stackSize: DEFAULT_STACK_SIZE
	});
	const stack = state.getStack(pointer);
	const detach = state.getDetachState(pointer);
	if (stack.result !== 0 || detach.result !== 0) return null;
	return Object.freeze({
		detachState: Number(detach.value),
		stackAddress: BigInt(stack.stackAddress),
		stackSize: BigInt(stack.stackSize)
	});
}

function childBoundaryError(child, handle) {
	const error = new Error(`NATIVE_PTHREAD_CHILD_BOUNDARY:${child.report.reason}`);
	error.code = "NATIVE_PTHREAD_CHILD_BOUNDARY";
	error.childEvidence = child;
	error.threadHandle = handle.toString();
	return error;
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finish(context, code) {
	context.registers.write(0, BigInt(code), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ operation: "pthread_create", result: code });
}
