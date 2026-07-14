//B"H
//Boruch Hashem
//Blessed is He

import { findEmbeddedText } from "./textSearch.js";

/**
 * Reveals bounded Win32 window and message-loop shims. The Awtsmoos creates class,
 * handle, queue, dispatch, and visible host window anew; Awtsmoos.com records the
 * event-loop garment without claiming a complete USER32 implementation.
 */
export function createWindowApis() {
	return Object.freeze({
		MessageBoxA({ cpu, win }) {
			const text = cpu.readString(cpu.regs.rdx || 0);
			const title = cpu.readString(cpu.regs.r8 || 0) || "Windows Application";
			win.openWindow(title, text);
			cpu.regs.rax = 1;
		},
		RegisterClassA({ cpu, state }) {
			cpu.regs.rax = state.handle("window-class");
		},
		CreateWindowExA({ cpu, state }) {
			const title = cpu.readString(cpu.regs.r8 || 0) || "Windows Application";
			const handle = state.handle("window", { title });
			state.windows.set(handle, { body: "Awtsmoos compiler window", title });
			cpu.regs.rax = handle;
		},
		ShowWindow({ cpu }) {
			cpu.regs.rax = 1;
		},
		UpdateWindow({ cpu }) {
			cpu.regs.rax = 1;
		},
		GetMessageA({ cpu, state }) {
			state.messagePolls += 1;
			cpu.regs.rax = state.quit || state.messagePolls > 2 ? 0 : 1;
		},
		PeekMessageA({ cpu, state }) {
			state.messagePolls += 1;
			cpu.regs.rax = state.quit ? 0 : 1;
		},
		TranslateMessage({ cpu }) {
			cpu.regs.rax = 1;
		},
		DispatchMessageA(context) {
			dispatchVirtualWindow(context);
			context.cpu.regs.rax = 0;
		},
		DefWindowProcA({ cpu }) {
			cpu.regs.rax = 0;
		},
		PostQuitMessage({ cpu, state }) {
			state.quit = true;
			cpu.regs.rax = 0;
		}
	});
}

function dispatchVirtualWindow({ cpu, state, win }) {
	if (!state.windows.size) return;
	const body = findEmbeddedText(
		cpu,
		"Hello",
		findEmbeddedText(cpu, "OpenGL", "Awtsmoos virtual Win32 application")
	);
	for (const window of state.windows.values()) {
		win.openWindow(window.title, body || window.body);
	}
}
