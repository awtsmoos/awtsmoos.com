// B"H
/**
 * @file centralLogger.js
 * @description
 *  Authoritative Scribe of the Essence.
 *  Suppresses high-frequency console noise while ensuring absolute file integrity.
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(process.cwd(), 'awtsmoos.log.txt');

// Deduplication state
let lastLogSignature = null;
let repeatCount = 0;

module.exports = {
    resetLog() {
        try {
            fs.writeFileSync(LOG_FILE_PATH, `B"H - Universal Essence Stream Reset: ${new Date().toISOString()}\n\n`);
            lastLogSignature = null;
            repeatCount = 0;
        } catch (e) {}
    },

    log(scope, msg, data) {
        let content = `${scope} ${msg}`;
        let rawDataStr = "";

        if (data !== undefined) {
            try {
                if (Buffer.isBuffer(data)) {
                    rawDataStr = ` <Buffer len=${data.length} val=${data.subarray(0, 16).toString('hex')}...>`;
                } else if (typeof data === 'object') {
                    rawDataStr = ` ${JSON.stringify(data, (k, v) => (k === 'db' || k === 'allocator' || k === 'parent' || k === 'context') ? '[Ref]' : v)}`;
                } else {
                    rawDataStr = ` ${String(data)}`;
                }
            } catch (e) { rawDataStr = ` [ComplexData]`; }
        }

        const fullLine = content + rawDataStr;

        if (fullLine === lastLogSignature) {
            repeatCount++;
            return;
        }

        if (repeatCount > 0) {
            const repeatMsg = `... (Preceding logic repeated ${repeatCount} times) ...`;
            try { fs.appendFileSync(LOG_FILE_PATH, `B"H ${repeatMsg}\n`); } catch(e) {}
            repeatCount = 0;
        }

        lastLogSignature = fullLine;
        const now = new Date().toISOString();
        const fileEntry = `[${now}] B"H ${fullLine}\n`;

        // Always log to physical file synchronously
        try {
            fs.appendFileSync(LOG_FILE_PATH, fileEntry);
        } catch(e) {}

        // Console Filtering: Silence the Malchut noise, keep the Sefirotic criticals.
        const isMalchutNoise = scope.includes("NAV") || scope.includes("READER") || msg.includes("resolve") || msg.includes("Found ptr");
        const isGevurahCritical = scope.includes("FATAL") || scope.includes("ALLOC") || scope.includes("BUILDER") || scope.includes("DICT") || scope.includes("MAP");

        if (!isMalchutNoise || isGevurahCritical) {
            const color = isGevurahCritical ? "\x1b[33m" : "\x1b[36m";
            process.stdout.write(`${color}B"H ${content}\x1b[0m\n`);
        }
    },

    section(title) {
        this.log("=== SESSION ===", title);
        try {
            fs.appendFileSync(LOG_FILE_PATH, `\n========================================\nB"H ${title}\n========================================\n\n`);
        } catch(e) {}
    }
};