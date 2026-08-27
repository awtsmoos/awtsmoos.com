// B"H
/**
 * @module AwtsMail
 * @description
 * Chapter 12: The Letter-Gate Answers Without Breaking.
 *
 * The Awtsmoos renews speech from nothing every instant; this SMTP vessel
 * receives that speech line by line, turns commands into state, and hands the
 * completed letter to the dynamic server's ingress soul. Even when a rushed
 * client flees mid-answer, the gate does not scream into a closed stream.
 */

const net = require("net");
const AwtsmoosClient = require("./awtsmoosEmailClient.js");

const CRLF = "\r\n";
const DEFAULT_PORT = 25;

module.exports = class AwtsMail {
    /** Builds the SMTP listener without binding it yet. */
    constructor() {
        console.log("B\"H - Starting instance of email.");
        this.smtpClient = new AwtsmoosClient();
        this.server = net.createServer(socket => this.handleConnection(socket));
    }

    /**
     * Handles a single SMTP client connection.
     *
     * @param {import("net").Socket} socket SMTP socket.
     * @returns {void}
     */
    handleConnection(socket) {
        const state = createSessionState();
        safeWrite(socket, "220 awtsmoos.com ESMTP Essence of Reality");
        socket.on("data", chunk => this.handleChunk({ socket, state, chunk }));
        socket.on("error", error => console.log("B\"H - SMTP socket error:", error));
        socket.on("close", () => console.log("B\"H - SMTP connection closed."));
    }

    /**
     * Handles buffered SMTP data and complete CRLF-delimited commands.
     *
     * @param {object} input Chunk bundle.
     * @returns {void}
     */
    handleChunk({ socket, state, chunk }) {
        state.buffer += chunk.toString();
        let index;
        while ((index = state.buffer.indexOf(CRLF)) !== -1 && !socket.destroyed) {
            const line = state.buffer.substring(0, index);
            state.buffer = state.buffer.substring(index + CRLF.length);
            this.handleLine({ socket, state, line });
        }
    }

    /**
     * Routes one SMTP line through data-based command handlers.
     *
     * @param {object} input Line bundle.
     * @returns {void}
     */
    handleLine({ socket, state, line }) {
        if (state.receivingData) return this.handleDataLine({ socket, state, line });

        const handlers = {
            EHLO: () => writeLines(socket, ["250-Hello", "250 SMTPUTF8"]),
            HELO: () => writeLines(socket, ["250-Hello", "250 SMTPUTF8"]),
            MAIL: () => {
                state.sender = normalizeMailbox(line.slice(10));
                safeWrite(socket, "250 2.1.0 Ok");
                console.log("B\"H - SMTP sender:", state.sender);
            },
            RCPT: () => {
                state.recipients.push(normalizeMailbox(line.slice(8)));
                safeWrite(socket, "250 2.1.5 Ok");
            },
            DATA: () => {
                state.receivingData = true;
                safeWrite(socket, "354 End data with <CR><LF>.<CR><LF>");
            },
            RSET: () => {
                const preservedBuffer = state.buffer;
                Object.assign(state, createSessionState(), { buffer: preservedBuffer });
                safeWrite(socket, "250 2.0.0 Ok");
            },
            NOOP: () => safeWrite(socket, "250 2.0.0 Ok"),
            QUIT: () => {
                safeWrite(socket, "221 2.0.0 Bye");
                socket.end();
            }
        };

        const verb = String(line.split(/\s+/)[0] || "").toUpperCase();
        const handler = handlers[verb];
        if (handler) handler();
        else safeWrite(socket, "500 5.5.1 Error: unknown command");
    }

    /**
     * Receives message body lines until the SMTP terminator dot arrives.
     *
     * @param {object} input Data line bundle.
     * @returns {void}
     */
    handleDataLine({ socket, state, line }) {
        if (line !== ".") {
            state.data += line + CRLF;
            return;
        }

        state.receivingData = false;
        safeWrite(socket, "250 2.0.0 Ok: queued as awtsmoos");
        this.gotMail({ sender: state.sender, recipients: state.recipients, data: state.data });
        state.data = "";
    }

    /**
     * Binds the SMTP listener.
     *
     * @param {object|number} options Port number or options object.
     * @param {number} [options.port=25] Port to bind.
     * @returns {Promise<boolean>} Resolves true when listening.
     */
    shoymayuh(options = {}) {
        const port = typeof options === "number" ? options : Number(options.port) || DEFAULT_PORT;
        return new Promise((resolve, reject) => {
            const onError = error => {
                this.server.off("listening", onListening);
                reject(error);
            };
            const onListening = () => {
                this.server.off("error", onError);
                console.log(`B"H - Awtsmoos mail listening to you, port ${port}.`);
                resolve(true);
            };
            this.server.once("error", onError);
            this.server.once("listening", onListening);
            this.server.listen(port);
        });
    }

    /**
     * Default ingress hook, replaced by the dynamic server during init.
     *
     * @param {object} message Completed message.
     * @returns {void}
     */
    gotMail(message) {
        console.log("B\"H - I've got mail", message.sender, message.recipients);
    }
};

/** @returns {object} Fresh mutable SMTP session state. */
function createSessionState() {
    return { sender: "", recipients: [], data: "", receivingData: false, buffer: "" };
}

/**
 * Writes a CRLF SMTP response only while the socket can still receive it.
 *
 * @param {import("net").Socket} socket SMTP socket.
 * @param {string} line Response line without CRLF.
 * @returns {boolean} True when write was attempted.
 */
function safeWrite(socket, line) {
    if (!socket || socket.destroyed || socket.writableEnded) return false;
    socket.write(line + CRLF);
    return true;
}

/**
 * Writes multiple SMTP response lines safely.
 *
 * @param {import("net").Socket} socket SMTP socket.
 * @param {string[]} lines Response lines.
 * @returns {void}
 */
function writeLines(socket, lines) {
    for (const line of lines) if (!safeWrite(socket, line)) return;
}

/**
 * Normalizes SMTP mailbox syntax into the raw email address.
 *
 * @param {string} value SMTP address fragment.
 * @returns {string} Clean mailbox.
 */
function normalizeMailbox(value) {
    return String(value || "").replace(/^\s*(FROM|TO):\s*/i, "").replace(/[<>]/g, "").trim();
}
