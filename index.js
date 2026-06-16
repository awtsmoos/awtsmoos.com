// B"H
/**
 * @file index.js
 * @description
 * Chapter 11: The Browser Learns to Send Its Scrolls Home.
 *
 * The Awtsmoos gives breath to two listeners in this vessel: HTTP for the
 * visible page, SMTP for the hidden letter that knocks on port 25. The HTTP
 * gate now also accepts Mitzvah World autoplay reports and writes them to disk
 * so the local tunnel can inspect what the browser saw after the run.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const AwtsMail = require("./ayzarim/email/email.js");
const AwtsServer = require("./ayzarim/awtsmoosDynamicServer/index.js");
const AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_MAIL_PORT = 25;
const REPORT_DIR = path.join(__dirname, "geelooy", "games", "mitzvahWorld", "reports", "autoplay");

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

function createHttpServer(dynamicServer, wsServer) {
    const httpServer = http.createServer(async (request, response) => {
        if (await handleMitzvahWorldReport(request, response)) return;
        await dynamicServer.onRequest(request, response);
    });

    httpServer.on("upgrade", (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head);
    });

    return httpServer;
}

async function handleMitzvahWorldReport(request, response) {
    const url = new URL(request.url, "http://127.0.0.1");
    if (url.pathname === "/mitzvahWorld/autoplay-ping") {
        sendJson(response, 200, { ok: true, service: "mitzvahWorld-autoplay", time: Date.now() });
        return true;
    }

    if (url.pathname !== "/mitzvahWorld/autoplay-report" && url.pathname !== "/api/mitzvahWorld/autoplay-report") return false;
    if (request.method !== "POST") {
        sendJson(response, 405, { ok: false, error: "method_not_allowed" });
        return true;
    }

    try {
        const body = await readRequestBody(request, 2_000_000);
        const report = JSON.parse(body || "{}");
        const saved = await saveMitzvahReport(report);
        sendJson(response, 200, { ok: true, saved });
    } catch (error) {
        sendJson(response, 400, { ok: false, error: error.message || String(error) });
    }
    return true;
}

function readRequestBody(request, limit) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", chunk => {
            size += chunk.length;
            if (size > limit) {
                reject(new Error("report_too_large"));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        request.on("error", reject);
    });
}

async function saveMitzvahReport(report) {
    const jobId = sanitizeName(report.jobId || "unknown-job");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${stamp}-${jobId}.json`;
    const fullPath = path.join(REPORT_DIR, fileName);
    await fs.promises.mkdir(REPORT_DIR, { recursive: true });
    await fs.promises.writeFile(fullPath, JSON.stringify(report, null, 2), "utf8");
    await fs.promises.writeFile(path.join(REPORT_DIR, "latest.json"), JSON.stringify(report, null, 2), "utf8");
    console.log(`B"H - Mitzvah World autoplay report saved: ${fullPath}`);
    return { fileName, path: fullPath };
}

function sanitizeName(value) {
    return String(value).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "unknown";
}

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { "content-type": "application/json", "access-control-allow-origin": "*" });
    response.end(JSON.stringify(payload));
}

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

function getNumberEnv(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

go().catch(error => {
    console.error("B\"H - Startup rupture:", error);
});
