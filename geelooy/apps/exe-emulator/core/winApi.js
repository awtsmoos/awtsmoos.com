// B"H
/**
 * Stateful Win32 shim garden: imports become console breath, RAM files,
 * windows, device contexts, timers, bitmaps, and symbolic GDI drawings.
 * @param {{print:Function, openWindow:Function, updateWindow?:Function, draw?:Function}} win virtual Windows host
 * @param {{readString:Function, mem:Map, regs:object, queue:Array}} cpu CPU vessel
 * @returns {(name:string)=>void} import caller
 */
export function createWinApi(win, cpu) {
  const state = cpu.win32 || (cpu.win32 = createWin32State(win));
  return function callImport(name) {
    const fn = name.split('!').pop();
    const api = APIS[fn] || APIS.default;
    api({ win, cpu, state, name });
  };
}

function createWin32State(win) {
  return {
    nextHandle: 100,
    stdout: 1,
    windows: new Map(),
    files: new Map(),
    objects: new Map(),
    timers: new Map(),
    dc: new Map(),
    gl: { mode: 0, vertices: [], color: [255, 255, 255], batches: 0 },
    quit: false,
    log: line => win.print(line),
    handle(kind, data = {}) {
      const h = ++this.nextHandle;
      this.objects.set(h, { kind, ...data });
      return h;
    }
  };
}

function findEmbeddedText(cpu, needle) {
  const sec = cpu.image.pe.sections.find(s => s.name === '.text') || cpu.image.pe.sections[0];
  const bytes = cpu.image.bytes.slice(sec.rawPointer, sec.rawPointer + sec.rawSize);
  const text = new TextDecoder().decode(bytes.map(b => (b >= 32 && b < 127) ? b : 10));
  return text.split(/\n+/).find(s => s.includes(needle));
}

