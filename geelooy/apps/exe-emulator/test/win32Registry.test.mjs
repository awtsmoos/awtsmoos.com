//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createWinApi } from "../core/winApi.js";
import { createWin32Registry } from "../core/win32/registry.js";

/**
 * The Awtsmoos creates API family, imported name, and execution-scoped state anew.
 * Awtsmoos.com proves duplicate keys cannot disappear silently and unknown imports
 * become visible evidence instead of invented success.
 */
test("composes a duplicate-free Win32 API registry", () => {
	const registry = createWin32Registry();
	assert.ok(registry.size > 30);
	assert.equal(registry.has("ExitProcess"), true);
	assert.equal(registry.familyOf("WriteFile"), "file");
	assert.equal(registry.familyOf("CreateWindowExA"), "window");
	assert.equal(registry.familyOf("glVertex2i"), "opengl");
	assert.equal(new Set(registry.names).size, registry.names.length);
});

test("normalizes decorated import names and executes one family", () => {
	const { cpu, host } = createHarness();
	createWinApi(host, cpu)("KERNEL32.dll!__imp_GetStdHandle@4");
	assert.equal(cpu.regs.rax, 1);
	assert.deepEqual(cpu.win32.unhandledImports, []);
});

test("records unknown imports with Win32 error 127", () => {
	const { cpu, host } = createHarness();
	const call = createWinApi(host, cpu);
	call("UNKNOWN.dll!MissingFunction");
	call("UNKNOWN.dll!MissingFunction");
	assert.equal(cpu.regs.rax, 0);
	assert.equal(cpu.win32.lastError, 127);
	assert.deepEqual(cpu.win32.unhandledImports, ["MissingFunction"]);
	assert.equal(host.prints.length, 1);
});

function createHarness() {
	const host = {
		draws: [],
		prints: [],
		windows: [],
		draw(operation) {
			this.draws.push(operation);
		},
		openWindow(title, body) {
			this.windows.push({ body, title });
		},
		print(message) {
			this.prints.push(String(message));
		}
	};
	const cpu = {
		halted: false,
		image: { bytes: new Uint8Array() },
		readString() {
			return "";
		},
		regs: {
			r8: 0,
			r9: 0,
			rax: 0,
			rcx: 0,
			rdx: 0
		}
	};
	return { cpu, host };
}
