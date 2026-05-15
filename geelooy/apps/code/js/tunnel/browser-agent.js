// B"H
/**
 * @file browser-agent.js
 * @brief Makes the code editor itself an optional browser tunnel agent.
 */

import { State } from '../state.js';
import { UI } from '../ui.js';
import { BrowserTunnelFS } from './browser-fs.js';

const DEFAULT_RECONNECT_MS = 2000;
const BROWSER_AGENT_VERSION = 'browser-editor-alef-1.0.0';
const FS_ACTIONS = new Set(['list', 'tree', 'read', 'md', 'bulk', 'write', 'bulkWrite', 'findReplace']);

function wsUrlFromLocation() {
    const override = State.browserTunnel?.relayUrl;
    if (override) return override;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}`;
}

function defaultName() {
    const saved = State.browserTunnel?.tunnelName;
    if (saved) return saved;
    const existing = localStorage.getItem('awtsmoos.code.browserTunnelName');
    if (existing) return existing;
    const name = `awt-editor-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('awtsmoos.code.browserTunnelName', name);
    return name;
}

function jsonBytes(obj) {
    try { return new Blob([JSON.stringify(obj)]).size; }
    catch (_) { return 0; }
}

function errorResponse(id, error, status = 500) {
    return {
        type: 'TUNNEL_RESPONSE',
        id,
        ok: false,
        status,
        error: error?.message || String(error),
        stack: error?.stack || null
    };
}

