//B"H
const http = require('http');
const https = require('https');

function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        // Determine the protocol from the URL
        const protocol = url.startsWith('https://') ? https : http;

        // Set up the request options
        const requestOptions = {
            method: options.method || 'GET',
            headers: options.headers || {},
        };

        // Handle the request body if present
        if (options.body) {
            // Safety check: Don't mess with Buffers, only stringify objects/params
            if (typeof options.body === 'object' && !Buffer.isBuffer(options.body) && !(options.body instanceof URLSearchParams)) {
                try {
                    options.body = JSON.stringify(options.body);
                } catch(e){}
            } else if (options.body instanceof URLSearchParams) {
                options.body = options.body.toString();
            }
            
            requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
        }

        // Create the request
        const req = protocol.request(url, requestOptions, (res) => {
            
            // B"H - ROBUST STREAM READER
            // We must buffer events because 'read()' might be called slower than data arrives.
            const getReader = () => {
                const queue = [];
                let done = false;
                let error = null;
                
                // Triggers waiting for data
                let resolveNext = null;
                let rejectNext = null;

                // 1. Constantly listen to the stream (Flowing Mode)
                res.on('data', (chunk) => {
                    if (resolveNext) {
                        // Someone is waiting, give it immediately
                        const resolve = resolveNext;
                        resolveNext = null;
                        rejectNext = null;
                        resolve({ done: false, value: chunk });
                    } else {
                        // No one waiting, buffer it
                        queue.push(chunk);
                    }
                });

                res.on('end', () => {
                    done = true;
                    if (resolveNext) {
                        const resolve = resolveNext;
                        resolveNext = null;
                        resolve({ done: true, value: null });
                    }
                });

                res.on('error', (e) => {
                    error = e;
                    if (rejectNext) {
                        const reject = rejectNext;
                        rejectNext = null;
                        reject(e);
                    }
                });

                // 2. The Reader Interface
                return {
                    read: () => new Promise((resolve, reject) => {
                        // Error State
                        if (error) return reject(error);
                        
                        // Buffer has data? Return immediately.
                        if (queue.length > 0) {
                            return resolve({ done: false, value: queue.shift() });
                        }
                        
                        // Stream finished?
                        if (done) {
                            return resolve({ done: true, value: null });
                        }

                        // Wait for next event
                        resolveNext = resolve;
                        rejectNext = reject;
                    })
                };
            };

            // Response object to mimic the Fetch API
            const response = {
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                body: {
                    getReader: getReader
                },
                text: () => {
                    return new Promise((resolve, reject) => {
                        let data = '';
                        res.on('data', (chunk) => data += chunk);
                        res.on('end', () => resolve(data));
                        res.on('error', (e) => reject(e));
                    });
                },
                json: () => {
                    return new Promise((resolve, reject) => {
                        let data = '';
                        res.on('data', (chunk) => data += chunk);
                        res.on('end', () => {
                            try { resolve(JSON.parse(data)); } 
                            catch(e) { reject(e); }
                        });
                        res.on('error', (e) => reject(e));
                    });
                },
            };
            resolve(response);
        });

        req.on('error', (e) => {
            reject(e);
        });

        // Write the request body if present
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
                const [key, value] = pair.split('=').map(decodeURIComponent);
                this.append(key, value);
            });
        } else if (init instanceof URLSearchParams) {
            init.forEach((value, key) => {
                this.append(key, value);
            });
        } else if (typeof init === 'object') {
            Object.entries(init).forEach(([key, value]) => {
                this.append(key, value);
            });
        }
    }

    append(key, value) {
        if (this.params.has(key)) {
            this.params.get(key).push(value);
        } else {
            this.params.set(key, [value]);
        }
    }

    delete(key) {
        this.params.delete(key);
    }

    get(key) {
        const values = this.params.get(key);
        return values ? values[0] : null;
    }

    getAll(key) {
        return this.params.get(key) || [];
    }

    has(key) {
        return this.params.has(key);
    }

    set(key, value) {
        this.params.set(key, [value]);
    }

    toString() {
        const array = [];
        this.params.forEach((values, key) => {
            values.forEach(value => {
                array.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            });
        });
        return array.join('&');
    }

    forEach(callback, thisArg) {
        this.params.forEach((values, key) => {
            values.forEach(value => {
                callback.call(thisArg, value, key, this);
            });
        });
    }
}

class TextEncoder {
    constructor(encoding) {
        this.encoding = encoding;
    }
    decode(buffer, options) {
        return buffer.toString(this.encoding);
    }
}

module.exports = {fetch, TextEncoder, URLSearchParams};