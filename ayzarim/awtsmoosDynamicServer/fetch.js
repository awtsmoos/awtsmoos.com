// B"H
const http = require('http');
const https = require('https');

function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https://') ? https : http;

        const requestOptions = {
            method: options.method || 'GET',
            headers: options.headers || {},
        };

        if (options.body) {
            requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
        }

        const req = protocol.request(url, requestOptions, (res) => {
            // B"H - FIX: Use Async Iterator
            // This creates a non-lossy stream puller automatically.
            // We do not need to call pause() or resume() manually.
            const iterator = res[Symbol.asyncIterator]();

            const response = {
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                body: {
                    getReader: () => {
                        return {
                            read: async () => {
                                // This pulls the next chunk only when asked.
                                // Node.js handles the buffering/pausing internally here.
                                const { value, done } = await iterator.next();
                                return { value, done };
                            }
                        };
                    },
                },
                text: async () => {
                    let data = '';
                    for await (const chunk of res) {
                        data += chunk;
                    }
                    return data;
                },
                json: async () => {
                    let data = '';
                    for await (const chunk of res) {
                        data += chunk;
                    }
                    return JSON.parse(data);
                },
            };
            resolve(response);
        });

        req.on('error', (e) => reject(e));

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}



class URLSearchParams {
    constructor(init = '') {
        this.params = new Map();
        if (typeof init === 'string') {
            init.split('&').forEach(pair => {
                if(!pair) return;
                const [key, value] = pair.split('=').map(decodeURIComponent);
                this.append(key, value || '');
            });
        } else if (typeof init === 'object') {
            Object.entries(init).forEach(([key, value]) => this.append(key, value));
        }
    }
    append(key, value) {
        if (this.params.has(key)) this.params.get(key).push(String(value));
        else this.params.set(key, [String(value)]);
    }
    toString() {
        const array = [];
        this.params.forEach((values, key) => {
            values.forEach(value => array.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`));
        });
        return array.join('&');
    }
}

class TextEncoder {
    constructor(encoding) { this.encoding = encoding; }
    decode(buffer, options) { return buffer.toString(this.encoding); }
}

module.exports = { fetch, TextEncoder, URLSearchParams };