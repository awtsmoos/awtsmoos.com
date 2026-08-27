//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { runAarch64MachineWithImports } from "../core/native/aarch64MachineWithImports.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { registerNativePthreadOnceHandlers } from "../core/native/nativePthreadOnceHandlers.js";
import { createNativePthreadOnceState } from "../core/native/nativePthreadOnceState.js";

const THREAD = 0x5000n;

test("machine executes one guest initializer and skips its second call", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "pthread-once-code");
	writeWords(code, 0x1000n, [
		movz(0, 0x3000), movz(1, 0x1100), bl(0x1008n, 0x2000n),
		movz(0, 0x3000), movz(1, 0x1100), bl(0x1014n, 0x2000n),
		bl(0x1018n, 0x2010n)
	]);
	writeWords(code, 0x1100n, [movz(5, 42, false), 0xd65f03c0]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("pthread_once");
	imports.resolve("host_done");
	const state = createNativePthreadOnceState();
	const hostImports = createNativeHostImportRegistry();
	registerNativePthreadOnceHandlers(hostImports, { imports, state });
	hostImports.register("host_done", context => {
		context.registers.pc = 0x4000n;
		return Object.freeze({ operation: "host_done" });
	});
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const report = runAarch64MachineWithImports({
		hostImports,
		imports,
		instructionLimit: 64,
		memory: createNativeCompositeMemory(faultingPrimary(), [code]),
		registers,
		returnAddress: 0x4000n,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	});
	assert.equal(report.reason, "return");
	assert.equal(registers.read(5, 32), 42n);
	assert.deepEqual(report.hostCalls.map(call => call.import.name), [
		"pthread_once", "__awtsmoos_pthread_once_complete",
		"pthread_once", "host_done"
	]);
	assert.equal(state.snapshot()[0].runs, 1);
});

test("direct first call redirects to authentic initializer and trap", () => {
	const imports = createNativeImportAddressSpace({ base: 0x7000n });
	const state = createNativePthreadOnceState();
	const registry = createNativeHostImportRegistry();
	registerNativePthreadOnceHandlers(registry, { imports, state });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 11252392n);
	registers.write(1, 4706680n);
	registers.write(30, 4706320n);
	const handled = registry.handle({ name: "pthread_once" }, {
		registers,
		systemRegisters: createAarch64SystemRegisters({
			TPIDR_EL0: 123144765440000n
		})
	});
	assert.equal(handled.result.status, "started");
	assert.equal(registers.pc, 4706680n);
	assert.equal(imports.find(registers.read(30)).name, "__awtsmoos_pthread_once_complete");
});

test("Flutter registry exposes pthread_once without eagerly needing imports", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	assert.ok(registry.snapshot().includes("pthread_once"));
	assert.ok(registry.snapshot().includes("__awtsmoos_pthread_once_complete"));
});

function movz(register, immediate, wide = true) {
	return ((wide ? 0xd2800000 : 0x52800000) | (immediate << 5) | register) >>> 0;
}

function bl(from, to) {
	return (0x94000000 | Number((to - from) / 4n)) >>> 0;
}

function writeWords(memory, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(address, bytes);
}

function faultingPrimary() {
	return {
		read(address, size) { throw new Error(`PRIMARY_READ:${address}:${size}`); },
		write(address, bytes) { throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`); }
	};
}
