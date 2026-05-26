// B"H
/**
 * Win32 shim garden: imports become browser-visible console/window effects.
 * @param {{print:Function, openWindow:Function}} win virtual Windows host
 * @param {{readString:Function, mem:Map, regs:object, queue:Array}} cpu CPU vessel
 * @returns {(name:string)=>void} import caller
 */
export function createWinApi(win, cpu) {
  let nextHandle = 100;
  return function callImport(name) {
    const fn = name.split('!').pop();
    const api = APIS[fn] || APIS.default;
    api({ win, cpu, next: () => ++nextHandle, name });
  };
}

const APIS = {
  GetStdHandle({ cpu, next }) { cpu.regs.rax = next(); },
  GetModuleHandleA({ cpu }) { cpu.regs.rax = 0x400000; },
  Sleep({ win, cpu }) { win.print(`Sleep(${cpu.regs.rcx || 0}) skipped in virtual time.`); },
  WriteFile({ win, cpu }) {
    const text = cpu.readString(cpu.regs.rdx, cpu.regs.r8 || 4096);
    win.print(text.replace(/\r?\n$/, ''));
    cpu.regs.rax = 1;
  },
  MessageBoxA({ win, cpu }) {
    win.openWindow(cpu.readString(cpu.regs.r8), cpu.readString(cpu.regs.rdx));
    cpu.regs.rax = 1;
  },
  RegisterClassA({ cpu }) { cpu.regs.rax = 1; },
  CreateWindowExA({ win, cpu, next }) {
    const title = cpu.readString(cpu.regs.r8) || 'Virtual Window';
    const handle = next();
    win.openWindow(title, 'CreateWindowExA mapped this native window into JS.');
    cpu.regs.rax = handle;
  },
  ShowWindow({ cpu }) { cpu.regs.rax = 1; },
  UpdateWindow({ cpu }) { cpu.regs.rax = 1; },
  GetMessageA({ cpu }) { cpu.regs.rax = cpu.queue.shift() ?? 0; },
  TranslateMessage({ cpu }) { cpu.regs.rax = 1; },
  DispatchMessageA({ cpu }) { cpu.regs.rax = 1; },
  DefWindowProcA({ cpu }) { cpu.regs.rax = 0; },
  PostQuitMessage({ cpu }) { cpu.queue.length = 0; cpu.regs.rax = 0; },
  BeginPaint({ cpu, next }) { cpu.regs.rax = next(); },
  EndPaint({ cpu }) { cpu.regs.rax = 1; },
  FillRect({ win, cpu }) { win.print(`FillRect(hdc=${cpu.regs.rcx})`); cpu.regs.rax = 1; },
  SetTextColor({ cpu }) { cpu.regs.rax = 1; },
  SetBkMode({ cpu }) { cpu.regs.rax = 1; },
  SelectObject({ cpu }) { cpu.regs.rax = 1; },
  GetStockObject({ cpu, next }) { cpu.regs.rax = next(); },
  TextOutA({ win, cpu }) { win.print(`GDI TextOutA: ${cpu.readString(cpu.regs.r9, cpu.mem.get(cpu.regs.rsp + 32) || 4096)}`); },
  SetPixel({ cpu }) { cpu.regs.rax = 1; },
  ExitProcess({ cpu }) { cpu.halted = true; },
  default({ win, name, cpu }) { win.print(`Unhandled import shim: ${name}`); cpu.regs.rax = 0; }
};
