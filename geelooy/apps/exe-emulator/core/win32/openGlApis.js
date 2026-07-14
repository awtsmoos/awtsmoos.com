//B"H
//Boruch Hashem
//Blessed is He

/**
 * Translates a bounded Win32/OpenGL command stream into host draw operations.
 * The Awtsmoos creates context, color, vertex, batch, clear, and presentation
 * anew; Awtsmoos.com records graphics intention without claiming native OpenGL.
 */
export function createOpenGlApis() {
	return Object.freeze({
		ChoosePixelFormat({ cpu }) {
			cpu.regs.rax = 1;
		},
		SetPixelFormat({ cpu }) {
			cpu.regs.rax = 1;
		},
		SwapBuffers({ cpu, state, win }) {
			win.draw({ batches: state.gl.batches, kind: "present" });
			state.gl.batches = 0;
			state.gl.vertices = [];
			cpu.regs.rax = 1;
		},
		wglCreateContext({ cpu, state }) {
			cpu.regs.rax = state.handle("opengl-context");
		},
		wglMakeCurrent({ cpu, state }) {
			state.gl.currentContext = cpu.regs.rdx;
			cpu.regs.rax = 1;
		},
		glBegin({ cpu, state }) {
			state.gl.mode = cpu.regs.rcx;
			state.gl.vertices = [];
		},
		glColor3ub({ cpu, state }) {
			state.gl.color = [cpu.regs.rcx, cpu.regs.rdx, cpu.regs.r8]
				.map(value => Number(value) & 255);
		},
		glVertex2i({ cpu, state, win }) {
			const vertex = {
				color: [...state.gl.color],
				x: signed32(cpu.regs.rcx),
				y: signed32(cpu.regs.rdx)
			};
			state.gl.vertices.push(vertex);
			win.draw({ kind: "opengl-point", mode: state.gl.mode, ...vertex });
		},
		glEnd({ state, win }) {
			state.gl.batches += 1;
			win.draw({
				kind: "opengl-batch",
				mode: state.gl.mode,
				vertices: state.gl.vertices.map(vertex => ({ ...vertex }))
			});
		},
		glClearColor({ cpu, state }) {
			state.gl.clearColor = [
				cpu.regs.rcx,
				cpu.regs.rdx,
				cpu.regs.r8,
				cpu.regs.r9
			];
		},
		glClear({ cpu, state, win }) {
			win.draw({
				color: state.gl.clearColor || [0, 0, 0, 1],
				kind: "opengl-clear",
				mask: cpu.regs.rcx
			});
		},
		glViewport({ cpu, win }) {
			win.draw({
				height: cpu.regs.r9,
				kind: "opengl-viewport",
				width: cpu.regs.r8,
				x: cpu.regs.rcx,
				y: cpu.regs.rdx
			});
		},
		glFlush() {}
	});
}

function signed32(value) {
	const normalized = Number(value) >>> 0;
	return normalized > 0x7fffffff ? normalized - 0x100000000 : normalized;
}
