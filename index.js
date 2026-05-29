// B"H
/**
 * @file index.js
 * @description
 * Chapter 8: The Gatekeeper Learns Not To Shatter.
 *
 * This is the server entry. The old gate could crash when another Awtsmoos
 * instance already held port 8080. The log then screamed `EADDRINUSE`, even
 * though that usually means a server is already guarding the gate. This entry
 * now catches server listen errors and reports them as clear state instead of
 * an unhandled rupture.
 *
 * The Awtsmoos has no body and no form, yet every local server needs a vessel:
 * HTTP, WebSocket upgrade, dynamic routes, and optional mail. Each vessel is
 * guarded so a failure in one chamber does not tear the whole palace apart.
 */

const http = require("http");
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");

const DEFAULT_PORT = 8080;

/**
 * Boots the Awtsmoos HTTP, dynamic, websocket, and optional mail vessels.
 *
 * @returns {Promise<void>} Resolves after startup attempt is complete.
 */
async function go() {
    const mail = new AwtsMail();
    const dynamicServer = new AwtsServer(__dirname, mail);
    const wsServer = new AwtsSocket();

    dynamicServer.ws = wsServer;
    await dynamicServer.init();

    const httpServer = createHttpServer(dynamicServer, wsServer);
    await listenSafely(httpServer, Number(process.env.PORT) || DEFAULT_PORT);
    startMailSafely(mail);
}

/**
 * Creates the HTTP server and upgrade bridge.
 *
 * @param {object} dynamicServer - Awtsmoos dynamic server instance.
 * @param {object} wsServer - WebSocket handler.
 * @returns {import("http").Server} Configured HTTP server.
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
 * Listens without allowing EADDRINUSE to become an unhandled crash.
 *
 * @param {import("http").Server} httpServer - Server to bind.
 * @param {number} port - Port to listen on.
 * @returns {Promise<void>} Resolves when listening or when port is occupied.
 */
function listenSafely(httpServer, port) {
    return new Promise(resolve => {
        httpServer.once("error", error => {
            if (error.code === "EADDRINUSE") {
                console.log(`B"H - Port ${port} is already in use; another server instance may already be alive.`);
                resolve();
                return;
            }

            console.error("B\"H - HTTP server failed to listen:", error);
            resolve();
        });

        httpServer.listen(port, () => {
            console.log("B\"H\n\n\n\n", `Server running at http://127.0.0.1:${port}/`);
            console.log("Time: ", Date.now());
            resolve();
        });
    });
}

/**
 * Starts optional mail handling without tearing down the web server.
 *
 * @param {object} mail - AwtsMail instance.
 * @returns {void}
 */
function startMailSafely(mail) {
    try {
        mail.shoymayuh();
        console.log("Email server running");
    } catch (error) {
        console.log("Could not start email server", error);
    }
}

go().catch(error => {
    console.error("B\"H - Startup rupture:", error);
});
