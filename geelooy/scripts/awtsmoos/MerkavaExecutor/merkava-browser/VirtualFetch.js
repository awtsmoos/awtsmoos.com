// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualFetch = factory().VirtualFetch; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * Chapter 86: The fetch river learned suffix constellations.
     * A directory app may store files under long repo-relative keys while code
     * requests short browser-relative URLs. The fetch mirror now checks exact
     * aliases first, then safe suffix matches, while logging every candidate.
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

    function response(status, body, url) {
        return { ok: status >= 200 && status < 300, status, url: String(url || ''), text: async () => String(body), json: async () => JSON.parse(String(body)) };
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

    return { VirtualFetch, fileCandidates };
});
