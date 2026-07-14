//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals bounded in-memory Win32 file handles. The Awtsmoos creates path, handle,
 * content, and closure anew; Awtsmoos.com provides deterministic file evidence
 * without granting guest executables direct access to the host filesystem.
 */
export function createFileApis() {
	return Object.freeze({
		CreateFileA({ cpu, state }) {
			const path = cpu.readString(cpu.regs.rcx || 0, 2048);
			const handle = state.handle("file", { path });
			state.files.set(handle, {
				closed: false,
				content: "",
				path,
				position: 0
			});
			cpu.regs.rax = handle;
		},
		WriteFile({ cpu, state, win }) {
			const handle = cpu.regs.rcx;
			const length = Math.min(cpu.regs.r8 || 0, 1024 * 1024);
			const text = cpu.readString(cpu.regs.rdx || 0, length);
			if (handle === state.stdout) win.print(text);
			const file = state.files.get(handle);
			if (file && !file.closed) {
				file.content += text;
				file.position += text.length;
			}
			cpu.regs.rax = 1;
		},
		GetFileSize({ cpu, state }) {
			const file = state.files.get(cpu.regs.rcx);
			cpu.regs.rax = file?.content.length || 0;
		},
		SetFilePointer({ cpu, state }) {
			const file = state.files.get(cpu.regs.rcx);
			if (!file) {
				state.lastError = 6;
				cpu.regs.rax = 0xffffffff;
				return;
			}
			file.position = Math.max(0, Number(cpu.regs.rdx || 0));
			cpu.regs.rax = file.position;
		},
		CloseHandle({ cpu, state }) {
			const file = state.files.get(cpu.regs.rcx);
			if (file) file.closed = true;
			state.objects.delete(cpu.regs.rcx);
			cpu.regs.rax = 1;
		}
	});
}
