// B"H
/**
 * B"H
 * Chapter 37: The editor tab stopped whispering its oath in two places.
 *
 * Registration packet shaping now lives in browser-agent-packets.js so the
 * protocol-v2 oath is tested without loading the full /apps/code universe.
 */
import { State } from '../state.js';
import { UI } from '../ui.js';
import { BrowserTunnelFS, BROWSER_TUNNEL_FS_ACTIONS } from './browser-fs.js';
import { attachBrowserAnalysis, BROWSER_ANALYSIS_ACTIONS } from './browser-analysis.js';
import { handleBrowserPreviewAction, BROWSER_PREVIEW_ACTIONS } from './browser-preview-actions.js';
import { BrowserCommandAdapter } from './BrowserCommandAdapter.js';
import { codeBrowserRegistrationPacket } from './browser-agent-packets.js';

attachBrowserAnalysis(BrowserTunnelFS);

const RECONNECT_MIN_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const COMMAND_ACTIONS = Object.freeze(['command', 'commandRun', 'shellCommand', 'run_terminal_command']);
const ALL_ACTIONS = Object.freeze([...new Set([...BROWSER_TUNNEL_FS_ACTIONS, ...BROWSER_ANALYSIS_ACTIONS, ...COMMAND_ACTIONS, ...BROWSER_PREVIEW_ACTIONS.map(x => 'preview:' + x)])]);
const FS_ACTIONS = new Set([...BROWSER_TUNNEL_FS_ACTIONS, ...BROWSER_ANALYSIS_ACTIONS]);
const commandRunner = new BrowserCommandAdapter({ fs: { call: payload => dispatchFs(payload) } });

