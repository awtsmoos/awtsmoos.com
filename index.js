// B"H
/**
 * @file index.js
 * @description
 * Chapter 9: The Gatekeeper Refuses The False Throne.
 *
 * The Awtsmoos breathes the server into being through one practical vessel:
 * HTTP on port 8080. Optional mail is not allowed to seize port 25 and murder
 * the web gate during local game work. If mail is desired, the environment must
 * explicitly say `AWTSMOOS_START_MAIL=true`; otherwise the game server rises
 * cleanly and the compact-JS root can be tested by the real browser.
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
    const listening = await listenSafely(httpServer, Number(process.env.PORT) || DEFAULT_PORT);
    if (listening) await startMailSafely(mail);
}

/**
 * Creates the HTTP server and upgrade bridge.
 *
 * @param {object} dynamicServer Awtsmoos dynamic server instance.
 * @param {object} wsServer WebSocket handler.
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
 * @param {import("http").Server} httpServer Server to bind.
 * @param {number} port Port to listen on.
 * @returns {Promise<boolean>} True when this process owns the HTTP listener.
 */
function listenSafely(httpServer, port) {
    return new Promise(resolve => {
        httpServer.once("error", error => {
            if (error.code === "EADDRINUSE") {
                console.log(`B"H - Port ${port} is already in use; another server instance may already be alive.`);
                resolve(false);
                return;
            }

            console.error("B\"H - HTTP server failed to listen:", error);
            resolve(false);
        });

        httpServer.listen(port, () => {
            console.log("B\"H\n\n\n\n", `Server running at http://127.0.0.1:${port}/`);
            console.log("Time: ", Date.now());
            resolve(true);
        });
    });
}

/**
 * Starts optional mail only when explicitly requested.
 *
 * @param {object} mail AwtsMail instance.
 * @returns {Promise<void>} Resolves after mail startup is skipped or attempted.
 */
async function startMailSafely(mail) {
    if (process.env.AWTSMOOS_START_MAIL !== "true") {
        console.log("B\"H - Email server skipped; set AWTSMOOS_START_MAIL=true to enable it.");
        return;
    }

    try {
        await mail.shoymayuh();
        console.log("Email server running");
    } catch (error) {
        console.log("Could not start email server", error);
    }
}

go().catch(error => {
    console.error("B\"H - Startup rupture:", error);
});
