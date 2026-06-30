// B"H
import { COMMAND_NAMES, parseCommand } from './parser.js';
import { basename, dirname, resolvePath } from './pathTools.js';
import { mountTable, table, textOf } from './format.js';
export function createCommands({ os, state, history, render, close } = {}) {
  const api = { run, complete, help:HELP };
  async function run(input = '') {
    const raw = String(input || ''); const { cmd, args } = parseCommand(raw);
    if (!cmd) return; history.record(raw); history.push(`${prompt()} ${raw}`);
    try { await dispatch(cmd, args); } catch (e) { history.push(`error: ${e?.message || e}`); }
    render?.();
  }
  async function dispatch(cmd, args) {
    if (cmd === 'help') return history.push(HELP);
    if (cmd === 'clear') return history.clear();
    if (cmd === 'history') return history.push(history.commands().map((x,i) => `${i + 1} ${x}`).join('\n') || '(empty)');
    if (cmd === 'pwd') return history.push(state.cwd);
    if (cmd === 'cd') return cd(args[0] || '/');
    if (cmd === 'ls' || cmd === 'll') return list(args[0], cmd === 'll');
    if (cmd === 'tree') return history.push(await tree(resolve(args[0] || state.cwd), Number(args[1] || 2)));
    if (cmd === 'cat' || cmd === 'read') return history.push(await readText(resolve(args[0])));
    if (cmd === 'head') return slice(resolve(args[0]), 0, Number(args[1] || 10));
    if (cmd === 'tail') return tail(resolve(args[0]), Number(args[1] || 10));
    if (cmd === 'grep') return grep(args[0], resolve(args[1] || state.cwd));
    if (cmd === 'find' || cmd === 'search') return find(resolve(args[0] || state.cwd), args.slice(1).join(' '));
    if (cmd === 'stat') return stat(resolve(args[0] || state.cwd));
    if (cmd === 'mkdir') return mutate('mkdir', resolve(args[0]));
    if (cmd === 'touch') return write(resolve(args[0]), '');
    if (cmd === 'write') return write(resolve(args[0]), args.slice(1).join(' '));
    if (cmd === 'rm') return mutate('remove', resolve(args[0]));
    if (cmd === 'mv') return moveCopy('move', args);
    if (cmd === 'cp') return moveCopy('copy', args);
    if (cmd === 'open') return open(resolve(args[0] || state.cwd), 'awtsmoosFileExplorer');
    if (cmd === 'edit') return open(resolve(args[0] || state.cwd), 'advancedCodeEditor');
    if (cmd === 'preview') return open(resolve(args[0] || state.cwd), 'awtsmoosFileExplorer');
    if (cmd === 'json') return json(resolve(args[0]));
    if (cmd === 'mounts') return history.push(mountTable(vfs().mounts?.() || []));
    if (cmd === 'tunnels') return list('awtsmoos://tunnels', true);
    if (cmd === 'refresh' || cmd === 'reload' || cmd === 'connect') return refresh();
    if (cmd === 'disconnect') return history.push('disconnect: use tunnel control; mounted drives stay safe inside OS permissions.');
    if (cmd === 'whoami') return history.push(os?.aiSession?.userId || 'awtsmoos-os-user');
    if (cmd === 'hostname') return history.push(globalThis.location?.hostname || 'awtsmoos-os');
    if (cmd === 'date') return history.push(new Date().toDateString());
    if (cmd === 'time') return history.push(new Date().toLocaleTimeString());
    if (cmd === 'echo') return history.push(args.join(' '));
    if (cmd === 'env') return env();
    if (cmd === 'exit') return close?.();
    history.push(`unknown command: ${cmd}`);
  }
  function complete(value = '') { const last = String(value).split(/\s+/).pop().toLowerCase(); return COMMAND_NAMES.find(x => x.startsWith(last) && x !== last) || ''; }
  function prompt() { return `${state.cwd}>`; }
  function resolve(path) { return resolvePath(state.cwd, path); }
  function vfs() { if (!os?.vfs) throw new Error('VFS is not available'); return os.vfs; }
  async function cd(path) { const next = resolve(path); await vfs().list(next); state.cwd = next; history.push(state.cwd); }
  async function list(path, long = false) { history.push(table(await vfs().list(resolve(path || state.cwd)), long)); }
  async function readText(path) { if (!path) throw new Error('path required'); return textOf(await vfs().read(path)); }
  async function slice(path, start, count) { history.push((await readText(path)).split('\n').slice(start, start + count).join('\n')); }
  async function tail(path, count) { const lines = (await readText(path)).split('\n'); history.push(lines.slice(Math.max(0, lines.length - count)).join('\n')); }
  async function grep(pattern, path) { if (!pattern) throw new Error('pattern required'); const lines = (await readText(path)).split('\n'); history.push(lines.filter(x => x.includes(pattern)).join('\n') || '(no matches)'); }
  async function find(path, query) { const rows = await vfs().list(path); const q = String(query || '').toLowerCase(); history.push(rows.filter(x => !q || String(x.name || x.path || '').toLowerCase().includes(q)).map(x => `${x.type || x.kind || 'item'} ${x.name || x.path}`).join('\n') || '(no matches)'); }
  async function tree(path, depth, prefix = '') { const rows = await vfs().list(path); const out = []; for (const item of rows) { const name = item.name || basename(item.path); out.push(`${prefix}${name}`); if (depth > 1 && /folder|directory/.test(item.type || item.kind || '')) out.push(await tree(resolvePath(path, name), depth - 1, `${prefix}  `)); } return out.filter(Boolean).join('\n') || '(empty)'; }
  async function stat(path) { history.push(textOf(await vfs().stat(path))); }
  async function mutate(method, path) { if (!path) throw new Error('path required'); const result = await vfs()[method](path, { principal:{ id:'awtsmoos-command' } }); history.push(textOf(result)); }
  async function write(path, content) { if (!path) throw new Error('path required'); const result = await vfs().write(path, content, { principal:{ id:'awtsmoos-command' } }); history.push(textOf(result)); }
  async function moveCopy(method, args) { const from = resolve(args[0]); const to = resolve(args[1] || basename(from)); if (!args[0] || !args[1]) throw new Error(`${method} requires source and destination`); history.push(textOf(await vfs()[method](from, to, { principal:{ id:'awtsmoos-command' } }))); }
  function open(path, programName) { os?.addWindow?.({ title:basename(path), path:dirname(path), filePath:path, os, programName }); history.push(`opened ${path}`); }
  async function json(path) { history.push(JSON.stringify(JSON.parse(await readText(path)), null, 2)); }
  async function refresh() { const got = await os?.refreshRemoteDrives?.(); history.push(`refreshed ${(got?.devices?.devices || []).length} tunnel vessel(s)`); }
  function env() { history.push(`cwd=${state.cwd}\nmounts=${(vfs().mounts?.() || []).length}\nprogram=awtsmoosCommand`); }
  return api;
}
const HELP = `Commands: ${COMMAND_NAMES.join(', ')}\nSafe law: every filesystem action goes through os.vfs and tunnel adapters; no native shell execution.`;
/** B"H: The command dispatch is a guarded palace; VFS doors open, native danger does not. */
