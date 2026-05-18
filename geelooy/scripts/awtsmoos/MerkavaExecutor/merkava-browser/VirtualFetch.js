// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualFetch = factory().VirtualFetch; }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualFetch {
        constructor({ files = {}, graph = null } = {}) {
            this.files = files;
            this.graph = graph;
            this.requests = [];
        }
        async fetch(url, options = {}) {
            const request = { url: String(url), method: options.method || 'GET', at: new Date().toISOString(), ok: false };
            this.requests.push(request);
            this.graph?.event?.('network.request', request);
            if (Object.prototype.hasOwnProperty.call(this.files, request.url)) {
                request.ok = true;
                const body = this.files[request.url];
                return response(200, body);
            }
            request.error = 'virtual network miss';
            return response(404, 'Not Found: ' + request.url);
        }
        toJSON() { return { requests: this.requests }; }
    }
    function response(status, body) {
        return { ok: status >= 200 && status < 300, status, text: async () => String(body), json: async () => JSON.parse(String(body)) };
    }
    return { VirtualFetch };
});