function persistSettings() {
    const raw = localStorage.getItem('vividX_settings_profound');
    const settings = JSON.parse(raw || '{}');
    settings.browserTunnel = State.browserTunnel;
    localStorage.setItem('vividX_settings_profound', JSON.stringify(settings));
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

export const BrowserTunnelAgent = {
    ws: null,
    reconnectTimer: null,
    connecting: false,
    events: [],

    init() {
        State.browserTunnel = {
            enabled: false,
            autoStart: false,
            tunnelName: defaultName(),
            relayUrl: '',
            status: 'idle',
            lastError: '',
            connectedAt: null,
            user: null,
            ...(State.browserTunnel || {})
        };

        window.BrowserTunnelAgent = this;
        this.renderFloatingStatus();
        if (State.browserTunnel.autoStart) this.start();
    },

    async start() {
        if (this.ws || this.connecting) return;

        State.browserTunnel.enabled = true;
        State.browserTunnel.autoStart = true;
        State.browserTunnel.tunnelName = defaultName();
        persistSettings();

        this.connecting = true;
        this.setStatus('connecting');

        try {
            await this.checkSession();
            const ws = new WebSocket(wsUrlFromLocation());
            this.ws = ws;

            ws.addEventListener('open', () => {
                this.connecting = false;
                State.browserTunnel.connectedAt = Date.now();
                State.browserTunnel.lastError = '';
                this.setStatus('connected');
                this.register();
                this.logEvent('connected', `Browser tunnel connected as ${State.browserTunnel.tunnelName}`);
            });

            ws.addEventListener('message', event => this.handleMessage(event.data));

            ws.addEventListener('close', () => {
                if (this.ws === ws) this.ws = null;
                this.connecting = false;
                this.setStatus('disconnected');
                this.logEvent('disconnected', 'Browser tunnel socket closed.');
                if (State.browserTunnel.enabled) this.scheduleReconnect();
            });

            ws.addEventListener('error', () => {
                this.connecting = false;
                State.browserTunnel.lastError = 'WebSocket error';
                this.setStatus('error');
                this.logEvent('error', 'WebSocket error in browser tunnel.');
            });
        } catch (e) {
            this.connecting = false;
            State.browserTunnel.lastError = e.message;
            this.setStatus('error');
            this.logEvent('error', e.message);
            UI.showToast('Browser tunnel: ' + e.message, 'error', 7000);
        }
    },

    stop() {
        State.browserTunnel.enabled = false;
        State.browserTunnel.autoStart = false;
        persistSettings();
        clearTimeout(this.reconnectTimer);
        if (this.ws) {
            try { this.ws.close(); } catch (_) {}
            this.ws = null;
        }
        this.setStatus('idle');
        this.logEvent('stopped', 'Browser tunnel disabled.');
    },

    scheduleReconnect() {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.start(), DEFAULT_RECONNECT_MS);
    },

    async checkSession() {
        const res = await fetch('/api/tunnel/control/me', { credentials: 'include' });
        const data = await res.json();
        State.browserTunnel.user = data.identity || data.user || data;
        if (!data || data.ok === false) {
            throw new Error('Please log in to Awtsmoos before enabling browser tunnel.');
        }
    },

    register() {
        this.send({
            type: 'TUNNEL_REGISTER',
            name: State.browserTunnel.tunnelName,
            deviceName: 'Editor Tab',
            root: 'Browser Editor Workspaces',
            allowWrite: true,
            allowSecrets: false,
            allowCommands: false,
            agentVersion: BROWSER_AGENT_VERSION,
            browserAgent: true,
            userAgent: navigator.userAgent,
            capabilities: {
                fs: true,
                browserWorkspaces: true,
                write: true,
                commandRun: false,
                nodeScript: false,
                chrome: false,
                httpProxy: false
            },
            tools: {
                fsList: true,
                fsTree: true,
                fsRead: true,
                fsWrite: true,
                fsBulk: true,
                httpProxy: false,
                command: false,
                nodeScript: false,
                chrome: false,
                browser: true
            },
            chrome: { enabled: false },
            command: { enabled: false }
        });
    },

    send(obj) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(obj));
    },

    async handleMessage(raw) {
        let data;
        try { data = JSON.parse(raw); }
        catch (_) { return; }

        if (data.type === 'TUNNEL_REPLACED') {
            this.logEvent('replaced', 'This browser tunnel was replaced by a newer connection.');
            return;
        }

        if (data.type !== 'TUNNEL_REQUEST') return;

        const payload = data.payload || {};
        this.logEvent('request', `${payload.action || payload.kind || 'unknown'} ${payload.path || ''}`);
        UI.showToast(`Browser tunnel request: ${payload.action || payload.kind}`, 'info', 2200);

        try {
            const result = await this.handleRequest(payload);
            this.send({ type: 'TUNNEL_RESPONSE', id: data.id, ...result });
            this.logEvent('response', `${result.ok === false ? 'failed' : 'ok'} (${jsonBytes(result)} bytes)`);
        } catch (e) {
            this.send(errorResponse(data.id, e));
            this.logEvent('error', e.message);
        }
    },

    async handleRequest(payload) {
        if (payload.kind !== 'fs') {
            return {
                ok: false,
                status: 403,
                error: 'Browser editor tunnel only supports filesystem actions.'
            };
        }

        const action = payload.action || 'list';
        if (!FS_ACTIONS.has(action) || typeof BrowserTunnelFS[action] !== 'function') {
            return {
                ok: false,
                status: 400,
                error: 'Unsupported browser tunnel action: ' + action
            };
        }

        return await BrowserTunnelFS[action](payload);
    },

    setStatus(status) {
        State.browserTunnel.status = status;
        this.renderFloatingStatus();
    },

    logEvent(type, message) {
        this.events.unshift({ type, message, at: new Date().toLocaleTimeString() });
        this.events = this.events.slice(0, 25);
        this.renderFloatingStatus();
    },

    renderFloatingStatus() {
        let el = document.getElementById('browser-tunnel-status');
        if (!el) {
            el = document.createElement('div');
            el.id = 'browser-tunnel-status';
            el.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;max-width:360px;background:rgba(0,0,0,.88);color:white;border:1px solid rgba(0,246,255,.35);border-radius:8px;padding:8px;font-family:var(--font-code,monospace);font-size:11px;box-shadow:0 0 20px rgba(0,0,0,.4);';
            document.body.appendChild(el);
        }

        const b = State.browserTunnel || {};
        if (!b.autoStart && b.status === 'idle') {
            el.style.display = 'none';
            return;
        }

        el.style.display = 'block';
        const recent = this.events.slice(0, 4).map(e => `<div style="opacity:.85;margin-top:4px;">[${escapeHtml(e.at)}] ${escapeHtml(e.type)}: ${escapeHtml(e.message)}</div>`).join('');
        el.innerHTML = `
            <div style="display:flex;gap:6px;align-items:center;justify-content:space-between;">
                <strong>Editor Tunnel</strong>
                <button id="browser-tunnel-stop" style="background:none;color:white;border:1px solid #777;border-radius:4px;cursor:pointer;">Stop</button>
            </div>
            <div>Status: <span style="color:#00f6ff;">${escapeHtml(b.status || 'idle')}</span></div>
            <div>Name: ${escapeHtml(b.tunnelName || '')}</div>
            ${b.lastError ? `<div style="color:#ff5656;">${escapeHtml(b.lastError)}</div>` : ''}
            <div style="max-height:110px;overflow:auto;margin-top:6px;">${recent}</div>`;

        const btn = document.getElementById('browser-tunnel-stop');
        if (btn) btn.onclick = () => this.stop();
    }
};
