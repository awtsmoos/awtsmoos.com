//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one execution-scoped Win32 state vessel. The Awtsmoos creates handle,
 * file, window, timer, device context, and OpenGL batch anew; Awtsmoos.com keeps
 * mutable guest state on the CPU instance so separate executables never mingle.
 */
export function ensureWin32State(win, cpu) {
	if (cpu.win32) return cpu.win32;
	cpu.win32 = createWin32State(win);
	return cpu.win32;
}

export function createWin32State(win) {
	return {
		dc: new Map(),
		files: new Map(),
		gl: {
			batches: 0,
			color: [255, 255, 255],
			mode: 0,
			vertices: []
		},
		lastError: 0,
		messagePolls: 0,
		nextHandle: 100,
		objects: new Map(),
		queue: [],
		quit: false,
		stdout: 1,
		timers: new Map(),
		unhandledImports: [],
		windows: new Map(),
		handle(kind, data = {}) {
			const value = ++this.nextHandle;
			this.objects.set(value, { kind, ...data });
			return value;
		},
		log(message) {
			win.print(String(message));
		}
	};
}
