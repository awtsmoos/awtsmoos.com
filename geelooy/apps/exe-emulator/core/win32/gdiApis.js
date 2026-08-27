//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals bounded GDI drawing and object shims. The Awtsmoos creates device
 * context, bitmap, text, pixel, and host draw operation anew; Awtsmoos.com records
 * graphic intention without claiming raster-compatible Windows GDI execution.
 */
export function createGdiApis() {
	return Object.freeze({
		GetDC({ cpu, state }) {
			cpu.regs.rax = deviceContext(state, cpu.regs.rcx);
		},
		ReleaseDC({ cpu }) {
			cpu.regs.rax = 1;
		},
		BeginPaint({ cpu, state }) {
			cpu.regs.rax = deviceContext(state, cpu.regs.rcx);
		},
		EndPaint({ cpu }) {
			cpu.regs.rax = 1;
		},
		CreateCompatibleDC({ cpu, state }) {
			cpu.regs.rax = deviceContext(state, 0);
		},
		CreateDIBSection({ cpu, state }) {
			cpu.regs.rax = state.handle("bitmap", { bits: new Map() });
		},
		SelectObject({ cpu, state }) {
			const dc = state.dc.get(cpu.regs.rcx);
			if (dc) dc.object = cpu.regs.rdx;
			cpu.regs.rax = 1;
		},
		BitBlt({ cpu, win }) {
			win.draw({ kind: "bitblt", target: cpu.regs.rcx });
			cpu.regs.rax = 1;
		},
		DeleteObject({ cpu, state }) {
			state.objects.delete(cpu.regs.rcx);
			cpu.regs.rax = 1;
		},
		DeleteDC({ cpu, state }) {
			state.dc.delete(cpu.regs.rcx);
			cpu.regs.rax = 1;
		},
		FillRect({ cpu, win }) {
			win.draw({ brush: cpu.regs.r8, kind: "fill", target: cpu.regs.rcx });
			cpu.regs.rax = 1;
		},
		SetTextColor({ cpu, win }) {
			win.draw({ color: cpu.regs.rdx, kind: "text-color" });
			cpu.regs.rax = cpu.regs.rdx;
		},
		SetBkMode({ cpu }) {
			cpu.regs.rax = 1;
		},
		GetStockObject({ cpu, state }) {
			cpu.regs.rax = state.handle("stock-object", { id: cpu.regs.rcx });
		},
		TextOutA({ cpu, win }) {
			win.draw({
				kind: "text",
				text: cpu.readString(cpu.regs.r9 || 0, 2048),
				x: cpu.regs.rdx,
				y: cpu.regs.r8
			});
			cpu.regs.rax = 1;
		},
		SetPixel({ cpu, win }) {
			win.draw({
				color: cpu.regs.r9,
				kind: "pixel",
				x: cpu.regs.rdx,
				y: cpu.regs.r8
			});
			cpu.regs.rax = cpu.regs.r9;
		}
	});
}

function deviceContext(state, windowHandle) {
	const handle = state.handle("dc", { windowHandle });
	state.dc.set(handle, { object: 0, windowHandle });
	return handle;
}
