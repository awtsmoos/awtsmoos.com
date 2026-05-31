// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualFetch = factory().VirtualFetch; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * Chapter 22: The fetch river learned the data-url spring.
     * Files still resolve through exact aliases and suffix constellations, but
     * `data:` now blooms locally like Chrome: text, JSON, base64, media type,
     * and status all travel in one small synthetic response.
     */
    class VirtualFetch {
        constructor({ files = {}, graph = null, baseUrl = 'http://127.0.0.1:8080/' } = {}) {
            this.files = files;
            this.graph = graph;
            this.baseUrl = baseUrl;
            this.requests = [];
        }

        async fetch(url, options = {}) {
            const request = { url: String(url), method: options.method || 'GET', at: new Date().toISOString(), ok: false, candidates: [] };
            this.requests.push(request);
            this.graph?.event?.('network.request', request);
            if (/^data:/i.test(request.url)) return this.respondDataUrl(request);
            const hit = this.findFile(request.url, request);
            if (hit) {
                request.ok = true;
                request.key = hit.key;
                this.graph?.event?.('network.response', { url: request.url, key: hit.key, status: 200 });
                return response(200, hit.body, request.url);
            }
            request.error = 'virtual network miss';
            this.graph?.event?.('network.response', { url: request.url, status: 404 });
            return response(404, 'Not Found: ' + request.url, request.url);
        }

        respondDataUrl(request) {
            const parsed = parseDataUrl(request.url);
            request.ok = parsed.ok;
            request.dataUrl = true;
            request.mime = parsed.mime;
            if (!parsed.ok) request.error = parsed.error;
            this.graph?.event?.('network.response', { url: request.url, status: parsed.ok ? 200 : 400, dataUrl: true });
            return response(parsed.ok ? 200 : 400, parsed.body, request.url, parsed.mime);
        }

        findFile(rawUrl, request) {
            const candidates = fileCandidates(rawUrl, this.baseUrl);
            request.candidates = candidates;
            for (const key of candidates) if (has(this.files, key)) return { key, body: this.files[key] };
            const suffix = suffixHit(this.files, candidates);
            if (suffix) return suffix;
            return null;
        }

        toJSON() { return { requests: this.requests }; }
    }

    function parseDataUrl(raw) {
        try {
            const bodyStart = String(raw).indexOf(',');
            if (bodyStart < 0) return { ok: false, error: 'malformed data URL', body: '', mime: 'text/plain' };
            const meta = String(raw).slice(5, bodyStart);
            const encoded = String(raw).slice(bodyStart + 1);
            const parts = meta.split(';').filter(Boolean);
            const mime = parts[0] || 'text/plain;charset=US-ASCII';
            const isBase64 = parts.some(x => x.toLowerCase() === 'base64');
            const body = isBase64 ? bufferDecode(encoded, 'base64') : decodeURIComponent(encoded);
            return { ok: true, body, mime };
        } catch (error) {
            return { ok: false, error: error.message, body: '', mime: 'text/plain' };
        }
    }

    function bufferDecode(value, encoding) {
        if (typeof Buffer !== 'undefined') return Buffer.from(value, encoding).toString('utf8');
        if (typeof atob !== 'undefined') return atob(value);
        return value;
    }

    function has(files, key) { return Object.prototype.hasOwnProperty.call(files, key); }

    function suffixHit(files, candidates) {
        const keys = Object.keys(files || {});
        for (const candidate of candidates.map(stripParents).filter(Boolean)) {
            const clean = candidate.replace(/^\.\//, '').replace(/^\//, '');
            const hits = keys.filter(key => key === clean || key.endsWith('/' + clean));
            if (hits.length === 1) return { key: hits[0], body: files[hits[0]] };
        }
        return null;
    }

    function response(status, body, url, mime = 'text/plain') {
        const headers = { get(name) { return String(name).toLowerCase() === 'content-type' ? mime : null; } };
        return {
            ok: status >= 200 && status < 300,
            status,
            url: String(url || ''),
            headers,
            text: async () => String(body),
            json: async () => JSON.parse(String(body)),
            blob: async () => ({ size: String(body).length, type: mime, text: async () => String(body) }),
            arrayBuffer: async () => {
                const text = String(body);
                const buf = new ArrayBuffer(text.length);
                const view = new Uint8Array(buf);
                for (let i = 0; i < text.length; i++) view[i] = text.charCodeAt(i) & 255;
                return buf;
            }
        };
    }

    function fileCandidates(rawUrl, baseUrl) {
        const out = [];
        const add = value => {
            const clean = String(value || '').replace(/\\/g, '/');
            if (!clean) return;
            out.push(clean, clean.replace(/^\.\//, ''), '/' + clean.replace(/^\/?/, ''), './' + clean.replace(/^\/?/, ''));
            const stripped = stripParents(clean);
            out.push(stripped, '/' + stripped.replace(/^\//, ''), './' + stripped.replace(/^\//, ''));
        };
        add(rawUrl);
        try {
            const url = new URL(String(rawUrl), baseUrl || 'http://127.0.0.1/');
            const noHash = new URL(url.href); noHash.hash = '';
            const noQuery = new URL(noHash.href); noQuery.search = '';
            add(url.href);
            add(noHash.href);
            add(noQuery.href);
            add(decodeURIComponent(noQuery.pathname || '').replace(/^\//, ''));
            add(decodeURIComponent(url.pathname || '').replace(/^\//, ''));
        } catch (_) {}
        return [...new Set(out.filter(Boolean))];
    }

    function stripParents(value) {
        let clean = String(value || '').replace(/^\.\//, '').replace(/^\//, '');
        while (clean.startsWith('../')) clean = clean.slice(3);
        return clean;
    }

    return { VirtualFetch, fileCandidates, parseDataUrl };
});
