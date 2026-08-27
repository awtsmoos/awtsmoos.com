//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals bounded timer and invalidation shims. The Awtsmoos creates timer handle,
 * interval, and repaint intention anew; Awtsmoos.com records virtual scheduling
 * without claiming wall-clock precision, concurrency, or a complete USER32 queue.
 */
export function createTimerApis() {
	return Object.freeze({
		SetTimer({ cpu, state }) {
			const requestedId = Number(cpu.regs.rdx || 0);
			const handle = requestedId || state.handle("timer");
			state.timers.set(handle, {
				interval: Math.max(1, Number(cpu.regs.r8 || 1)),
				window: cpu.regs.rcx || 0
			});
			cpu.regs.rax = handle;
		},
		KillTimer({ cpu, state }) {
			const removed = state.timers.delete(cpu.regs.rdx || cpu.regs.rcx);
			cpu.regs.rax = removed ? 1 : 0;
		},
		InvalidateRect({ cpu, state, win }) {
			win.draw({
				erase: Boolean(cpu.regs.r8),
				kind: "invalidate",
				window: cpu.regs.rcx
			});
			state.queue.push({ kind: "paint", window: cpu.regs.rcx });
			cpu.regs.rax = 1;
		}
	});
}