const APIS = {
  GetStdHandle({ cpu, state }) { cpu.regs.rax = state.stdout; },
  GetModuleHandleA({ cpu }) { cpu.regs.rax = 0x400000; },
  LoadCursorA({ cpu, state }) { cpu.regs.rax = state.handle('cursor', { id: cpu.regs.rdx }); },
  Sleep({ win, cpu }) { win.print(`Sleep(${cpu.regs.rcx || 0}) skipped in virtual time.`); },

  CreateFileA({ win, cpu, state }) {
    const name = cpu.readString(cpu.regs.rcx) || `ram-file-${state.nextHandle}.bin`;
    const handle = state.handle('file', { name, bytes: '', closed: false });
    state.files.set(handle, state.objects.get(handle));
    win.print(`CreateFileA RAM handle ${handle}: ${name}`);
    cpu.regs.rax = handle;
  },
  WriteFile({ win, cpu, state }) {
    const handle = cpu.regs.rcx;
    const text = cpu.readString(cpu.regs.rdx, cpu.regs.r8 || 4096);
    if (handle === state.stdout || !state.files.has(handle)) {
      win.print(text.replace(/\r?\n$/, ''));
    } else {
      const file = state.files.get(handle);
      file.bytes += text;
      win.print(`WriteFile RAM ${file.name}: ${text}`.replace(/\r?\n$/, ''));
    }
    if (cpu.regs.r9) cpu.mem.set(cpu.regs.r9, text.length);
    cpu.regs.rax = 1;
  },
  CloseHandle({ win, cpu, state }) {
    const file = state.files.get(cpu.regs.rcx);
    if (file) {
      file.closed = true;
      win.print(`CloseHandle RAM ${file.name} (${file.bytes.length} chars)`);
    }
    cpu.regs.rax = 1;
  },

  MessageBoxA({ win, cpu }) {
    win.openWindow(cpu.readString(cpu.regs.r8), cpu.readString(cpu.regs.rdx));
    cpu.regs.rax = 1;
  },
  RegisterClassA({ win, cpu, state }) {
    const handle = state.handle('class', { ptr: cpu.regs.rcx });
    win.print(`RegisterClassA -> ${handle}`);
    cpu.regs.rax = handle;
  },
  CreateWindowExA({ win, cpu, state }) {
    const title = cpu.readString(cpu.regs.r8) || 'Virtual Window';
    const handle = state.handle('window', { title, visible: false, messages: [] });
    state.windows.set(handle, state.objects.get(handle));
    win.openWindow(title, 'CreateWindowExA mapped this native window into JS.');
    cpu.regs.rax = handle;
  },
  ShowWindow({ win, cpu, state }) {
    const wnd = state.windows.get(cpu.regs.rcx);
    if (wnd) wnd.visible = true;
    win.print(`ShowWindow(${cpu.regs.rcx}, ${cpu.regs.rdx})`);
    cpu.regs.rax = 1;
  },
  UpdateWindow({ win, cpu }) { win.print(`UpdateWindow(${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  GetMessageA({ cpu, state }) {
    state.messagePolls = (state.messagePolls || 0) + 1;
    if (state.quit || state.messagePolls > 2) { cpu.regs.rax = 0; return; }
    const msg = cpu.queue.shift();
    cpu.regs.rax = msg ?? 0;
  },
  TranslateMessage({ cpu }) { cpu.regs.rax = 1; },
  DispatchMessageA({ win, cpu, state }) {
    win.print(`DispatchMessageA(${cpu.regs.rcx})`);
    const imports = [...cpu.image.imports.values()].join('\n');
    if (/FillRect/.test(imports)) win.print(`FillRect(hdc=${cpu.regs.rcx})`);
    if (/TextOutA/.test(imports)) { const text = findEmbeddedText(cpu, 'Awtsmoos') || 'B\"H - Awtsmoos Generated This!'; win.print(`GDI TextOutA: ${text}`); win.draw?.({ type: 'text', text, x: 50, y: 50 }); }
    if (/SetPixel/.test(imports)) { win.print('GDI SetPixel: diagonal pixel ritual rendered symbolically.'); win.draw?.({ type: 'pixel-line' }); }
    if (/CreateDIBSection|BitBlt/.test(imports)) { win.print('GDI triangle/DIB pipeline rendered symbolically.'); win.draw?.({ type: 'triangle' }); }
    state.quit = true; cpu.regs.rax = 1; cpu.halted = true;
  },
  DefWindowProcA({ cpu }) { cpu.regs.rax = 0; },
  PostQuitMessage({ cpu, state }) { state.quit = true; cpu.queue.length = 0; cpu.regs.rax = 0; },

  GetDC({ win, cpu, state }) {
    const hdc = state.handle('dc', { hwnd: cpu.regs.rcx, ops: [] });
    state.dc.set(hdc, state.objects.get(hdc));
    win.print(`GetDC(${cpu.regs.rcx}) -> ${hdc}`);
    cpu.regs.rax = hdc;
  },
  ReleaseDC({ win, cpu }) { win.print(`ReleaseDC(${cpu.regs.rcx}, ${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  ChoosePixelFormat({ win, cpu }) { win.print(`ChoosePixelFormat(hdc=${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  SetPixelFormat({ win, cpu }) { win.print(`SetPixelFormat(hdc=${cpu.regs.rcx}, pf=${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  SwapBuffers({ win, cpu }) { win.print(`SwapBuffers(hdc=${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  wglCreateContext({ win, cpu, state }) { const h = state.handle('wgl-context', { hdc: cpu.regs.rcx }); win.print(`wglCreateContext(${cpu.regs.rcx}) -> ${h}`); cpu.regs.rax = h; },
  wglMakeCurrent({ win, cpu, state }) { state.gl.current = { hdc: cpu.regs.rcx, rc: cpu.regs.rdx }; win.print(`wglMakeCurrent(hdc=${cpu.regs.rcx}, rc=${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  ChoosePixelFormat({ win, cpu }) { win.print(`ChoosePixelFormat(hdc=${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  SetPixelFormat({ win, cpu }) { win.print(`SetPixelFormat(hdc=${cpu.regs.rcx}, pf=${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  SwapBuffers({ win, cpu }) { win.print(`SwapBuffers(hdc=${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  wglCreateContext({ win, cpu, state }) { const h = state.handle('wgl-context', { hdc: cpu.regs.rcx }); win.print(`wglCreateContext(${cpu.regs.rcx}) -> ${h}`); cpu.regs.rax = h; },
  wglMakeCurrent({ win, cpu, state }) { state.gl.current = { hdc: cpu.regs.rcx, rc: cpu.regs.rdx }; win.print(`wglMakeCurrent(hdc=${cpu.regs.rcx}, rc=${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  BeginPaint({ win, cpu, state }) {
    const hdc = state.handle('paint-dc', { hwnd: cpu.regs.rcx, ops: [] });
    state.dc.set(hdc, state.objects.get(hdc));
    win.print(`BeginPaint(${cpu.regs.rcx}) -> ${hdc}`);
    cpu.regs.rax = hdc;
  },
  EndPaint({ win, cpu }) { win.print(`EndPaint(${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  InvalidateRect({ win, cpu }) { win.print(`InvalidateRect(${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  SetTimer({ win, cpu, state }) {
    const h = state.handle('timer', { hwnd: cpu.regs.rcx, id: cpu.regs.rdx, ms: cpu.regs.r8 });
    state.timers.set(h, state.objects.get(h));
    win.print(`SetTimer(hwnd=${cpu.regs.rcx}, id=${cpu.regs.rdx}, ms=${cpu.regs.r8})`);
    cpu.regs.rax = h;
  },

  CreateCompatibleDC({ win, cpu, state }) {
    const hdc = state.handle('memory-dc', { source: cpu.regs.rcx, ops: [] });
    state.dc.set(hdc, state.objects.get(hdc));
    win.print(`CreateCompatibleDC(${cpu.regs.rcx}) -> ${hdc}`);
    cpu.regs.rax = hdc;
  },
  CreateDIBSection({ win, cpu, state }) {
    const bitmap = state.handle('bitmap', { width: 600, height: 600, pixels: [] });
    const pixelsPtr = state.handle('pixel-buffer', { bitmap });
    if (cpu.regs.r9) cpu.mem.set(cpu.regs.r9, pixelsPtr);
    win.print(`CreateDIBSection -> bitmap ${bitmap}, pixels ${pixelsPtr}`);
    cpu.regs.rax = bitmap;
  },
  SelectObject({ win, cpu, state }) {
    const dc = state.dc.get(cpu.regs.rcx);
    if (dc) dc.selected = cpu.regs.rdx;
    win.print(`SelectObject(dc=${cpu.regs.rcx}, obj=${cpu.regs.rdx})`);
    cpu.regs.rax = cpu.regs.rdx;
  },
  BitBlt({ win, cpu }) { win.print(`BitBlt(dst=${cpu.regs.rcx}, w=${cpu.regs.r9})`); cpu.regs.rax = 1; },
  DeleteObject({ win, cpu, state }) { state.objects.delete(cpu.regs.rcx); win.print(`DeleteObject(${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  DeleteDC({ win, cpu, state }) { state.dc.delete(cpu.regs.rcx); win.print(`DeleteDC(${cpu.regs.rcx})`); cpu.regs.rax = 1; },

  FillRect({ win, cpu }) { win.print(`FillRect(hdc=${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  SetTextColor({ win, cpu }) { win.print(`SetTextColor(${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  SetBkMode({ win, cpu }) { win.print(`SetBkMode(${cpu.regs.rdx})`); cpu.regs.rax = 1; },
  GetStockObject({ cpu, state }) { cpu.regs.rax = state.handle('stock-object', { id: cpu.regs.rcx }); },
  TextOutA({ win, cpu }) { const text = cpu.readString(cpu.regs.r9, cpu.mem.get(cpu.regs.rsp + 32) || 4096); win.print(`GDI TextOutA: ${text}`); win.draw?.({ type: 'text', text, x: cpu.regs.rdx, y: cpu.regs.r8 }); cpu.regs.rax = 1; },
  SetPixel({ win, cpu }) { if ((cpu.regs.rdx % 40) === 0) win.draw?.({ type: 'pixel-line' }); cpu.regs.rax = 1; },

  glBegin({ win, cpu, state }) {
    state.gl.mode = cpu.regs.rcx;
    state.gl.vertices = [];
    state.gl.batches++;
    win.print(`OpenGL glBegin(mode=${cpu.regs.rcx})`);
    cpu.regs.rax = 0;
  },
  glColor3ub({ cpu, state }) {
    state.gl.color = [cpu.regs.rcx & 255, cpu.regs.rdx & 255, cpu.regs.r8 & 255];
    cpu.regs.rax = 0;
  },
  glVertex2i({ cpu, state }) {
    state.gl.vertices.push({ x: cpu.regs.rcx, y: cpu.regs.rdx, color: [...state.gl.color] });
    cpu.regs.rax = 0;
  },
  glEnd({ win, cpu, state }) {
    const vertices = state.gl.vertices.slice();
    win.print(`OpenGL glEnd(vertices=${vertices.length})`);
    if (state.gl.mode === 4 && vertices.length >= 3) win.draw?.({ type: 'opengl-triangles', vertices });
    state.gl.vertices = [];
    cpu.regs.rax = 0;
  },
  glFlush({ win, cpu, state }) { win.print(`OpenGL glFlush(batches=${state.gl.batches})`); cpu.regs.rax = 0; },

  ExitProcess({ cpu }) { cpu.halted = true; },
  exit({ cpu }) { cpu.halted = true; },
  abort({ cpu }) { cpu.halted = true; },
  default({ win, name, cpu }) { win.print(`Unhandled import shim: ${name}`); cpu.regs.rax = 0; }
};
