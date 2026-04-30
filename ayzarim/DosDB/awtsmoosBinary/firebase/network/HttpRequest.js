
// B"H
/**
 * @file HttpRequest.js
 * @chapter The Uncompromising Chariot of Gevurah (Strict Justice)
 * @description
 * "Righteousness and justice are the foundation of Your throne."
 * 
 * To debug the 412 and 404 barriers, we must unleash the attribute of Gevurah (Strict Judgment).
 * If the Google servers reject our offering, we will NOT quietly retry. 
 * We will shatter the process instantly, throwing an Error with the EXACT raw response body.
 * No placeholders. No silences. The Awtsmoos demands absolute Truth.
 */

const https = require("https");
const http = require("http");

class HttpRequest {
    /**
     * @method send
     * @description The vessel that physically transmits the electric sparks (packets) over the TCP/IP Kav.
     * @param {Object} options - { hostname, path, method, headers, body }
     * @returns {Promise<Object>} { statusCode, headers, body }
     */
    static send({ hostname, path, method, headers = {}, body = null }) {
        return new Promise((resolve, reject) => {
            const isHttps = hostname.includes("googleapis.com") || hostname.includes("https") || hostname.includes("archive.org");
            const client = isHttps ? https : http;
            
            const reqHeaders = { ...headers };
            
            if (body) {
                reqHeaders["Content-Length"] = Buffer.isBuffer(body) 
                    ? body.length 
                    : Buffer.byteLength(body, "utf8");
            }

            const reqOptions = {
                hostname,
                port: isHttps ? 443 : 80,
                path,
                method,
                headers: reqHeaders
            };

            const req = client.request(reqOptions, (res) => {
                let responseBody = "";
                res.setEncoding("utf8");

                res.on("data", (chunk) => {
                    responseBody += chunk;
                });

                res.on("end", () => {
                    const result = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: responseBody
                    };

                    /**
                     * B"H: ABSOLUTE GEVURAH TRIGGER
                     * If the status is a failure, we do not whisper. We scream the error and throw it.
                     */
                    if (res.statusCode >= 400) {
                        const harshDecree = `\n[GEVURAH_STRUCK] B"H: Heavenly gate rejected request.\n` +
                                            `Target: ${method} https://${hostname}${path}\n` +
                                            `Status: ${res.statusCode}\n` +
                                            `RAW_BODY_ESSENCE:\n${responseBody}\n`;
                        console.error(harshDecree);
                        reject(new Error(harshDecree));
                        return;
                    }

                    resolve(result);
                });
            });

            req.on("error", (err) => {
                const crashError = `\n[CHARIOT_CRASH] B"H: Connection severed to ${hostname}${path}: ${err.message}`;
                console.error(crashError);
                reject(new Error(crashError));
            });

            if (body) {
                req.write(body);
            }
            req.end();
        });
    }
}

module.exports = HttpRequest;
