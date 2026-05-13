
// B"H
/**
 * @file SimulatedServerRegistry.js
 * @description
 * In-browser simulated localhost registry for Virtual Browser.
 */

const servers = new Map();

/**
 * @function normalizePort
 * @param {number|string} port Port.
 * @returns {string} Port key.
 */
function normalizePort(port) {
    return String(port || '3000');
}

/**
 * @function page
 * @param {string} title Title.
 * @param {string} body Body.
 * @returns {string} HTML document.
 */
function page(title, body) {
    return [
        '<!doctype html>',
        '<html>',
        '<head><meta charset="utf-8"><title>' + title + '</title></head>',
        '<body>',
        body,
        '</body>',
        '</html>'
    ].join('');
}

/**
 * @function defaultHtml
 * @param {string} name Server name.
 * @param {string} port Port.
 * @returns {string} HTML text.
 */
function defaultHtml(name, port) {
    return page(
        name,
        [
            '<main>',
            '<h1>B&quot;H Simulated Localhost :' + port + '</h1>',
            '<p>This page is served by the Virtual OS simulated server registry.</p>',
            '<p>Use <code>simserve ' + port + '</code>, <code>simservers</code>, and <code>simstop ' + port + '</code>.</p>',
            '</main>'
        ].join('')
    );
}

export const SimulatedServerRegistry = {
    create(port = 3000, options = {}) {
        const key = normalizePort(port);
        const server = {
            port: key,
            name: options.name || `simulated-node-${key}`,
            html: options.html || defaultHtml(options.name || 'Simulated Node', key),
            routes: options.routes || {},
            createdAt: Date.now(),
            logs: []
        };

        servers.set(key, server);
        return server;
    },

    remove(port = 3000) {
        servers.delete(normalizePort(port));
    },

    get(port = 3000) {
        return servers.get(normalizePort(port)) || null;
    },

    list() {
        return [...servers.values()];
    },

    resolve(url) {
        const text = String(url || '');
        const match = text.match(/(?:simulated:\/\/localhost|http:\/\/simulated\.localhost|http:\/\/localhost):?(\d+)?(\/.*)?/i);
        if (!match) return null;

        const port = match[1] || '3000';
        const path = match[2] || '/';
        const server = this.get(port);

        if (!server && /simulated/i.test(text)) {
            return {
                ok: false,
                port,
                path,
                html: defaultHtml('Missing Simulated Server', port)
            };
        }

        if (!server) return null;

        const html = server.routes[path] || server.html;

        server.logs.push({
            type: 'request',
            path,
            at: Date.now()
        });

        return {
            ok: true,
            port,
            path,
            html
        };
    }
};
