
// B"H
/**
 * @file centralLogger.js
 * @description
 *  Authoritative Scribe of the Essence.
 *  Aggressively flushes log entries to prevent memory hoarding during 
 *  massive synchronous simulations.
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(process.cwd(), 'awtsmoos.log.txt');

let lastLogSignature = null;
let repeatCount = 0;
let logBuffer = [];

function flushLogs() {
    if (logBuffer.length === 0) return;
    try {
        fs.appendFileSync(LOG_FILE_PATH, logBuffer.join(""));
    } catch(e) {}
    logBuffer = [];
}

process.on('exit', flushLogs);

module.exports = {
    resetLog() {
        try {
            fs.writeFileSync(LOG_FILE_PATH, `B"H - Essence Stream Reset: ${new Date().toISOString()}\n\n`);
            lastLogSignature = null; repeatCount = 0; logBuffer = [];
        } catch (e) {}
    },

    log(scope, msg, data) {
        let content = `${scope} ${msg}`;
        let rawDataStr = "";

        if (data !== undefined) {
            try {
                if (Buffer.isBuffer(data)) rawDataStr = ` <Buffer len=${data.length}>`;
                else if (typeof data === 'object') rawDataStr = ` [Object]`;
                else rawDataStr = ` ${String(data)}`;
            } catch (e) { rawDataStr = ` [Complex]`; }
        }

        const fullLine = content + rawDataStr;
        if (fullLine === lastLogSignature) { repeatCount++; return; }

        if (repeatCount > 0) {
            logBuffer.push(`B"H ... (Repeated ${repeatCount} times) ...\n`);
            repeatCount = 0;
        }

        lastLogSignature = fullLine;
        const now = new Date().toISOString();
        logBuffer.push(`[${now}] B"H ${fullLine}\n`);
        
        // B"H: THE TIKKUN OF SILENCE
        // Contracted from 10,000 down to 50 lines. The memory remains pure.
        if (logBuffer.length > 50) flushLogs();

        // Console Filtering: Maintain Sefirotic criticals only
        const isCritical = scope.includes("FATAL") || scope.includes("ERROR") || scope.includes("TEST") || scope.includes("SIMULATION");
        if (isCritical) {
            process.stdout.write(`\x1b[33mB"H ${content}\x1b[0m\n`);
        }
    },

    section(title) {
        this.log("=== SESSION ===", title);
        logBuffer.push(`\n========================================\nB"H ${title}\n========================================\n\n`);
        flushLogs();
    }
};
