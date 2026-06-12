// B"H
/**
 * @file index.js
 * @description
 * Chapter 10: The Two Gates Remember Their Names.
 *
 * The Awtsmoos gives breath to two listeners in this vessel: HTTP for the
 * visible page, SMTP for the hidden letter that knocks on port 25. The former
 * rises on port 8080 by default. The latter rises by default on port 25 again,
 * unless the human explicitly seals it with `AWTSMOOS_DISABLE_MAIL=true`.
 */

const http = require("http");
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;

/**
 * Boots the HTTP, dynamic, websocket, and SMTP vessels.
 *
 * @returns {Promise<void>} Resolves after startup work is attempted.
 */
async function go() {
    const mail = new AwtsMail();
    const dynamicServer = new AwtsServer(__dirname, mail);
    const wsServer = new AwtsSocket();

    dynamicServer.ws = wsServer;
    await dynamicServer.init();

    const httpServer = createHttpServer(dynamicServer, wsServer);
    await listenSafely(httpServer, getNumberEnv("PORT", DEFAULT_HTTP_PORT), "HTTP");
    await startMailSafely(mail);
}

/**
 * Creates the web server and websocket upgrade bridge.
 *
 * @param {object} dynamicServer Dynamic Awtsmoos server instance.
 * @param {object} wsServer WebSocket vessel.
 * @returns {import("http").Server} Configured server.
 */
function createHttpServer(dynamicServer, wsServer) {
    const httpServer = http.createServer(async (request, response) => {
        await dynamicServer.onRequest(request, response);
    });

    httpServer.on("upgrade", (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head);
    });

    return httpServer;
}

/**
 * Opens a TCP listener while turning startup errors into clear logs.
 *
 * @param {import("http").Server} server Server with a listen method.
 * @param {number} port Port to bind.
 * @param {string} label Human-readable listener name.
 * @returns {Promise<boolean>} True when the listener binds successfully.
 */
function listenSafely(server, port, label) {
    return new Promise(resolve => {
        let settled = false;
        const finish = value => {
            if (settled) return;
            settled = true;
            resolve(value);
        };

        server.once("error", error => {
            if (error.code === "EADDRINUSE") {
                console.log(`B"H - ${label} port ${port} is already in use; another process may already be alive.`);
                finish(false);
                return;
            }

            console.error(`B"H - ${label} listener failed on port ${port}:`, error);
            finish(false);
        });

        server.listen(port, () => {
            console.log(`B"H - ${label} listening on port ${port}.`);
            if (label === "HTTP") console.log(`Server running at http://127.0.0.1:${port}/`);
            console.log("Time:", Date.now());
            finish(true);
        });
    });
}

/**
 * Starts SMTP by default so awtsmoos.com can receive mail on port 25 again.
 *
 * @param {AwtsMail} mail Mail listener instance.
 * @returns {Promise<boolean>} True when SMTP binds successfully.
 */
async function startMailSafely(mail) {
    if (process.env.AWTSMOOS_DISABLE_MAIL === "true") {
        console.log("B\"H - Email server disabled by AWTSMOOS_DISABLE_MAIL=true.");
        return false;
    }

    const port = getNumberEnv("AWTSMOOS_MAIL_PORT", DEFAULT_MAIL_PORT);

    try {
        await mail.shoymayuh({ port });
        console.log(`B"H - Email server running on port ${port}.`);
        return true;
    } catch (error) {
        console.error(`B"H - Could not start email server on port ${port}:`, error);
        return false;
    }
}

/**
 * Reads a positive numeric environment variable.
 *
 * @param {string} name Environment variable name.
 * @param {number} fallback Fallback when unset or invalid.
 * @returns {number} Safe positive port-like number.
 */
function getNumberEnv(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

go().catch(error => {
    console.error("B\"H - Startup rupture:", error);
});