const html = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const savedSettings = () => JSON.parse(localStorage.getItem('vividX_settings_profound') || '{}');
const rememberName = name => (localStorage.setItem('awtsmoos.code.browserTunnelName', name), name);
const defaultName = () => State.browserTunnel?.tunnelName || localStorage.getItem('awtsmoos.code.browserTunnelName') || rememberName(`awt-browser-code-${Math.floor(1000 + Math.random() * 9000)}`);
const wsUrl = () => State.browserTunnel?.relayUrl || `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;

async function dispatchFs(payload = {}) {
  const action = payload.action || 'list';
  if (!FS_ACTIONS.has(action) || typeof BrowserTunnelFS[action] !== 'function') {
    return { ok: false, status: 400, error: 'Unsupported browser tunnel filesystem action: ' + action, availableActions: [...FS_ACTIONS] };
  }
  return await BrowserTunnelFS[action](payload);
}

function persist() {
  const settings = savedSettings();
  settings.browserTunnel = State.browserTunnel;
  localStorage.setItem('vividX_settings_profound', JSON.stringify(settings));
}

function errorPacket(id, error) {
  return { type: 'TUNNEL_RESPONSE', id, ok: false, status: 500, error: error?.message || String(error), stack: error?.stack || null, vessel: 'browser-tab' };
}

function registrationPacket() {
  return codeBrowserRegistrationPacket({
    tunnelName: State.browserTunnel.tunnelName,
    fsActions: [...FS_ACTIONS],
    commandActions: [...COMMAND_ACTIONS],
    previewActions: [...BROWSER_PREVIEW_ACTIONS],
    userAgent: navigator.userAgent
  });
}

export const BrowserTunnelAgent = {
  ws: null,
  reconnectTimer: null,
  reconnectAttempt: 0,
  connecting: false,
  events: [],

  init() {
    State.browserTunnel = { enabled: false, autoStart: false, tunnelName: defaultName(), relayUrl: '', status: 'idle', lastError: '', connectedAt: null, user: null, ...(State.browserTunnel || {}) };
    window.BrowserTunnelAgent = this;
    this.render();
    if (State.browserTunnel.autoStart) this.start();
  },

  async start() {
    if (this.ws || this.connecting) return;
    State.browserTunnel.enabled = true;
    State.browserTunnel.autoStart = true;
    State.browserTunnel.tunnelName = rememberName(defaultName());
    persist();
    this.connecting = true;
    this.status('connecting');
    try {
      await this.checkSession();
      const ws = new WebSocket(wsUrl());
      this.ws = ws;
      ws.addEventListener('open', () => this.onOpen());
      ws.addEventListener('message', event => this.onMessage(event.data));
      ws.addEventListener('close', () => this.onClose(ws));
      ws.addEventListener('error', () => this.onError('WebSocket error'));
    } catch (error) {
      this.connecting = false;
      State.browserTunnel.lastError = error.message;
      this.status('error');
      this.log('error', error.message);
      UI.showToast('Browser tunnel: ' + error.message, 'error', 7000);
    }
  },

  stop() {
    State.browserTunnel.enabled = false;
    State.browserTunnel.autoStart = false;
    persist();
    clearTimeout(this.reconnectTimer);
    try { this.ws?.close(); } catch (_) {}
    this.ws = null;
    this.status('idle');
    this.log('stopped', 'Browser tunnel disabled.');
  },

  async checkSession() {
    const res = await fetch('/api/tunnel/control/me', { credentials: 'include' });
    const data = await res.json();
    State.browserTunnel.user = data.identity || data.user || data;
    if (!data || data.ok === false) throw new Error('Please log in to Awtsmoos before enabling browser tunnel.');
  },

  onOpen() {
    this.connecting = false;
    this.reconnectAttempt = 0;
    State.browserTunnel.connectedAt = Date.now();
    State.browserTunnel.lastError = '';
    this.status('connected');
    this.register();
    this.log('connected', `Browser tunnel connected as ${State.browserTunnel.tunnelName}`);
  },

  onClose(ws) {
    if (this.ws === ws) this.ws = null;
    this.connecting = false;
    const reconnecting = State.browserTunnel.enabled;
    this.status(reconnecting ? 'reconnecting' : 'disconnected');
    this.log('disconnected', 'Browser tunnel socket closed.');
    if (reconnecting) this.reconnectTimer = setTimeout(() => this.start(), this.reconnectDelayMs());
  },

  onError(message) {
    this.connecting = false;
    State.browserTunnel.lastError = message;
    this.status('error');
    this.log('error', message);
  },

  register() { this.send(registrationPacket()); },
  send(packet) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(packet)); },

  async onMessage(raw) {
    let data;
    try { data = JSON.parse(raw); } catch (_) { return; }
    if (data.type === 'TUNNEL_REPLACED') return this.log('replaced', 'This browser tunnel was replaced.');
    if (data.type !== 'TUNNEL_REQUEST') return;
    try {
      const result = await this.handleRequest(data.payload || {});
      this.send({ type: 'TUNNEL_RESPONSE', id: data.id, ...result, vessel: 'browser-tab', tunnelName: State.browserTunnel.tunnelName });
      this.log('response', result.ok === false ? 'failed' : 'ok');
    } catch (error) {
      this.send(errorPacket(data.id, error));
      this.log('error', error.message);
    }
  },

  async handleRequest(payload) {
    const action = payload.action || 'list';
    if (payload.kind === 'preview') return await handleBrowserPreviewAction(payload);
    if (COMMAND_ACTIONS.includes(action) || payload.kind === 'command') return await commandRunner.run(payload);
    if (payload.kind && payload.kind !== 'fs') return { ok: false, status: 403, error: 'Browser editor tunnel only supports fs, preview, and simulated command actions.', availableActions: ALL_ACTIONS };
    return await dispatchFs(payload);
  },

  status(value) { State.browserTunnel.status = value; this.render(); },
  reconnectDelayMs() {
    this.reconnectAttempt += 1;
    const base = Math.min(RECONNECT_MAX_MS, RECONNECT_MIN_MS * Math.pow(2, this.reconnectAttempt - 1));
    return Math.min(RECONNECT_MAX_MS, base + Math.floor(Math.random() * Math.max(1, base * 0.25)));
  },
  log(type, message) { this.events.unshift({ type, message:String(message || '').slice(0, 240), at: new Date().toLocaleTimeString() }); this.events = this.events.slice(0, 25); this.render(); },

  render() {
    let el = document.getElementById('browser-tunnel-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'browser-tunnel-status';
      el.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;max-width:360px;background:rgba(0,0,0,.88);color:white;border:1px solid rgba(0,246,255,.35);border-radius:8px;padding:8px;font-family:var(--font-code,monospace);font-size:11px;box-shadow:0 0 20px rgba(0,0,0,.4);';
      document.body.appendChild(el);
    }
    const b = State.browserTunnel || {};
    if (!b.autoStart && b.status === 'idle') { el.style.display = 'none'; return; }
    const recent = this.events.slice(0, 4).map(e => `<div style="opacity:.85;margin-top:4px;">[${html(e.at)}] ${html(e.type)}: ${html(e.message)}</div>`).join('');
    el.style.display = 'block';
    el.innerHTML = `<div style="display:flex;gap:6px;align-items:center;justify-content:space-between;"><strong>Editor Tunnel</strong><button id="browser-tunnel-stop" style="background:none;color:white;border:1px solid #777;border-radius:4px;cursor:pointer;">Stop</button></div><div>Status: <span style="color:#00f6ff;">${html(b.status || 'idle')}</span>${this.reconnectAttempt ? ` <span style="opacity:.7;">attempt ${this.reconnectAttempt}</span>` : ''}</div><div>Name: ${html(b.tunnelName || '')}</div><div>FS tools: ${FS_ACTIONS.size}</div><div>Command: simulated</div>${b.lastError ? `<div style="color:#ff5656;">${html(b.lastError)}</div>` : ''}<div style="max-height:110px;overflow:auto;margin-top:6px;">${recent}</div>`;
    document.getElementById('browser-tunnel-stop')?.addEventListener('click', () => this.stop());
  }
};
