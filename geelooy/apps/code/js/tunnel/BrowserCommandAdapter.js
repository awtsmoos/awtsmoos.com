// B"H
import { commandFail, commandOk } from '../../../../shared/virtual-os/command/CommandContract.js';
import { commandModeData, helpText, unsupportedCommandError } from './browser-command-policy.js';

/**
 * B"H
 * Chapter 92: The Code vessel ran only the commands it could truly carry.
 */
export class BrowserCommandAdapter {
  constructor({ fs }) { this.fs = fs; }

  async run(payload = {}) {
    const command = String(payload.command || payload.text || '').trim();
    const cwd = payload.cwd || payload.path || '.';
    const startedAt = Date.now();
    if (!command) return this.fail({ command, cwd, error: 'Browser command requires command text.', code: 'browser_command_required', startedAt });
    try {
      const stdout = await this.dispatch(tokenize(command), cwd);
      return commandOk({ command, cwd, stdout, simulated: true, vessel: 'browser-tab', durationMs: Date.now() - startedAt, data: commandModeData('merkava-virtual') });
    } catch (error) {
      return this.fail({ command, cwd, error, code: error.code || 'command_failed', mode: error.commandMode || 'merkava-virtual', startedAt });
    }
  }

  fail({ command, cwd, error, code, mode = 'unsupported', startedAt }) {
    const message = error?.message || String(error);
    return commandFail({ command, cwd, error: message, simulated: true, vessel: 'browser-tab', durationMs: Date.now() - startedAt, data: { ...commandModeData(mode), error: code, message } });
  }

  async dispatch(tokens, cwd) {
    const [name, ...args] = tokens;
    if (name === 'pwd') return cwd;
    if (name === 'ls') return await this.list(resolvePath(args[0], cwd));
    if (name === 'cat') return await this.read(required(args[0], 'cat requires a file path.'));
    if (name === 'head') return head(await this.read(required(args[0], 'head requires a file path.')), Number(args[1] || 20));
    if (name === 'tail') return tail(await this.read(required(args[0], 'tail requires a file path.')), Number(args[1] || 20));
    if (name === 'grep' || name === 'rg') return await this.grep(required(args[0], `${name} requires a query.`), resolvePath(args[1], cwd));
    if (name === 'find') return await this.find(resolvePath(args[0], cwd), args[1] || '');
    if (name === 'tree') return await this.tree(resolvePath(args[0], cwd));
    if (name === 'echo') return args.join(' ');
    if (name === 'help') return helpText();
    if (name === 'clear') return '';
    throw unsupportedCommandError(name);
  }

  async list(path) {
    const got = await this.fs.call({ action: 'list', path });
    return (got.detailedItems || got.items || []).map(item => typeof item === 'string' ? item : item.name + (item.isDirectory ? '/' : '')).join('\n');
  }
  async read(path) { const got = await this.fs.call({ action: 'read', path, maxChars: 120000 }); return got.content || ''; }
  async tree(path) { const got = await this.fs.call({ action: 'tree', path, depth: 4 }); return got.treeText || JSON.stringify(got, null, 2); }
  async grep(query, path) {
    const got = await this.fs.call({ action: 'rg', path, query, maxResults: 200 });
    return (got.results || []).map(row).join('\n') || `No matches for ${query}.`;
  }
  async find(path, query) { const got = await this.fs.call({ action: 'findFiles', path, query, maxResults: 200 }); return (got.results || []).map(r => r.path || r.name).join('\n') || 'No files found.'; }
}
function row(r) { const line = r.lineNumber || r.lineNo || r.line || 1; const preview = r.preview || r.text || r.content || (typeof r.line === 'string' ? r.line : ''); return `${r.path}:${line}: ${preview}`; }
function tokenize(command) { return String(command).match(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+/g)?.map(x => x.replace(/^['"]|['"]$/g, '')) || []; }
function resolvePath(value, cwd) { return value || cwd || '.'; }
function required(value, message) { if (!value) throw new Error(message); return value; }
function lines(text) { const parts = String(text).split('\n'); return parts.at(-1) === '' ? parts.slice(0, -1) : parts; }
function head(text, n) { return lines(text).slice(0, safeN(n)).join('\n'); }
function tail(text, n) { return lines(text).slice(-safeN(n)).join('\n'); }
function safeN(n) { return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 500) : 20; }
