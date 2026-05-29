// B"H
/**
 * B"H
 * Chapter 24: The editor tab became a tunnel, a window with a living name.
 *
 * This complete rewrite preserves the old import path and export name while
 * removing duplicate advertised tools. When a logged-in user enables it, the
 * code editor registers itself as a browser-safe Awtsmoos tunnel exposing
 * workspace FS, preview, and analysis actions.
 */
import { State } from '../state.js';
import { UI } from '../ui.js';
import { BrowserTunnelFS, BROWSER_TUNNEL_FS_ACTIONS } from './browser-fs.js';
import { attachBrowserAnalysis, BROWSER_ANALYSIS_ACTIONS } from './browser-analysis.js';
import { handleBrowserPreviewAction, BROWSER_PREVIEW_ACTIONS } from './browser-preview-actions.js';

attachBrowserAnalysis(BrowserTunnelFS);
const VERSION = 'browser-editor-daled-1.3.0';
const RECONNECT_MS = 2000;
const ALL_ACTIONS = Object.freeze([...new Set([...BROWSER_TUNNEL_FS_ACTIONS, ...BROWSER_ANALYSIS_ACTIONS])]);
const FS_ACTIONS = new Set(ALL_ACTIONS);

const html = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const savedSettings = () => JSON.parse(localStorage.getItem('vividX_settings_profound') || '{}');
const defaultName = () => State.browserTunnel?.tunnelName || localStorage.getItem('awtsmoos.code.browserTunnelName') || rememberName(`awt-editor-${Math.floor(1000 + Math.random() * 9000)}`);
const rememberName = name => (localStorage.setItem('awtsmoos.code.browserTunnelName', name), name);
const wsUrl = () => State.browserTunnel?.relayUrl || `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;

function persist() {
  const settings = savedSettings();
  settings.browserTunnel = State.browserTunnel;
  localStorage.setItem('vividX_settings_profound', JSON.stringify(settings));
}

function tools() {
  return { fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true, fsAdvanced: ALL_ACTIONS, httpProxy: false, command: false, nodeScript: false, chrome: false, browser: true, browserAnalysis: true, previewControl: BROWSER_PREVIEW_ACTIONS };
}

function errorPacket(id, error) {
  return { type: 'TUNNEL_RESPONSE', id, ok: false, status: 500, error: error?.message || String(error), stack: error?.stack || null };
}

export const BrowserTunnelAgent = {
  ws: null, reconnectTimer: null, connecting: false, events: [],
  init() {
    State.browserTunnel = { enabled: false, autoStart: false, tunnelName: defaultName(), relayUrl: '', status: 'idle', lastError: '', connectedAt: null, user: null, ...(State.browserTunnel || {}) };
    window.BrowserTunnelAgent = this;
    this.render();
    if (State.browserTunnel.autoStart) this.start();
  },
  async start() {
    if (this.ws || this.connecting) return;
    State.browserTunnel.enabled = true; State.browserTunnel.autoStart = true; State.browserTunnel.tunnelName = rememberName(defaultName()); persist();
    this.connecting = true; this.status('connecting');
    try {
      await this.checkSession();
      const ws = new WebSocket(wsUrl());
      this.ws = ws;
      ws.addEventListener('open', () => this.onOpen());
      ws.addEventListener('message', event => this.onMessage(event.data));
      ws.addEventListener('close', () => this.onClose(ws));
      ws.addEventListener('error', () => this.onError('WebSocket error'));
    } catch (error) { this.connecting = false; State.browserTunnel.lastError = error.message; this.status('error'); this.log('error', error.message); UI.showToast('Browser tunnel: ' + error.message, 'error', 7000); }
  },
  stop() { State.browserTunnel.enabled = false; State.browserTunnel.autoStart = false; persist(); clearTimeout(this.reconnectTimer); try { this.ws?.close(); } catch (_) {} this.ws = null; this.status('idle'); this.log('stopped', 'Browser tunnel disabled.'); },
  async checkSession() {
    const res = await fetch('/api/tunnel/control/me', { credentials: 'include' });
    const data = await res.json();
    State.browserTunnel.user = data.identity || data.user || data;
    if (!data || data.ok === false) throw new Error('Please log in to Awtsmoos before enabling browser tunnel.');
  },
  onOpen() { this.connecting = false; State.browserTunnel.connectedAt = Date.now(); State.browserTunnel.lastError = ''; this.status('connected'); this.register(); this.log('connected', `Browser tunnel connected as ${State.browserTunnel.tunnelName}`); },
  onClose(ws) { if (this.ws === ws) this.ws = null; this.connecting = false; this.status('disconnected'); this.log('disconnected', 'Browser tunnel socket closed.'); if (State.browserTunnel.enabled) this.reconnectTimer = setTimeout(() => this.start(), RECONNECT_MS); },
  onError(message) { this.connecting = false; State.browserTunnel.lastError = message; this.status('error'); this.log('error', message); },
  register() {
    this.send({ type: 'TUNNEL_REGISTER', name: State.browserTunnel.tunnelName, deviceName: 'Editor Tab', root: 'Browser Editor Workspaces', allowWrite: true, allowSecrets: false, allowCommands: false, agentVersion: VERSION, browserAgent: true, userAgent: navigator.userAgent, capabilities: { fs: true, browserWorkspaces: true, write: true, fsActions: ALL_ACTIONS, commandRun: false, nodeScript: false, chrome: false, httpProxy: false, browserAnalysis: true, previewControl: BROWSER_PREVIEW_ACTIONS }, tools: tools(), chrome: { enabled: false }, command: { enabled: false } });
  },
  send(packet) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(packet)); },
  async onMessage(raw) {
    let data; try { data = JSON.parse(raw); } catch (_) { return; }
    if (data.type === 'TUNNEL_REPLACED') return this.log('replaced', 'This browser tunnel was replaced.');
    if (data.type !== 'TUNNEL_REQUEST') return;
    try { const result = await this.handleRequest(data.payload || {}); this.send({ type: 'TUNNEL_RESPONSE', id: data.id, ...result }); this.log('response', result.ok === false ? 'failed' : 'ok'); }
    catch (error) { this.send(errorPacket(data.id, error)); this.log('error', error.message); }
  },
  async handleRequest(payload) {
    if (payload.kind === 'preview') return await handleBrowserPreviewAction(payload);
    if (payload.kind !== 'fs') return { ok: false, status: 403, error: 'Browser editor tunnel only supports filesystem actions.', availableActions: ALL_ACTIONS };
    const action = payload.action || 'list';
    if (!FS_ACTIONS.has(action) || typeof BrowserTunnelFS[action] !== 'function') return { ok: false, status: 400, error: 'Unsupported browser tunnel action: ' + action, availableActions: ALL_ACTIONS };
    return await BrowserTunnelFS[action](payload);
  },
  status(value) { State.browserTunnel.status = value; this.render(); },
  log(type, message) { this.events.unshift({ type, message, at: new Date().toLocaleTimeString() }); this.events = this.events.slice(0, 25); this.render(); },
  render() {
    let el = document.getElementById('browser-tunnel-status');
    if (!el) { el = document.createElement('div'); el.id = 'browser-tunnel-status'; el.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;max-width:360px;background:rgba(0,0,0,.88);color:white;border:1px solid rgba(0,246,255,.35);border-radius:8px;padding:8px;font-family:var(--font-code,monospace);font-size:11px;box-shadow:0 0 20px rgba(0,0,0,.4);'; document.body.appendChild(el); }
    const b = State.browserTunnel || {};
    if (!b.autoStart && b.status === 'idle') { el.style.display = 'none'; return; }
    const recent = this.events.slice(0, 4).map(e => `<div style="opacity:.85;margin-top:4px;">[${html(e.at)}] ${html(e.type)}: ${html(e.message)}</div>`).join('');
    el.style.display = 'block';
    el.innerHTML = `<div style="display:flex;gap:6px;align-items:center;justify-content:space-between;"><strong>Editor Tunnel</strong><button id="browser-tunnel-stop" style="background:none;color:white;border:1px solid #777;border-radius:4px;cursor:pointer;">Stop</button></div><div>Status: <span style="color:#00f6ff;">${html(b.status || 'idle')}</span></div><div>Name: ${html(b.tunnelName || '')}</div><div>FS tools: ${ALL_ACTIONS.length}</div>${b.lastError ? `<div style="color:#ff5656;">${html(b.lastError)}</div>` : ''}<div style="max-height:110px;overflow:auto;margin-top:6px;">${recent}</div>`;
    document.getElementById('browser-tunnel-stop')?.addEventListener('click', () => this.stop());
  }
};
