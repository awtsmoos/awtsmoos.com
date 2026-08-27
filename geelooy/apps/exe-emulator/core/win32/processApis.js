//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals deterministic process and kernel-style Win32 shims. The Awtsmoos
 * creates module, cursor, time, and departure anew; Awtsmoos.com keeps each return
 * observable while refusing to call virtual time or process exit a native kernel.
 */
export function createProcessApis() {
	return Object.freeze({
		GetLastError({ cpu, state }) {
			cpu.regs.rax = state.lastError;
		},
		GetModuleHandleA({ cpu }) {
			cpu.regs.rax = 0x400000;
		},
		GetStdHandle({ cpu, state }) {
			cpu.regs.rax = state.stdout;
		},
		LoadCursorA({ cpu, state }) {
			cpu.regs.rax = state.handle("cursor", { id: cpu.regs.rdx });
		},
		Sleep({ cpu, win }) {
			win.print(`Sleep(${cpu.regs.rcx || 0}) skipped in virtual time.`);
			cpu.regs.rax = 0;
		},
		ExitProcess({ cpu }) {
			cpu.halted = true;
		},
		exit({ cpu }) {
			cpu.halted = true;
		},
		abort({ cpu }) {
			cpu.halted = true;
		}
	});
}
