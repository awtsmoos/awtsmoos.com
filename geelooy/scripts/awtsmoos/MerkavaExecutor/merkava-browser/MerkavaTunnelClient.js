// B"H
// B"H — MerkavaTunnelClient: the Merkava browser IS a tunnel client.
// Runs the ENTIRE Awtsmoos tunnel protocol natively — no separate app.
//
// Protocol (matches tcmd.py / external-agent flow):
//   1. GET  {base}/api/tunnel/control/my-device        (Bearer token)
//      → { nativeDevices: [{ connected, isAlive, routeReference, ... }] }
//   2. POST {base}/api/tunnel/control/fs/{routeRef}
//      body: { action: 'commandRun', command, timeoutMs, cwd? }
//      → response envelope; if { pending: true, next: {...} } follow with
//        retryAction posts until resolved.
//   3. Actions: commandRun, fs list/read/write, merkava* (render/compile)...
//
// Works anywhere: Node (global fetch), browser (window.fetch), or the
// Merkava VM (inject fetchImpl). RAM-light: no WS held open, short-lived
// HTTPS requests, bounded retries.
//
// UMD + Merkava namespace, like other merkava-browser modules.
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.MerkavaTunnelClient = factory().MerkavaTunnelClient; }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const DEFAULT_BASE = "https://awtsmoos.com";
    const MAX_RETRIES = 40;
    const RETRY_MIN_MS = 500;
    const RETRY_MAX_MS = 4000;

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    class TunnelError extends Error {
        constructor(message, code, detail) {
            super(message);
            this.name = "TunnelError";
            this.code = code;
            this.detail = detail;
        }
    }

    class MerkavaTunnelClient {
        constructor(opts = {}) {
            this.baseUrl = (opts.baseUrl || DEFAULT_BASE).replace(/\/$/, "");
            this.token = opts.token || null;
            this.fetchImpl = opts.fetchImpl || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : null);
            if (!this.fetchImpl) throw new Error("MerkavaTunnelClient: no fetch implementation available");
            this.routeRef = opts.routeRef || null;
            this.preferredRef = opts.preferredRef || null;
            this.onEvent = opts.onEvent || null; // (type, data)
            this.timeoutMs = opts.timeoutMs || 60000;
            this.devices = [];
        }

        emit(type, data) { try { if (this.onEvent) this.onEvent(type, data); } catch (_) {} }

        setToken(token) { this.token = token; }

        authHeaders(extra = {}) {
            if (!this.token) throw new TunnelError("No auth token set", "no_token");
            return { "Authorization": "Bearer " + this.token, "Content-Type": "application/json", ...extra };
        }

        async http(method, path, body, timeoutMs) {
            const url = this.baseUrl + path;
            const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
            const to = setTimeout(() => { try { ctrl && ctrl.abort(); } catch (_) {} }, timeoutMs || this.timeoutMs);
            try {
                const res = await this.fetchImpl(url, {
                    method,
                    headers: this.authHeaders(),
                    body: body === undefined ? undefined : JSON.stringify(body),
                    signal: ctrl ? ctrl.signal : undefined
                });
                const text = await res.text();
                try { return JSON.parse(text); }
                catch (_) { return { ok: false, error: "bad_json", raw: String(text).slice(0, 300), httpStatus: res.status }; }
            } catch (e) {
                if (e && e.name === "TunnelError") throw e;
                throw new TunnelError("Transport failed: " + e.message, "transport", { url: path });
            } finally { clearTimeout(to); }
        }

        // ---- Discovery ----
        async myDevice() {
            const d = await this.http("GET", "/api/tunnel/control/my-device", undefined, 30000);
            this.emit("my-device", d);
            return d;
        }

        async discover(preferredRef) {
            const d = await this.myDevice();
            const alive = (d.nativeDevices || []).filter(n => n.connected && n.isAlive);
            const want = preferredRef || this.preferredRef;
            alive.sort((a, b) => (a.routeReference === want ? 0 : 1) - (b.routeReference === want ? 0 : 1));
            this.devices = alive;
            if (!alive.length) throw new TunnelError("No alive tunnel devices", "no_route", d);
            this.routeRef = alive[0].routeReference;
            this.emit("discover", { routeRef: this.routeRef, device: alive[0] });
            return this.routeRef;
        }

        async ensureRoute() {
            if (this.routeRef) return this.routeRef;
            return await this.discover();
        }

        // ---- Action execution with pending-envelope following ----
        async executeAction(action, params = {}, opts = {}) {
            const ref = opts.routeRef || await this.ensureRoute();
            const timeoutMs = opts.timeoutMs || this.timeoutMs;
            const deadline = Date.now() + timeoutMs;
            let body = { action, ...params };
            let resp = await this.http("POST", "/api/tunnel/control/fs/" + encodeURIComponent(ref), body, Math.min(90000, timeoutMs));
            let retries = 0;
            while (resp && resp.pending && Date.now() < deadline && retries < MAX_RETRIES) {
                const nxt = resp.next || {};
                let params2 = nxt.params;
                if (typeof params2 === "string") { try { params2 = JSON.parse(params2); } catch (_) { params2 = null; } }
                let obs;
                if (params2 && typeof params2 === "object") obs = params2;
                else {
                    obs = { action: "retryAction" };
                    for (const k of ["controlRequestId", "tunnelName", "clientRequestId", "agentSessionId", "logicalAgentId", "nonce", "path", "requestedAction"]) {
                        if (nxt[k]) obs[k] = nxt[k];
                    }
                }
                this.emit("pending", { action, retry: retries, retryAfterMs: nxt.retryAfterMs });
                await sleep(Math.max(RETRY_MIN_MS, Math.min(RETRY_MAX_MS, nxt.retryAfterMs || 800)));
                if (resp.error === "tunnel_not_alive" || resp.error === "transport") {
                    await sleep(3000);
                    const nr = await this.discover().catch(() => null);
                    if (nr) { /* continue with new ref */ }
                    resp = await this.http("POST", "/api/tunnel/control/fs/" + encodeURIComponent(this.routeRef || ref), obs, 90000);
                } else {
                    resp = await this.http("POST", "/api/tunnel/control/fs/" + encodeURIComponent(ref), obs, 90000);
                }
                retries++;
            }
            if (resp && resp.pending) throw new TunnelError("Action stayed pending past deadline", "pending_timeout", { action });
            this.emit("action-result", { action, ok: !resp.error });
            return resp;
        }

        // ---- Convenience: shell ----
        async commandRun(command, timeoutMs = 30000, cwd) {
            const params = { command, timeoutMs };
            if (cwd) params.cwd = cwd;
            const resp = await this.executeAction("commandRun", params, { timeoutMs: timeoutMs + 30000 });
            // Normalize: tcmd-style responses carry jobId; poll for completion
            const jobId = (resp.statusPayload || {}).jobId || (resp.nextAction || {}).jobId || resp.jobId;
            if (jobId && !resp.stdout && resp.ok !== false) {
                return await this.pollJob(jobId, timeoutMs + 30000);
            }
            return resp;
        }

        async pollJob(jobId, timeoutMs = 60000) {
            const deadline = Date.now() + timeoutMs;
            let delay = 800;
            while (Date.now() < deadline) {
                const resp = await this.executeAction("jobStatus", { jobId }, { timeoutMs: 30000 }).catch(() => null);
                if (resp && (resp.done || resp.status === "done" || resp.exitCode !== undefined)) return resp;
                await sleep(delay);
                delay = Math.min(4000, delay * 1.5);
            }
            throw new TunnelError("Job poll timed out", "job_timeout", { jobId });
        }

        // ---- Convenience: fs ----
        async fsList(path) { return await this.executeAction("list", { path }); }
        async fsRead(path) { return await this.executeAction("read", { path }); }
        async fsWrite(path, content) { return await this.executeAction("write", { path, content }); }
        async fsMkdir(path) { return await this.executeAction("mkdir", { path }); }

        // ---- Convenience: merkava actions (render lab etc.) ----
        async merkava(action, payload = {}) {
            return await this.executeAction(action, payload, { timeoutMs: 120000 });
        }

        // ---- Token from the standard agent location (Node hosts) ----
        static loadTokenFromAgentDir() {
            try {
                const fs = require("fs"), os = require("os"), path = require("path");
                const p = path.join(os.homedir(), "workspace", ".awtsmoos-agent", "tokens.json");
                const j = JSON.parse(fs.readFileSync(p, "utf8"));
                return j.access_token || null;
            } catch (_) { return null; }
        }
    }

    return { MerkavaTunnelClient, TunnelError };
});
