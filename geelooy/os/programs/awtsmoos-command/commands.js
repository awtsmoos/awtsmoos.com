// B"H
const HELP = 'help, pwd, ls, cd <path>, open <path>, clear, whoami, tunnels, read <path>';
export function createCommands({ os, state, history, render }) {
  async function run(input = '') {
    const [cmd, ...rest] = input.trim().split(/\s+/); const arg = rest.join(' ');
    if (!cmd) return;
    history.push(`> ${input}`);
    try { await dispatch(cmd.toLowerCase(), arg); } catch (e) { history.push(`error: ${e.message}`); }
    render();
  }
  async function dispatch(cmd, arg) {
    if (cmd === 'help') return history.push(HELP);
    if (cmd === 'pwd') return history.push(state.cwd);
    if (cmd === 'clear') return history.clear();
    if (cmd === 'whoami') return history.push('awtsmoos-os-user');
    if (cmd === 'cd') { state.cwd = resolve(arg || '/'); history.push(state.cwd); return; }
    if (cmd === 'ls') return list(resolve(arg || state.cwd));
    if (cmd === 'read') return read(resolve(arg));
    if (cmd === 'open') return open(resolve(arg || state.cwd));
    if (cmd === 'tunnels') return list('awtsmoos://tunnels');
    history.push(`unknown command: ${cmd}`);
  }
  async function list(path) { const rows = await os.vfs.list(path); history.push(rows.map(x => `${x.type === 'folder' || x.kind === 'folder' ? 'dir ' : 'file'} ${x.name || x.path}`).join('\n') || '(empty)'); }
  async function read(path) { const got = await os.vfs.read(path); history.push(typeof got === 'string' ? got : got.content ?? JSON.stringify(got, null, 2)); }
  function open(path) { os.addWindow({ title:path.split('/').pop() || path, path, os, programName:'awtsmoosFileExplorer' }); history.push(`opened ${path}`); }
  function resolve(path = '') { if (path.startsWith('awtsmoos://')) return path; if (path.startsWith('/')) return path; return `/${[state.cwd, path].join('/').split('/').filter(Boolean).join('/')}`; }
  return { run, help:HELP };
}
/** B"H: Safe commands reveal VFS roads without opening a dangerous native shell. */
